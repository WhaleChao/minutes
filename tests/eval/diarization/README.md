# Paired offline diarization evaluation

This measures anonymous speaker activity on specified files. It does not run
ASR, enroll people, use the microphone, play audio, upload data, or qualify
native capture or the desktop UI. `UNKNOWN` is abstention and cannot become a
reference identity through optimal label mapping.

The checked-in manifest pins two complete human AMI meetings and their RTTMs.
Attribution: **AMI Meeting Corpus, AMI Project**. Audio and annotations are
[CC-BY-4.0](https://groups.inf.ed.ac.uk/ami/). RTTM conversion:
[pyannote/AMI-diarization-setup](https://github.com/pyannote/AMI-diarization-setup),
commit `67c2d539286e89f68952d5dcf83912bd9f01dfae`, `only_words` test split.
Neither recording was used to tune this implementation. AMI is a common model
benchmark; this is not a claim of model-training independence or blinding.

Downloads are explicit. Put these four files in an owned directory:

- [EN2002a.Array1-01.wav](https://groups.inf.ed.ac.uk/ami/AMICorpusMirror/amicorpus/EN2002a/audio/EN2002a.Array1-01.wav)
- [EN2002a.rttm](https://raw.githubusercontent.com/pyannote/AMI-diarization-setup/67c2d539286e89f68952d5dcf83912bd9f01dfae/only_words/rttms/test/EN2002a.rttm)
- [EN2002b.Array1-01.wav](https://groups.inf.ed.ac.uk/ami/AMICorpusMirror/amicorpus/EN2002b/audio/EN2002b.Array1-01.wav)
- [EN2002b.rttm](https://raw.githubusercontent.com/pyannote/AMI-diarization-setup/67c2d539286e89f68952d5dcf83912bd9f01dfae/only_words/rttms/test/EN2002b.rttm)

The runner verifies every audio and reference SHA256 before either executable
runs. Models must already be installed in the supplied public-model directory.
Build the same `crates/core/examples/diarize_file.rs` harness at baseline and
candidate revisions:

```bash
cargo build -p minutes-core --no-default-features --features diarize --example diarize_file
```

For a historical baseline that predates the example, copy only that harness
into its own checkout before building. Preserve the baseline source revision,
the exact harness, and the resulting executable. Do not replace either binary
during evaluation. The report hashes both executables and both model files.

```bash
python3 tests/eval/diarization/run.py \
  --manifest tests/eval/diarization/ami-holdout.json \
  --audio-directory /owned/ami \
  --models /owned/models \
  --baseline /owned/baseline-diarize-file \
  --candidate /owned/candidate-diarize-file \
  --baseline-revision BASELINE_SHA \
  --candidate-revision CANDIDATE_SHA \
  --output /owned/results
```

The manifest declares the gate before candidate evaluation: weighted DER must
improve at least five percentage points over the clock-fixed baseline, no file
may regress more than three percentage points, and candidate RTF must remain
below 0.25. A failing gate returns exit code 2. DER uses one optimal mapping over
each complete recording, zero collar, and includes overlap. Runtime is measured
by the harness, not read from a candidate's self-report. Reports include misses,
false alarms, confusion, UNKNOWN duration, and speaker counts. Local stderr
stays in separate files; inspect it locally before sharing.

Use `python3 -m unittest discover -s tests/eval/diarization -p 'test_*.py'`
for scoring and abstention regressions. See
[the research and admission decision](../../../docs/investigations/diarization-quality-2026-10-18.md)
for scope, development fixtures, model compatibility, and what these results
cannot establish. Do not tune on this holdout and continue calling it untouched.

The earlier IS1009a/TS3003a admission is retained in `ami-first-admission.json`.
Its first candidate missed the unchanged five-point improvement gate (4.38 points).
Those recordings are now development data, not an untouched holdout. The current
global clustering candidate was frozen before evaluating EN2002a/EN2002b. Both
new recordings share speakers; this does not establish broad population quality.
