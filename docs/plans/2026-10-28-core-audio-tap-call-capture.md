# Core Audio tap for call audio (FaceTime, iPhone calls, everything else)

Issue: #1266 (follow-up to the PR #1267 remote-silence alert). Branch `feat/core-audio-tap-call-capture`, stacked on `fix/remote-silence-alert-1266`.

## Problem

The native call helper (`tauri/src-tauri/src/system_audio_record.swift`) took "the other side" from ScreenCaptureKit (`SCStreamConfiguration.capturesAudio`). ScreenCaptureKit only hears audio owned by applications. FaceTime audio is rendered by the `avconferenced` daemon and Continuity iPhone calls by `callservicesd`, so the system stem was delivered but digitally silent (-91 dB on 2026-10-28, twice). This is architectural, not a permission problem.

A Core Audio process tap (macOS 14.2+, `AudioHardwareCreateProcessTap` with a global `CATapDescription`) reads process output at the HAL and hears daemons. Audio Hijack records FaceTime and the macOS 26 Phone app this way (a macOS 26.0 regression was fixed in 26.1). The CLI's opt-in `core-audio-tap` backend (`crates/core/src/system_audio_backend.rs`) already uses the same tap-only private aggregate.

## Where the audio is consumed (verified)

- Transcription and diarization use the PCM stems (`<base>.voice.wav`, `<base>.system.wav`), never the `.mov` (dual-track decode bug #234).
- The live remote-silence detector (#1267) reads `call_audio_level` / `call_audio_live` from the helper `health` event.
- So the tap feeds the system stem writer and the health levels. The `.mov` and the microphone stay on ScreenCaptureKit.

## Design (as built, after adversarial review)

### Swift helper (`system_audio_tap.swift`, wired into `system_audio_record.swift`)

- `SystemAudioTap`: mono global tap excluding only the helper (matches ScreenCaptureKit's `excludesCurrentProcessAudio`), private, unmuted; private tap-only aggregate with drift compensation and no hardware subdevice. No tap auto-start (it makes `AudioDeviceStart` wait for the first tapped audio).
- Sample rate is read live: seeded from the aggregate's nominal rate and updated by a listener, because the IOProc runs at 16 kHz once a Bluetooth headset enters HFP for the call. A rate fixed at start was #1165 (stem 3x fast). A measured-rate check over 10 s rebuilds the tap if the reported rate is more than 15% off.
- Lifecycle: built on its own control queue after ScreenCaptureKit is `ready` (mic first). Rebuilt only when it stops calling back while ScreenCaptureKit still hears audio, or on a rate mismatch; 3 rebuilds a minute, then a 30 s rest on ScreenCaptureKit and a retry. Stop removes listeners, stops IO, drains the IO queue, destroys the aggregate and the tap, with a bounded wait (the control queue can be inside `AudioDeviceStart` on a first-run prompt). Late buffers are dropped by the existing `stemsClosed` latch.
- `SystemAudioSourceArbiter` (pure, self-tested): the tap writes the system stem while it is live; ScreenCaptureKit takes over while the tap is not delivering, or after it has been clearly louder (4x, peak-hold levels) for 2 s of signal. Reason `tap_silent_while_screencapturekit_active` when the tap never heard anything (refused permission), `screencapturekit_louder_than_tap` otherwise. The tap takes the stem back after 0.5 s of being clearly louder. Evidence older than 10 s is forgotten; transitions are capped.
- Shared stem timeline: both stems are placed on host time from one origin (first buffer of either stem). The voice stem's first buffer is padded onto it if the system stem started first. Every system-stem buffer is placed at its host timestamp (tap `mHostTime`, ScreenCaptureKit PTS): a late source pads, a stall becomes silence, drift beyond 50 ms (tap) or 100 ms (ScreenCaptureKit) is corrected by padding or trimming. Padding no longer resets the resampler.
- Existing bug fixed on the way: `convertMonoBuffer` signalled `.endOfStream` and then reused the converter, which returns nothing after end of stream, so every buffer after a rate change was dropped. It now signals `.noDataNow`.
- Events: `system_audio_source {source, reason}`, `system_audio_tap_started|rebuilt|failed|rate_mismatch|stop_timeout` (typed fields only). `health` gains `call_audio_source`, `call_audio_tap_heard`, `call_audio_tap_seconds`, `call_audio_screencapturekit_seconds`.
- Signing: release bundles already carry the app entitlements (including `com.apple.security.device.audio-input`) on the helper. The Dev installer now signs it the same way, since reading a tap is in-process audio input under hardened runtime.

### Rust

- `call_capture.rs` parses the new events and health fields, logs them via `log_step`, saves a capture warning for lossy switches, and raises a one-shot "Allow System Audio Recording for Minutes" notice when the tap looked refused.
- `recording_health.call_audio_source`: `core-audio-tap`, `screencapturekit` or `mixed`, from the per-source seconds. Reader crate, SDK, schema doc and snapshot updated.
- Remote-silence alert copy follows the capture path: with the tap active and silent all along it points at the permission; with the tap hearing audio it points at the output device; the FaceTime caveat stays only for ScreenCaptureKit.

## Not in scope (follow-ups)

- A permission probe outside a call (tap a muted tone the helper plays itself) so the first-run prompt and a refusal are handled at onboarding, not mid-call. Today a refusal on a FaceTime call is detected only by the alert copy, since ScreenCaptureKit is silent there too.
- FaceTime / Phone call detection for the call banner (detection by `avconferenced` running input).
- Moving the microphone off ScreenCaptureKit; locking the voice stem to host time as well.
- Narrowing the tap to call apps on macOS 26 (`CATapDescription.bundleIDs`); see the privacy note in `docs/architecture/core-audio-process-tap.md`.

## Verification

- CI: arbiter (19 checks) and stem timeline self-tests, plus the existing PCM, lifecycle and recovery self-tests, run through `cargo test` on macOS.
- Signed Minutes Dev, from the app (never a shell, which would attribute the permission to the terminal): first recording shows the System Audio Recording prompt; `~/.minutes/logs/minutes.log` shows `system_audio_tap_started` and `native_call_audio_source` `core_audio_tap`.
- Mat: FaceTime Audio call, an iPhone call answered on the Mac with AirPods, and a Zoom/Meet control call. Pass = remote speech in the live transcript and the saved meeting, `call_audio_source: core-audio-tap`, no remote-silence alert, stems the same length.
- Refusal path: `tccutil reset AudioCapture com.useminutes.desktop.dev`, deny the prompt, record a Zoom call: falls back to ScreenCaptureKit within about 2 s of Zoom audio, notice shown once, warning saved.
