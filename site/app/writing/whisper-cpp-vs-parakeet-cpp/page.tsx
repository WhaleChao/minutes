import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whisper vs Parakeet v3 for local transcription | minutes",
  description:
    "How NVIDIA's Parakeet v3 compares with Whisper for local transcription: published benchmarks, our own measurements on a Mac, where Whisper still wins, and what Minutes picks by default.",
  alternates: {
    canonical: "/writing/whisper-cpp-vs-parakeet-cpp",
  },
};

const linkClass =
  "text-[var(--text)] underline decoration-[color:var(--border-mid)] underline-offset-2 hover:text-[var(--accent)]";

const headingClass =
  "pt-4 font-serif text-[26px] leading-tight tracking-[-0.02em] text-[var(--text)]";

const leaderboard = {
  headers: ["Model", "Average", "AMI meetings", "LibriSpeech other", "Speed (RTFx)"],
  rows: [
    ["Whisper large-v3", "7.44%", "15.95%", "3.91%", "146"],
    ["Parakeet v3", "6.32%", "11.39%", "3.59%", "3,333"],
  ],
};

const ourRun = {
  headers: ["Engine", "Word error rate", "Median time per clip"],
  rows: [
    ["Parakeet v3 (int8)", "3.46%", "151 ms"],
    ["Whisper medium", "4.45%", "759 ms"],
    ["Whisper small (Minutes default)", "5.81%", "290 ms"],
  ],
};

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[color:var(--border)] bg-[var(--bg-elevated)]">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[color:var(--border)]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-[color:var(--border)] last:border-b-0">
              {row.map((cell, i) => (
                <td
                  key={`${row[0]}-${headers[i]}`}
                  className={`px-4 py-3 font-mono text-[13px] ${
                    i === 0 ? "text-[var(--text)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Post() {
  return (
    <div className="mx-auto max-w-[680px] px-6 pb-16 sm:px-8">
      <nav className="flex items-center justify-between border-b border-[color:var(--border)] py-4">
        <a href="/" className="font-mono text-[15px] font-medium text-[var(--text)]">
          minutes
        </a>
        <div className="flex gap-x-6 text-sm text-[var(--text-secondary)]">
          <a href="/writing" className="hover:text-[var(--accent)]">
            Writing
          </a>
          <a
            href="https://github.com/silverstein/minutes"
            className="hover:text-[var(--accent)]"
          >
            GitHub
          </a>
        </div>
      </nav>

      <article className="pt-14">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          2026-07-11 · updated 2026-10-27 · Mat Silverstein
        </p>
        <h1 className="font-serif text-[36px] leading-[1.05] tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
          Whisper vs Parakeet v3 for local transcription
        </h1>

        <div className="mt-8 space-y-5 text-[16px] leading-[1.75] text-[var(--text-secondary)]">
          <p>
            When I first wrote this in July, the answer was simple: Minutes used Whisper, and
            Parakeet stayed switched off. That has changed. Since version 0.31.0, Minutes runs
            NVIDIA&apos;s Parakeet v3 inside its own process on Apple Silicon Macs, and installing
            it takes one click. Whisper is still there, and for some people it is still the right
            engine. Here is how the two compare on published benchmarks and on our own audio, and
            where each one falls short.
          </p>

          <h2 className={headingClass}>What changed</h2>
          <p>
            The July version of this post was about{" "}
            <a href="https://github.com/Frikallo/parakeet.cpp" className={linkClass}>
              parakeet.cpp
            </a>
            , a local port of Parakeet that only accepts audio as a file path. Minutes never
            writes private audio to a named file that another process on your Mac could open, so
            we left that integration off. It is still off.
          </p>
          <p>
            Parakeet v3 now runs through{" "}
            <a href="https://k2-fsa.github.io/sherpa/onnx/index.html" className={linkClass}>
              sherpa-onnx
            </a>{" "}
            instead, loaded as a plugin inside the Minutes process. It receives audio the same way
            Whisper does, as samples in memory, so no new copy of your audio touches disk. The
            model is parakeet-tdt-0.6b-v3 in int8 form, a 639&nbsp;MB download from a pinned
            Hugging Face revision. Minutes checks every file against its SHA-256 before using it.
          </p>

          <h2 className={headingClass}>The published numbers</h2>
          <p>
            NVIDIA released{" "}
            <a href="https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3" className={linkClass}>
              Parakeet v3
            </a>{" "}
            in August 2025. It has 600 million parameters, covers 25 European languages with
            automatic language detection, writes punctuation and capitals, and is licensed CC BY
            4.0. NVIDIA&apos;s{" "}
            <a href="https://arxiv.org/abs/2509.14128" className={linkClass}>
              paper
            </a>{" "}
            reports these word error rates on the Hugging Face Open ASR Leaderboard (lower is
            better):
          </p>

          <Table headers={leaderboard.headers} rows={leaderboard.rows} />

          <p>
            RTFx is how many seconds of audio a model gets through per second of compute on
            NVIDIA&apos;s test GPU. The AMI column is the one I care about most, because it is
            recorded meetings. There Parakeet v3 makes about 29% fewer errors than Whisper
            large-v3, and it does it with well under half the parameters.
          </p>

          <h2 className={headingClass}>Our numbers, on a Mac</h2>
          <p>
            Minutes defaults to Whisper small, not large-v3, so we also measured the models
            Minutes users actually run. This was on an M4 Max with the models already loaded,
            using 39 clips from LibriSpeech test-other:
          </p>

          <Table headers={ourRun.headers} rows={ourRun.rows} />

          <p>
            LibriSpeech is people reading books aloud, with few names or acronyms, so I also ran
            39 of my own saved dictation clips. There is no hand-checked transcript for those, so
            Whisper medium served as the reference. Parakeet v3 differed from it on 2.1% of words
            and Whisper small on 6.9%. Parakeet decoded a typical clip in 51&nbsp;ms, Whisper small
            in 168&nbsp;ms.
          </p>

          <h2 className={headingClass}>Where Whisper still wins</h2>
          <p>
            <span className="font-medium text-[var(--text)]">Languages.</span> Whisper covers 99
            languages and Parakeet v3 covers 25, all European. If you set a language Parakeet
            does not cover, such as Chinese, Japanese, Hindi or Arabic, Minutes keeps Whisper and
            never offers the install.
          </p>
          <p>
            <span className="font-medium text-[var(--text)]">Platforms.</span> The desktop app
            uses Parakeet only on Apple Silicon Macs. On Linux, the command-line sherpa archive
            runs it if you set the engine to sherpa yourself. Windows and Intel Macs use Whisper
            for now; Windows support is tracked in{" "}
            <a href="https://github.com/silverstein/minutes/issues/645" className={linkClass}>
              #645
            </a>
            .
          </p>
          <p>
            <span className="font-medium text-[var(--text)]">Unusual names.</span> Parakeet v3
            can misspell rare names. In my dictation clips it wrote &quot;Garek&quot; for
            &quot;Garrett&quot;, a name Whisper small got right. Minutes can steer Whisper toward
            the names in your vocabulary list, and Parakeet has no equivalent. What works for
            both engines is listing the misspellings you see: Minutes corrects them in every new
            transcript.
          </p>
          <p>
            <span className="font-medium text-[var(--text)]">Live text.</span> While you dictate,
            the words appearing on screen still come from Whisper; Parakeet writes the final
            text when you stop. Standalone live transcript runs on Whisper, or on Apple Speech if
            you opt in on macOS 26.
          </p>

          <h2 className={headingClass}>What Minutes picks by default</h2>
          <p>
            The transcription engine defaults to Auto. Auto uses Parakeet v3 when it is installed,
            you are on Apple Silicon, and your language is one Parakeet covers. Otherwise it uses
            Whisper. If Parakeet fails on a recording, Whisper transcribes it instead, and since
            0.31.0 that includes the rare recording that crashes the Parakeet engine outright.
          </p>
          <p>
            You can install Parakeet v3 from the banner Minutes shows when it is available, from Settings ›
            Transcription, or during first-run setup. From the command line it is{" "}
            <span className="font-mono text-[14px]">minutes setup --sherpa</span>.
          </p>

          <h2 className={headingClass}>The recommendation</h2>
          <p>
            If you are on an Apple Silicon Mac and your meetings are mostly in one of
            Parakeet&apos;s 25 languages, install it. On our tests it was more accurate than
            Whisper small, the default, and about twice as fast. If your meetings are
            full of unusual names, add them to your vocabulary along with the misspellings you
            see. Everyone else should stay on Whisper, and with the engine on Auto, Minutes makes
            that call for you.
          </p>
          <p>
            Setup details are in{" "}
            <a
              href="https://github.com/silverstein/minutes/blob/main/docs/architecture/sherpa-engine.md"
              className={linkClass}
            >
              docs/architecture/sherpa-engine.md
            </a>
            , and the parked parakeet.cpp integration is documented in{" "}
            <a
              href="https://github.com/silverstein/minutes/blob/main/docs/architecture/parakeet.md"
              className={linkClass}
            >
              docs/architecture/parakeet.md
            </a>
            . The leaderboard figures come from Table 5 of NVIDIA&apos;s paper; the Mac
            measurements are ours. Minutes is MIT licensed, and{" "}
            <a href="https://github.com/silverstein/minutes" className={linkClass}>
              the pipeline code is on GitHub
            </a>
            .
          </p>
        </div>
      </article>
    </div>
  );
}
