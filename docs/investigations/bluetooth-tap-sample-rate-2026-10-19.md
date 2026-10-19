# Bluetooth tap sample-rate qualification (#1165, #1166)

Leon reports that a 13m34s Google Meet call with a Nothing Ear (a) headset in
16 kHz HFP saved the remote speaker into the first third of the system stem,
followed by digital silence. His exact 3x slow-down recovered intelligible,
aligned audio. This is attributed evidence from the issue, not a headset
reproduction by this change.

The old callback held the process tap's format read before aggregate creation,
used that rate for the entire recording, and included the physical output
device in its private aggregate. It also combined a buffer's channel count
with a potentially stale cached count using `max`, which can halve mono frames.

The repair uses a tap-only private aggregate, requests 16 kHz at the HAL boundary,
and treats the aggregate input stream's actual virtual format as authoritative.
An off-audio-thread property listener publishes coherent format snapshots to the
callback. The sample clock carries fractional time across callback and rate
boundaries; complete output chunks retain their sequence and accumulation.
Interleaved channel counts come from the delivered buffer headers. Format
notifications are unregistered and drained before device destruction; callbacks
retained after a removal failure cannot query a destroyed stream.

This follows the tap/aggregate model described in
[Apple's capture sample](https://developer.apple.com/documentation/CoreAudio/capturing-system-audio-with-core-audio-taps)
and the tap-only aggregate and nominal-rate setup in
[Chromium's capture implementation](https://chromium.googlesource.com/chromium/src/+/a4545b03c738f0a84468a7f70066c85f80d6b23d/media/audio/mac/catap_audio_input_stream.mm).

Synthetic coverage measures tone pitch and duration at 8, 16, 44.1, 48 and
96 kHz, irregular callback lengths, fractional phase through rate changes,
invalid-rate rejection, and the actual macOS callback through a three-second
stereo/HFP/stereo sequence.

A signed Minutes Dev acceptance check additionally exercised the real generic
dual-source recording path with AirPods selected for input and output (24 kHz
microphone, initially 48 kHz output). The saved 16 kHz system stem contains
a 900 Hz tone for 3.00 seconds, a 1.00-second gap and a 600 Hz tone for 3.00
seconds. All three stems have matching 14.20-second lengths. An initial
amplitude-only detector missed the quiet tones behind louder app sounds;
frequency-selective analysis found the expected pattern. Mat independently
confirmed hearing both tones. This is an AirPods hardware result, not a
reproduction on the reporter's 16 kHz Nothing headset or every mid-call route
transition. Capture used a separate test profile with no speech model; the
expected missing-model error after stop concerns processing, and the WAVs
remained intact. Historical damaged recordings are not automatically altered: a 3x correction is valid only when
that recording's evidence establishes the ratio.


## Contribution and source identity

This change starts from Leon Weber's PR #1166, commit
`250221ad84b7257e0a4c7cf0e85633dd8ae6520b`, preserved in the branch ancestry.
His patch identifies the aggregate-rate mismatch and introduces a live rate
listener. The qualification changes additionally use the actual virtual input
stream format, keep property access off the audio callback, handle channel
changes and listener lifetime, preserve fractional time, and avoid opening a
physical headset device as a second aggregate input/clock.

The final backend source SHA-256 is
`c80b8602dd8166b220ee620a6a3d987cf87cb89eff89329b6163db1449fda9fd`.
It is byte-identical to the backend built and exercised in the signed AirPods
acceptance candidate `95d028897292f7d3a96817bf41e7e153acbd55f0`. The rest of the
combined runtime source likewise matches that already-tested candidate; this
branch separates the capture review from the maintenance fixes. The recorded
WAVs remain private. No recording audio is included in this repository.

Native checks passed: 2,009 model-free core tests (one ignored), 10 streaming
audio-backend tests, 24 relay tests, whole-workspace no-default-features Clippy
and a signed installed Dev build. The original amplitude detector failed its
threshold check and was corrected by frequency analysis; that initial failure
is not a capture failure or an erased result. The app's default recording and
transcription backends remain unchanged. A packaged release is separate.

The [machine-readable native receipt](bluetooth-tap-sample-rate-2026-10-19.json)
records the source digest, input/output rates, saved frame counts, expected and
measured tone intervals, and the frequency-selective analysis method. It contains
measurements only, with no captured audio.
