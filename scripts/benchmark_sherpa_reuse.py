#!/usr/bin/env python3
"""Compare recognizer lifetimes using only the two checked-in public WAVs.

This measures the installed plugin, not the complete Minutes pipeline. It does
not capture audio, read configuration, write meeting records, or measure energy.
Run sequentially on an idle machine; do not run competing ASR benchmarks.
Example:
  python3 scripts/benchmark_sherpa_reuse.py --plugin /path/to/libminutes_sherpa.dylib \
    --model-dir /path/to/parakeet-tdt-0.6b-v3-int8 --output /tmp/reuse.json
"""

from __future__ import annotations

import argparse
import array
import ctypes
import hashlib
import json
import platform
import resource
import subprocess
import sys
import time
import wave
from datetime import datetime, timezone
from pathlib import Path

from verify_sherpa_plugin_loads import HOST_SOURCE, host_abi_version

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = ("apple-speech-dictation.wav", "apple-speech-meeting.wav")


def sha256(path: Path) -> str:
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def fixture(name: str) -> dict:
    path = ROOT / "tests/eval/fixtures/audio" / name
    with wave.open(str(path), "rb") as wav:
        if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) != (1, 2, 16000):
            raise ValueError(f"unsupported fixture format: {name}")
        pcm = array.array("h", wav.readframes(wav.getnframes()))
    if sys.byteorder != "little":
        pcm.byteswap()
    samples = (ctypes.c_float * len(pcm))(*(x / 32768.0 for x in pcm))
    return {"name": name, "sha256": sha256(path), "seconds": len(pcm) / 16000,
            "samples": samples}


class Plugin:
    def __init__(self, path: Path, model_dir: Path):
        self.lib = ctypes.CDLL(str(path.resolve()))
        self.lib.minutes_sherpa_abi_version.restype = ctypes.c_uint32
        self.abi = self.lib.minutes_sherpa_abi_version()
        expected = host_abi_version(HOST_SOURCE.read_text())
        if self.abi != expected:
            raise ValueError(f"plugin ABI {self.abi} differs from host ABI {expected}")
        self.model_dir = str(model_dir.resolve()).encode()
        self.lib.minutes_sherpa_create.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_size_t]
        self.lib.minutes_sherpa_create.restype = ctypes.c_void_p
        self.lib.minutes_sherpa_transcribe.argtypes = [ctypes.c_void_p, ctypes.c_uint32,
                                                       ctypes.POINTER(ctypes.c_float), ctypes.c_size_t]
        self.lib.minutes_sherpa_transcribe.restype = ctypes.c_void_p
        self.lib.minutes_sherpa_free_string.argtypes = [ctypes.c_void_p]
        self.lib.minutes_sherpa_free_string.restype = None
        self.lib.minutes_sherpa_destroy.argtypes = [ctypes.c_void_p]
        self.lib.minutes_sherpa_destroy.restype = None

    def create(self):
        error = ctypes.create_string_buffer(4096)
        handle = self.lib.minutes_sherpa_create(self.model_dir, error, len(error))
        if not handle:
            raise RuntimeError(error.value.decode(errors="replace"))
        return handle

    def transcribe(self, handle, audio):
        pointer = self.lib.minutes_sherpa_transcribe(handle, 16000, audio, len(audio))
        if not pointer:
            raise RuntimeError("plugin returned null transcript")
        try:
            return ctypes.string_at(pointer).decode("utf-8")
        finally:
            self.lib.minutes_sherpa_free_string(pointer)

    def destroy(self, handle):
        self.lib.minutes_sherpa_destroy(handle)


def measure(plugin: Plugin, mode: str, sequence: list[dict]) -> dict:
    started, cpu_started = time.perf_counter(), time.process_time()
    handle = None
    setup_ms, teardown_ms, chunks = [], [], []
    try:
        for index, audio in enumerate(sequence):
            if handle is None:
                before = time.perf_counter()
                handle = plugin.create()
                setup_ms.append((time.perf_counter() - before) * 1000)
            before = time.perf_counter()
            text = plugin.transcribe(handle, audio["samples"])
            decode_ms = (time.perf_counter() - before) * 1000
            chunks.append({"index": index, "fixture": audio["name"],
                           "decode_ms": decode_ms,
                           "text_sha256": hashlib.sha256(text.encode()).hexdigest(),
                           "text_characters": len(text)})
            if mode == "reload":
                before = time.perf_counter()
                plugin.destroy(handle)
                handle = None
                teardown_ms.append((time.perf_counter() - before) * 1000)
    finally:
        if handle:
            before = time.perf_counter()
            plugin.destroy(handle)
            teardown_ms.append((time.perf_counter() - before) * 1000)
    seconds = time.perf_counter() - started
    usage = resource.getrusage(resource.RUSAGE_SELF)
    return {"mode": mode, "wall_seconds": seconds,
            "cpu_seconds": time.process_time() - cpu_started,
            "audio_seconds": sum(a["seconds"] for a in sequence),
            "model_loads": len(setup_ms), "setup_ms": setup_ms,
            "teardown_ms": teardown_ms, "chunks": chunks,
            "process_lifetime_peak_rss_bytes": usage.ru_maxrss * (1 if sys.platform == "darwin" else 1024)}


def run(args) -> dict:
    audio = [fixture(name) for name in FIXTURES]
    model_hashes = {name: sha256(args.model_dir / name) for name in
                    ("encoder.int8.onnx", "decoder.int8.onnx", "joiner.int8.onnx", "tokens.txt")}
    plugin = Plugin(args.plugin, args.model_dir)
    report = {"schema": 1, "started_at": datetime.now(timezone.utc).isoformat(),
              "source_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
              "platform": platform.platform(), "python": platform.python_version(),
              "plugin_sha256": sha256(args.plugin), "abi": plugin.abi,
              "model_sha256": model_hashes,
              "fixtures": [{k: v for k, v in a.items() if k != "samples"} for a in audio],
              "method": "Direct offline plugin ABI; same PCM chunks in both modes; hashes, not transcript text.",
              "limitations": ["Not full pipeline or live streaming", "No energy measurement",
                              "Two short English fixtures only", "Filesystem caches are not flushed",
                              "Peak RSS is cumulative across this process, not per-mode memory"],
              "runs": []}
    # Hashing reads the model into the filesystem cache. All trials use that
    # same condition; these are model initialization timings, not cold disk IO.
    sequence = audio * args.repeats
    for trial in range(args.trials):
        modes = ("reload", "reuse") if trial % 2 == 0 else ("reuse", "reload")
        for mode in modes:
            print(f"trial {trial + 1}/{args.trials}: {mode}, {len(sequence)} chunks", file=sys.stderr, flush=True)
            result = measure(plugin, mode, sequence)
            result["trial"] = trial + 1
            report["runs"].append(result)
    expected = {}
    mismatches = []
    for run in report["runs"]:
        for chunk in run["chunks"]:
            name = chunk["fixture"]
            digest = chunk["text_sha256"]
            if expected.setdefault(name, digest) != digest or chunk["text_characters"] == 0:
                mismatches.append({"trial": run["trial"], "mode": run["mode"], "chunk": chunk["index"]})
    report["output_equivalent_and_nonempty"] = not mismatches
    report["output_mismatches"] = mismatches
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plugin", type=Path, required=True)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--repeats", type=int, default=3, help="Repeats of the two public clips per trial")
    parser.add_argument("--trials", type=int, default=3)
    args = parser.parse_args()
    if not 1 <= args.repeats <= 100 or not 1 <= args.trials <= 10:
        parser.error("repeats must be 1..100 and trials 1..10")
    # Reserve output before costly inference and refuse to overwrite receipts.
    with args.output.open("x", encoding="utf-8") as out:
        report = run(args)
        json.dump(report, out, indent=2)
        out.write("\n")
    print(json.dumps({"output": str(args.output),
                      "output_equivalent_and_nonempty": report["output_equivalent_and_nonempty"]}))
    return 0 if report["output_equivalent_and_nonempty"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
