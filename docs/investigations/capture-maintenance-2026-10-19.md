# Capture and desktop maintenance triage, 2026-10-19

The source baseline is main `7b1d508657d396349b766492bf7340936aab30fd`.
These investigations concern GH #1159, #1161, #1162, #1163 and #1165.
The reports below distinguish contributor measurements from synthetic checks.
No customer audio was accessed or rewritten.

## Bluetooth tap timing (#1165)

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

## Relay polling (#1159)

Adriannoes measured approximately 75% of one CPU core during recording with
live transcription off. Source inspection confirms the relay reparsed every
active and rotated event log on its 10 ms loop. This work removes that path;
it does not claim a new measured CPU percentage on the contributor's machine.

A follower snapshots its starting sequence and byte position under the writer
lock, reads at most 64 KiB per poll and retains incomplete lines up to a bounded
256 KiB. Idle polling reads zero historical bytes. On rotation it drains the
held descriptor and discovers successor archives before the active file,
using cross-platform file identity and a sequence watermark to prevent replay.
It handles multiple rotations, missing files, truncation and replacement.
Durable polling runs every 100 ms independently of the 10 ms accept/partial
loop. Existing replay/query APIs and relay reconnect buffering are preserved.

## Child ownership (#1162, #1163)

Title refinement keeps the existing agent invocation and authentication policy,
but runs through the existing bounded-child process-tree supervisor. Its
120-second deadline retires descendants and reaps the direct child. Stdout
and stderr drain concurrently with finite retention, and prompt files are
removed on every result path. The timeout regression checks a real synthetic
shell plus descendant and proves the parent is already reaped.

Detached notification and Settings launches transfer their child handles to
one asynchronous helper reaper. It starts before a child can be launched;
thread-start failure therefore cannot orphan a new child. A slow helper cannot
hold up reaping other exited helpers, and the UI never waits for normal helper
exit. Only the three reported launch sites change.

## Stored offers (#1161)

A persisted offer is restored only when both versions are valid SemVer and
the offer is strictly newer. Comparison handles numeric components,
prereleases, large numeric identifiers and ignored build metadata. Equal,
older, corrupt and invalid offers are cleared; Dev builds continue clearing
stored offers. The shipped JavaScript controller has executable restoration
tests and a CI step. This does not change update-check or install policy.

## Recording-sidecar option (#1160)

A default-on recording-only opt-out is a reasonable separate enhancement.
All recording paths share `start_live_sidecar`, including stem-tail capture;
standalone Live uses a different entry point. Simply suppressing the shared
sidecar is insufficient for a complete user-facing change: attached current-
speech, partial and coaching consumers must accurately report that live text
is unavailable, and stop-time WAV transcription must remain unchanged.
The enhancement is tracked separately as `minutes-wqev`; no default or sidecar
behavior changes in these bug fixes. The contributor's local measurements
remain attributed evidence, not a qualification result for an unimplemented flag.

## Native qualification notes

The canonical installer produced a strictly verified `com.useminutes.desktop.dev`
bundle signed by the existing Apple Development identity, team `63TMLKT8HN`.
Its CGEventTap diagnostic passed. Background SSH signing failed with
`errSecInternalComponent`; one minimal probe reproduced it, and the same
canonical installer succeeded from a fresh Terminal window. No keychain
password was handled. Production Minutes was not replaced.

Fresh-process verification caught an old installed Dev process launched with
custom test arguments: the installer had matched only a bare executable command.
That exact test profile was verified idle and quit cooperatively. The installer
now discovers argument-bearing instances and refuses automatic replacement when
custom arguments make the CLI activity profile uncertain. Similarly named
binaries are excluded. The corrected matcher was exercised with bare, argument-
bearing and lookalike process fixtures.

The full model-free suite exposed a pre-existing cancellation-test race: the
fixture both completed its delayed marker and requested cancellation at two
seconds. It now waits until its real descendant exists, cancels and checks that
the descendant is dead. A separate QMD output-budget test failed during the
first broad run and passed in isolation; its source was unchanged. Full-suite
results are recorded separately from these focused checks.

The final native model-free run passed 2,009 tests, with one deliberately ignored.
The streaming audio-backend suite passed 10 tests and the relay suite passed 24.
Whole-workspace no-default-features Clippy, formatting, coverage auditing and
the static website build passed. The stored-offer controller passed its three
Node tests; the signed app rendered a simulated offer, cleared it on Dev restart,
and dismissed it through the actual Later button. Dev was returned to the
normal profile after the test. These results do not imply a packaged release.
