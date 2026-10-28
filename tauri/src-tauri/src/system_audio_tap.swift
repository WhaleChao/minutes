import AudioToolbox
import CoreAudio
import Dispatch
import Foundation
import os

// Call audio through a Core Audio process tap (#1266).
//
// ScreenCaptureKit only hears audio owned by applications. FaceTime audio is
// rendered by the avconferenced daemon and iPhone calls answered on the Mac
// by callservicesd, so ScreenCaptureKit delivers frames that are digitally
// silent for the whole call. A global process tap reads process output at the
// HAL and hears those daemons too, so it is the primary source for the system
// stem. ScreenCaptureKit keeps running as the fallback and as a witness: a tap
// refused System Audio Recording access still returns noErr everywhere and
// delivers exact zeros, so the evidence of a refusal is ScreenCaptureKit
// hearing audio the tap does not.

enum SystemAudioSource: String {
    case coreAudioTap = "core_audio_tap"
    case screenCaptureKit = "screencapturekit"
}

/// Level on the helper's 0-100 health scale (`rms * 2000`). 2 is roughly
/// -60 dBFS, the silence floor the remote-silence alert (#1267) uses.
let systemAudioSignalLevel: UInt32 = 2

func systemAudioLevel(rms: Float) -> UInt32 {
    UInt32(min(100.0, max(0.0, Double(rms) * 2000.0)))
}

/// Host time in seconds, the clock both Core Audio timestamps and
/// ScreenCaptureKit presentation timestamps are expressed in.
func hostSeconds(_ hostTime: UInt64 = AudioGetCurrentHostTime()) -> Double {
    Double(AudioConvertHostTimeToNanos(hostTime)) / 1_000_000_000
}

/// Peak-hold level with a short exponential release, so two sources carrying
/// the same audio compare equal even though their buffers arrive tens of
/// milliseconds apart.
struct RecentLevel {
    static let releaseSeconds = 0.3
    private var peak = 0.0
    private var at = 0.0

    func value(now: Double) -> Double {
        guard now >= at else { return peak }
        return peak * exp(-(now - at) / Self.releaseSeconds)
    }

    mutating func observe(_ level: UInt32, now: Double) {
        peak = max(Double(level), value(now: now))
        at = now
    }
}

/// Decides which source writes the system stem. Pure state, driven by buffer
/// observations with explicit timestamps, so the self-test can replay any
/// sequence. Confined to the helper's sample queue.
///
/// The tap is preferred. ScreenCaptureKit takes over only while the tap is not
/// delivering buffers, or after ScreenCaptureKit has been clearly louder for
/// two seconds of signal (a refused tap is exact zeros; a tap that somehow
/// misses an app is quieter). The tap takes the stem back after half a second
/// of being clearly louder (FaceTime, or the user just allowed access).
struct SystemAudioSourceArbiter {
    static let tapLiveWindow = 1.0
    static let demoteAfterSeconds = 2.0
    static let promoteAfterSeconds = 0.5
    static let dominanceRatio = 4.0
    /// Dominance evidence older than this is forgotten, so a few stray
    /// notification sounds spread over an hour cannot add up to a demotion.
    static let evidenceMemorySeconds = 10.0
    static let maxTransitions = 6

    struct Transition: Equatable {
        let source: SystemAudioSource
        let reason: String
    }

    private(set) var tapRunning = false
    private(set) var demoted = false
    private(set) var demotionReason: String?
    private(set) var transitions = 0
    /// Since the current tap started. A refused tap never sets it.
    private(set) var tapHeardSignal = false
    private var lastTapBufferAt: Double?
    private var tapLevel = RecentLevel()
    private var witnessLevel = RecentLevel()
    private var witnessLouderSeconds = 0.0
    private var witnessLouderAt = -Double.infinity
    private var tapLouderSeconds = 0.0
    private var tapLouderAt = -Double.infinity
    private var reported: SystemAudioSource?
    private var reportedTap = false

    func activeSource(now: Double) -> SystemAudioSource {
        guard tapRunning, !demoted, let last = lastTapBufferAt,
              now - last < Self.tapLiveWindow else { return .screenCaptureKit }
        return .coreAudioTap
    }

    /// A start or a rebuild. Keeps an earlier demotion: a rebuilt tap that is
    /// still refused would otherwise flap. Clears the comparison windows so a
    /// rebuild's warm-up cannot be read as a refusal.
    mutating func tapStarted() {
        tapRunning = true
        lastTapBufferAt = nil
        tapHeardSignal = false
        tapLevel = RecentLevel()
        witnessLouderSeconds = 0
        tapLouderSeconds = 0
    }

    mutating func tapStopped() {
        tapRunning = false
        lastTapBufferAt = nil
        witnessLouderSeconds = 0
        tapLouderSeconds = 0
    }

    mutating func observeTap(seconds: Double, allZero: Bool, level: UInt32, now: Double) {
        guard tapRunning else { return }
        lastTapBufferAt = now
        if !allZero { tapHeardSignal = true }
        tapLevel.observe(level, now: now)
        let witness = witnessLevel.value(now: now)
        guard level >= systemAudioSignalLevel else { return }
        if Double(level) * Self.dominanceRatio >= witness {
            // Comparable or louder: the tap is hearing the call.
            witnessLouderSeconds = 0
        }
        guard demoted, Double(level) > Self.dominanceRatio * witness,
              transitions < Self.maxTransitions else {
            if demoted, witness >= Double(systemAudioSignalLevel) { tapLouderSeconds = 0 }
            return
        }
        if now - tapLouderAt > Self.evidenceMemorySeconds { tapLouderSeconds = 0 }
        tapLouderAt = now
        tapLouderSeconds += seconds
        if tapLouderSeconds >= Self.promoteAfterSeconds {
            demoted = false
            demotionReason = nil
            tapLouderSeconds = 0
            transitions += 1
        }
    }

    mutating func observeScreenCaptureKit(seconds: Double, level: UInt32, now: Double) {
        witnessLevel.observe(level, now: now)
        // Only a live tap can be judged. Startup latency and stalls are the
        // live window's job, never evidence of a refusal.
        guard tapRunning, !demoted, let last = lastTapBufferAt,
              now - last < Self.tapLiveWindow, level >= systemAudioSignalLevel else { return }
        let tap = tapLevel.value(now: now)
        guard Double(level) > Self.dominanceRatio * tap else {
            if tap >= Double(systemAudioSignalLevel) { witnessLouderSeconds = 0 }
            return
        }
        if now - witnessLouderAt > Self.evidenceMemorySeconds { witnessLouderSeconds = 0 }
        witnessLouderAt = now
        witnessLouderSeconds += seconds
        if witnessLouderSeconds >= Self.demoteAfterSeconds, transitions < Self.maxTransitions {
            demoted = true
            demotionReason = tapHeardSignal
                ? "screencapturekit_louder_than_tap"
                : "tap_silent_while_screencapturekit_active"
            witnessLouderSeconds = 0
            tapLouderSeconds = 0
            transitions += 1
        }
    }

    /// Returns a transition once per change of the effective source.
    mutating func takeTransition(now: Double) -> Transition? {
        let source = activeSource(now: now)
        guard source != reported else { return nil }
        reported = source
        defer { if source == .coreAudioTap { reportedTap = true } }
        let reason: String
        switch source {
        case .coreAudioTap:
            reason = reportedTap ? "tap_signal_returned" : "tap_started"
        case .screenCaptureKit:
            if let demotionReason, demoted { reason = demotionReason }
            else if !tapRunning { reason = "tap_unavailable" }
            else if lastTapBufferAt == nil { reason = "tap_pending" }
            else { reason = "tap_stalled" }
        }
        return Transition(source: source, reason: reason)
    }
}

/// Positions a buffer on the shared stem timeline (#1266). Both stems are
/// laid out on host time from one origin, so the system stem stays aligned
/// with the voice stem however late its source started and however its clock
/// drifts. Pure arithmetic; the recorder applies the result.
struct StemPlacement: Equatable {
    /// Seconds of silence to insert before the buffer.
    var padSeconds = 0.0
    /// Seconds to drop from the start of the buffer (the stem is ahead).
    var dropSeconds = 0.0

    static func place(
        bufferStart: Double,
        bufferSeconds: Double,
        written: Double,
        tolerance: Double
    ) -> StemPlacement {
        let delta = bufferStart - written
        if delta > tolerance { return StemPlacement(padSeconds: delta) }
        if delta < -tolerance { return StemPlacement(dropSeconds: min(-delta, bufferSeconds)) }
        return StemPlacement()
    }
}

func runSystemAudioArbiterSelfTest() -> Bool {
    var checks: [Bool] = []
    let tick = 0.1

    // FaceTime: the tap hears the call, ScreenCaptureKit is silent.
    var facetime = SystemAudioSourceArbiter()
    facetime.tapStarted()
    checks.append(facetime.takeTransition(now: 0) == .init(source: .screenCaptureKit, reason: "tap_pending"))
    for step in 1..<100 {
        let now = Double(step) * tick
        facetime.observeTap(seconds: tick, allZero: false, level: 30, now: now)
        facetime.observeScreenCaptureKit(seconds: tick, level: 0, now: now)
    }
    checks.append(facetime.activeSource(now: 9.95) == .coreAudioTap)
    checks.append(facetime.takeTransition(now: 9.95) == .init(source: .coreAudioTap, reason: "tap_started"))

    // Refused permission: the tap is exact zeros while ScreenCaptureKit hears
    // a Zoom call with pauses. Demote after two seconds of signal, not sooner.
    var refused = SystemAudioSourceArbiter()
    refused.tapStarted()
    // The recorder reports right after the tap starts, before any buffer.
    var reasons: [String] = refused.takeTransition(now: 0).map { [$0.reason] } ?? []
    var demotedAt: Double?
    for step in 0..<60 {
        let now = Double(step) * tick
        let speaking = step % 3 != 0
        refused.observeTap(seconds: tick, allZero: true, level: 0, now: now)
        if let transition = refused.takeTransition(now: now) { reasons.append(transition.reason) }
        refused.observeScreenCaptureKit(seconds: tick, level: speaking ? 25 : 0, now: now)
        if let transition = refused.takeTransition(now: now) { reasons.append(transition.reason) }
        if demotedAt == nil, refused.activeSource(now: now) == .screenCaptureKit { demotedAt = now }
    }
    checks.append(demotedAt.map { $0 >= 2.7 && $0 <= 3.2 } ?? false)

    // The user clicks Allow on the first-run prompt and a FaceTime call is
    // live: the tap hears audio ScreenCaptureKit cannot and takes it back.
    for step in 60..<70 {
        let now = Double(step) * tick
        refused.observeTap(seconds: tick, allZero: false, level: 20, now: now)
        refused.observeScreenCaptureKit(seconds: tick, level: 0, now: now)
        if let transition = refused.takeTransition(now: now) { reasons.append(transition.reason) }
    }
    checks.append(refused.activeSource(now: 6.95) == .coreAudioTap)
    checks.append(reasons == ["tap_pending", "tap_started", "tap_silent_while_screencapturekit_active", "tap_signal_returned"])

    // Both silent (nobody talking, nothing playing): never demote.
    var quiet = SystemAudioSourceArbiter()
    quiet.tapStarted()
    for step in 0..<600 {
        let now = Double(step) * tick
        quiet.observeTap(seconds: tick, allZero: true, level: 0, now: now)
        quiet.observeScreenCaptureKit(seconds: tick, level: 0, now: now)
    }
    checks.append(quiet.activeSource(now: 59.95) == .coreAudioTap)

    // Normal call: both hear it, ScreenCaptureKit's buffers lag the tap's
    // and land between them. Comparable levels never demote.
    var zoom = SystemAudioSourceArbiter()
    zoom.tapStarted()
    for step in 0..<600 {
        let now = Double(step) * tick
        let level: UInt32 = step % 7 < 4 ? 12 : 0
        zoom.observeTap(seconds: tick, allZero: level == 0, level: level, now: now)
        zoom.observeScreenCaptureKit(seconds: tick, level: step % 7 < 4 ? 15 : 0, now: now + 0.05)
    }
    checks.append(zoom.activeSource(now: 59.95) == .coreAudioTap)

    // A tap that hears something but misses the call app: demoted with its
    // own reason, not blamed on permission.
    var partial = SystemAudioSourceArbiter()
    partial.tapStarted()
    partial.observeTap(seconds: tick, allZero: false, level: 5, now: 0)
    for step in 1..<40 {
        let now = Double(step) * tick
        partial.observeTap(seconds: tick, allZero: false, level: 1, now: now)
        partial.observeScreenCaptureKit(seconds: tick, level: 30, now: now)
    }
    checks.append(partial.demoted && partial.demotionReason == "screencapturekit_louder_than_tap")

    // ScreenCaptureKit signal before the tap's first buffer is not counted.
    var late = SystemAudioSourceArbiter()
    late.tapStarted()
    for step in 0..<30 {
        late.observeScreenCaptureKit(seconds: tick, level: 40, now: Double(step) * tick)
    }
    late.observeTap(seconds: tick, allZero: false, level: 5, now: 3.0)
    checks.append(late.activeSource(now: 3.05) == .coreAudioTap)

    // A tap that stops calling back hands the stem to ScreenCaptureKit
    // without being marked refused, and takes it back when it returns.
    var stall = SystemAudioSourceArbiter()
    stall.tapStarted()
    stall.observeTap(seconds: tick, allZero: false, level: 5, now: 0)
    _ = stall.takeTransition(now: 0.05)
    checks.append(stall.activeSource(now: 1.5) == .screenCaptureKit)
    checks.append(stall.takeTransition(now: 1.5)?.reason == "tap_stalled")
    checks.append(!stall.demoted)
    stall.observeTap(seconds: tick, allZero: true, level: 0, now: 1.6)
    checks.append(stall.activeSource(now: 1.65) == .coreAudioTap)

    // Scattered louder-witness blips spread out in time never add up.
    var blips = SystemAudioSourceArbiter()
    blips.tapStarted()
    var now = 0.0
    for _ in 0..<30 {
        blips.observeTap(seconds: tick, allZero: true, level: 0, now: now)
        blips.observeScreenCaptureKit(seconds: tick, level: 40, now: now)
        for _ in 0..<150 {
            now += tick
            blips.observeTap(seconds: tick, allZero: true, level: 0, now: now)
        }
    }
    checks.append(!blips.demoted)

    // Flapping is bounded: after maxTransitions the arbiter stays put.
    var flap = SystemAudioSourceArbiter()
    flap.tapStarted()
    now = 0
    for _ in 0..<10 {
        for _ in 0..<25 {
            flap.observeTap(seconds: tick, allZero: true, level: 0, now: now)
            flap.observeScreenCaptureKit(seconds: tick, level: 25, now: now)
            now += tick
        }
        for _ in 0..<10 {
            flap.observeTap(seconds: tick, allZero: false, level: 25, now: now)
            now += tick
        }
    }
    checks.append(flap.transitions == SystemAudioSourceArbiter.maxTransitions)

    // Timeline placement: a late source pads, an early one drops, jitter is
    // left alone, and a drop never exceeds the buffer.
    checks.append(StemPlacement.place(bufferStart: 1.4, bufferSeconds: 0.01, written: 0, tolerance: 0.05)
        == StemPlacement(padSeconds: 1.4))
    checks.append(StemPlacement.place(bufferStart: 9.9, bufferSeconds: 0.01, written: 10, tolerance: 0.05)
        == StemPlacement(dropSeconds: 0.01))
    checks.append(StemPlacement.place(bufferStart: 10.03, bufferSeconds: 0.01, written: 10, tolerance: 0.05)
        == StemPlacement())

    let passed = checks.allSatisfy { $0 }
    let failed = checks.enumerated().filter { !$0.element }.map { $0.offset }
    if let data = try? JSONSerialization.data(withJSONObject: [
        "event": "system_audio_arbiter_self_test",
        "status": passed ? "ok" : "failed",
        "checks": checks.count,
        "failed_checks": failed,
    ]), let json = String(data: data, encoding: .utf8) {
        print(json)
        fflush(stdout)
    }
    return passed
}

struct SystemAudioTapFailure: Error {
    let stage: String
    let status: OSStatus
}

private func checkStatus(_ status: OSStatus, _ stage: String) throws {
    guard status == noErr else { throw SystemAudioTapFailure(stage: stage, status: status) }
}

private func globalAddress(_ selector: AudioObjectPropertySelector) -> AudioObjectPropertyAddress {
    AudioObjectPropertyAddress(
        mSelector: selector,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
}

/// One tap plus the private aggregate device that exposes it as an input
/// stream. Not reusable: the recorder builds a new instance for every start
/// or rebuild, and calls `start`/`stop` from one control queue.
@available(macOS 14.2, *)
final class SystemAudioTap {
    /// Mono samples, their sample rate, and the host time of the first one.
    typealias SampleHandler = (_ samples: [Float], _ sampleRate: Double, _ startHost: Double) -> Void

    private let ioQueue = DispatchQueue(label: "minutes.system-audio.tap-io", qos: .userInitiated)
    private let onSamples: SampleHandler
    private var tapID = AudioObjectID(kAudioObjectUnknown)
    private var aggregateID = AudioObjectID(kAudioObjectUnknown)
    private var procID: AudioDeviceIOProcID?
    private var started = false
    private var rateListener: AudioObjectPropertyListenerBlock?
    private let listenerQueue = DispatchQueue(label: "minutes.system-audio.tap-rate")
    /// The IOProc delivers at the aggregate device's current rate, which
    /// drops to 16 kHz when a Bluetooth headset enters HFP for the call. A
    /// rate fixed at start played the stem 3x fast in the CLI tap (#1165).
    private let sampleRate = OSAllocatedUnfairLock(initialState: 0.0)
    private(set) var format = AudioStreamBasicDescription()

    var currentSampleRate: Double { sampleRate.withLock { $0 } }

    init(onSamples: @escaping SampleHandler) {
        self.onSamples = onSamples
    }

    deinit { stop() }

    func start() throws {
        do {
            try createTap()
            try readFormat()
            try createAggregate()
            seedAndWatchSampleRate()
            try startIO()
        } catch {
            stop()
            throw error
        }
    }

    /// Idempotent. After it returns no sample callback is running or will
    /// start, and the HAL objects are gone.
    func stop() {
        if let rateListener, aggregateID != kAudioObjectUnknown {
            var address = globalAddress(kAudioDevicePropertyNominalSampleRate)
            AudioObjectRemovePropertyListenerBlock(aggregateID, &address, listenerQueue, rateListener)
        }
        rateListener = nil
        if aggregateID != kAudioObjectUnknown, let procID {
            if started { AudioDeviceStop(aggregateID, procID) }
            AudioDeviceDestroyIOProcID(aggregateID, procID)
        }
        procID = nil
        started = false
        // IOBlocks are dispatched synchronously, so after AudioDeviceStop no
        // new one begins; this waits out one that was already running.
        ioQueue.sync {}
        if aggregateID != kAudioObjectUnknown {
            AudioHardwareDestroyAggregateDevice(aggregateID)
            aggregateID = AudioObjectID(kAudioObjectUnknown)
        }
        if tapID != kAudioObjectUnknown {
            AudioHardwareDestroyProcessTap(tapID)
            tapID = AudioObjectID(kAudioObjectUnknown)
        }
    }

    private func createTap() throws {
        // Exclude only this helper (it renders no audio of its own), which
        // matches ScreenCaptureKit's excludesCurrentProcessAudio, so the
        // witness comparison stays like for like.
        var excluded: [AudioObjectID] = []
        if let own = Self.processObject(for: getpid()) { excluded.append(own) }
        let description = CATapDescription(monoGlobalTapButExcludeProcesses: excluded)
        description.name = "Minutes call audio"
        description.isPrivate = true
        description.muteBehavior = CATapMuteBehavior.unmuted
        var created = AudioObjectID(kAudioObjectUnknown)
        try checkStatus(AudioHardwareCreateProcessTap(description, &created), "create_tap")
        tapID = created
    }

    private func readFormat() throws {
        var address = globalAddress(kAudioTapPropertyFormat)
        var size = UInt32(MemoryLayout<AudioStreamBasicDescription>.size)
        var asbd = AudioStreamBasicDescription()
        try checkStatus(AudioObjectGetPropertyData(tapID, &address, 0, nil, &size, &asbd), "read_format")
        guard asbd.mFormatID == kAudioFormatLinearPCM,
              asbd.mFormatFlags & kAudioFormatFlagIsFloat != 0,
              asbd.mFormatFlags & kAudioFormatFlagIsBigEndian == 0,
              asbd.mBitsPerChannel == 32,
              (1...64).contains(asbd.mChannelsPerFrame),
              (8_000...384_000).contains(asbd.mSampleRate) else {
            throw SystemAudioTapFailure(stage: "unsupported_format", status: OSStatus(bitPattern: asbd.mFormatID))
        }
        format = asbd
    }

    private func createAggregate() throws {
        var uidAddress = globalAddress(kAudioTapPropertyUID)
        var uidSize = UInt32(MemoryLayout<CFString>.size)
        var tapUID: Unmanaged<CFString>?
        try checkStatus(AudioObjectGetPropertyData(tapID, &uidAddress, 0, nil, &uidSize, &tapUID), "read_tap_uid")
        guard let tapUID = tapUID?.takeRetainedValue() else {
            throw SystemAudioTapFailure(stage: "read_tap_uid", status: -1)
        }
        // Tap-only and private, like the CLI tap backend: no hardware
        // subdevice is opened, so starting it cannot add another device's
        // input streams or change a Bluetooth headset's profile mid-call. No
        // tap auto-start: it makes AudioDeviceStart wait for the first tapped
        // audio, which on a quiet call may be minutes away.
        let description: [String: Any] = [
            kAudioAggregateDeviceNameKey: "Minutes call audio",
            kAudioAggregateDeviceUIDKey: "com.useminutes.call-audio.\(UUID().uuidString)",
            kAudioAggregateDeviceIsPrivateKey: true,
            kAudioAggregateDeviceIsStackedKey: false,
            kAudioAggregateDeviceSubDeviceListKey: [] as [Any],
            kAudioAggregateDeviceTapListKey: [[
                kAudioSubTapUIDKey: tapUID as String,
                kAudioSubTapDriftCompensationKey: true,
            ]],
        ]
        var created = AudioObjectID(kAudioObjectUnknown)
        try checkStatus(
            AudioHardwareCreateAggregateDevice(description as CFDictionary, &created),
            "create_aggregate"
        )
        aggregateID = created
    }

    private func seedAndWatchSampleRate() {
        var address = globalAddress(kAudioDevicePropertyNominalSampleRate)
        var rate = Float64(0)
        var size = UInt32(MemoryLayout<Float64>.size)
        let status = AudioObjectGetPropertyData(aggregateID, &address, 0, nil, &size, &rate)
        let seeded = status == noErr && rate > 0 ? rate : format.mSampleRate
        sampleRate.withLock { $0 = seeded }
        let aggregate = aggregateID
        let box = sampleRate
        let listener: AudioObjectPropertyListenerBlock = { _, _ in
            var address = globalAddress(kAudioDevicePropertyNominalSampleRate)
            var rate = Float64(0)
            var size = UInt32(MemoryLayout<Float64>.size)
            if AudioObjectGetPropertyData(aggregate, &address, 0, nil, &size, &rate) == noErr, rate > 0 {
                let updated = rate
                box.withLock { $0 = updated }
            }
        }
        if AudioObjectAddPropertyListenerBlock(aggregateID, &address, listenerQueue, listener) == noErr {
            rateListener = listener
        }
    }

    private func startIO() throws {
        let channels = Int(format.mChannelsPerFrame)
        let interleaved = format.mFormatFlags & kAudioFormatFlagIsNonInterleaved == 0
        let handler = onSamples
        let box = sampleRate
        var created: AudioDeviceIOProcID?
        try checkStatus(AudioDeviceCreateIOProcIDWithBlock(&created, aggregateID, ioQueue) {
            _, inputData, inputTime, _, _ in
            let buffers = UnsafeMutableAudioBufferListPointer(UnsafeMutablePointer(mutating: inputData))
            guard let first = buffers.first, first.mDataByteSize > 0 else { return }
            let floatSize = MemoryLayout<Float>.size
            var mono: [Float]
            if interleaved {
                guard let data = first.mData else { return }
                let frames = Int(first.mDataByteSize) / (floatSize * channels)
                guard frames > 0 else { return }
                let samples = data.assumingMemoryBound(to: Float.self)
                mono = [Float](repeating: 0, count: frames)
                for frame in 0..<frames {
                    var sum: Float = 0
                    for channel in 0..<channels { sum += samples[frame * channels + channel] }
                    mono[frame] = sum / Float(channels)
                }
            } else {
                let frames = Int(first.mDataByteSize) / floatSize
                guard frames > 0 else { return }
                mono = [Float](repeating: 0, count: frames)
                var used = 0
                for buffer in buffers {
                    guard let data = buffer.mData, Int(buffer.mDataByteSize) / floatSize >= frames else { continue }
                    let samples = data.assumingMemoryBound(to: Float.self)
                    for frame in 0..<frames { mono[frame] += samples[frame] }
                    used += 1
                }
                guard used > 0 else { return }
                if used > 1 { for frame in 0..<frames { mono[frame] /= Float(used) } }
            }
            let hasHostTime = inputTime.pointee.mFlags.contains(.hostTimeValid)
            let start = hasHostTime ? hostSeconds(inputTime.pointee.mHostTime) : hostSeconds()
            handler(mono, box.withLock { $0 }, start)
        }, "create_io_proc")
        procID = created
        // This is the call that raises the System Audio Recording prompt the
        // first time. A refusal still returns noErr; see the arbiter.
        try checkStatus(AudioDeviceStart(aggregateID, created), "start_io")
        started = true
    }

    static func processObject(for pid: pid_t) -> AudioObjectID? {
        var address = globalAddress(kAudioHardwarePropertyTranslatePIDToProcessObject)
        var pid = pid
        var object = AudioObjectID(kAudioObjectUnknown)
        var size = UInt32(MemoryLayout<AudioObjectID>.size)
        let status = AudioObjectGetPropertyData(
            AudioObjectID(kAudioObjectSystemObject), &address,
            UInt32(MemoryLayout<pid_t>.size), &pid, &size, &object
        )
        guard status == noErr, object != kAudioObjectUnknown else { return nil }
        return object
    }
}
