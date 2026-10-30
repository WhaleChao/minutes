import type { Metadata } from "next";
import { FaqSection } from "@/components/faq-section";
import { PublicFooter } from "@/components/public-footer";
import { SectionLabel } from "@/components/section-label";
import { faqPageSchema, resourceArticleSchema } from "@/lib/schema";
import { RelatedResources } from "@/components/related-resources";

export const metadata: Metadata = {
  title: "Open-source Wispr Flow alternatives: 7 dictation apps compared",
  description:
    "Wispr Flow is closed source and transcribes in the cloud. Seven open-source dictation apps compared on license, platforms, local transcription, and AI cleanup.",
  alternates: {
    canonical: "/resources/open-source-wispr-flow-alternatives",
  },
};

// Every cell is sourced to the project's own repo, LICENSE, or README, checked
// on LAST_REVIEWED. Stars and release dates change weekly, so they stay out of
// the table and only inform which projects count as maintained.
const alternatives = [
  {
    name: "Minutes",
    bestFor: "Dictation that becomes notes your AI can search",
    summary:
      "Transcribes on your machine and saves every dictation as Markdown next to your meetings and voice memos, where Claude, Codex, or any MCP client can find it. Cleanup is rule-based: it removes fillers, applies self-corrections such as \"scratch that\", and follows voice commands on your device, with no AI rephrasing. Written by the Minutes maintainer, so weigh it accordingly.",
    license: "MIT",
    platforms: "macOS, Windows; Linux CLI",
    local: "Yes",
    engines: "Parakeet v3 (Apple Silicon), Whisper",
    cleanup: "None; rule-based self-corrections and voice commands on your device",
    insert: "At the cursor on Mac; clipboard on Windows and Linux",
  },
  {
    name: "Handy",
    bestFor: "The most popular local dictation app",
    summary:
      "Hold a key, speak, and the text is pasted into the app you are using. Transcription is entirely local. AI cleanup is optional and off by default; when on, it can use a cloud model or Apple Intelligence on the device.",
    license: "MIT (brand excluded)",
    platforms: "macOS, Windows, Linux",
    local: "Yes",
    engines: "Whisper, Parakeet v3",
    cleanup: "Optional, off by default; cloud or Apple Intelligence",
    insert: "Yes",
  },
  {
    name: "OpenWhispr",
    bestFor: "The closest feature match to Wispr Flow",
    summary:
      "Dictation, meeting transcription, and notes in one app, with local or cloud models for every feature and an MCP server. Optional cloud sync and team sharing come through OpenWhispr Cloud, which has paid plans.",
    license: "MIT",
    platforms: "macOS, Windows, Linux",
    local: "Your choice of local or cloud",
    engines: "Whisper, Parakeet, cloud providers",
    cleanup: "Local llama.cpp or cloud models",
    insert: "Yes",
  },
  {
    name: "FluidVoice",
    bestFor: "Local dictation with many engines on a Mac",
    summary:
      "Runs Parakeet, Whisper, Apple Speech, and other engines locally. AI cleanup is optional through OpenAI, Groq, a custom endpoint, or its own local model, which is closed source.",
    license: "GPL-3.0",
    platforms: "macOS",
    local: "Yes",
    engines: "Parakeet, Whisper, Apple Speech, others",
    cleanup: "Optional; cloud or a closed local model",
    insert: "Yes",
  },
  {
    name: "VoiceInk",
    bestFor: "A polished native Mac app with open source code",
    summary:
      "Fully offline transcription with whisper.cpp or Parakeet. The source is GPL, but the ready-made app is sold as a one-time purchase with a free trial.",
    license: "GPL-3.0; paid app downloads",
    platforms: "macOS 15+",
    local: "Yes",
    engines: "whisper.cpp, Parakeet",
    cleanup: "Optional cloud AI",
    insert: "Yes",
  },
  {
    name: "Voquill",
    bestFor: "Cross-platform dictation with AI cleanup",
    summary:
      "Desktop apps for Mac, Windows, and Linux, with a mobile app in the same repository. Transcribes with local Whisper or a cloud provider, and offers AI cleanup with your own API key.",
    license: "AGPL-3.0",
    platforms: "macOS, Windows, Linux",
    local: "Local Whisper or cloud",
    engines: "Whisper",
    cleanup: "Your own API key",
    insert: "Yes",
  },
  {
    name: "FreeFlow",
    bestFor: "Wispr Flow's workflow with your own API key",
    summary:
      "A small Mac app that sends audio to Groq by default for fast transcription and LLM cleanup, or to a local Ollama or LM Studio server you point it at. Open source, but not local unless you set it up that way.",
    license: "MIT",
    platforms: "macOS",
    local: "No by default; Groq",
    engines: "Any OpenAI-compatible endpoint",
    cleanup: "LLM cleanup via Groq or a local server",
    insert: "Yes",
  },
] as const;

const tableColumns = [
  { key: "license", label: "License" },
  { key: "platforms", label: "Platforms" },
  { key: "local", label: "Local transcription by default" },
  { key: "engines", label: "Engines" },
  { key: "cleanup", label: "AI cleanup" },
  { key: "insert", label: "Types into any app" },
] as const;

const faqs = [
  {
    question: "Is Wispr Flow open source?",
    answer:
      "No. Wispr Flow's terms say the service is owned by Wispr and protected by copyright and trade secret, and they forbid reverse-engineering it to get at the source code.",
  },
  {
    question: "Does Wispr Flow work offline?",
    answer:
      "Its data-controls page says transcription always happens in the cloud, so it needs an internet connection. A setting controls whether your transcripts, audio, and history are also stored on Wispr's servers.",
  },
  {
    question: "Is there a free Wispr Flow alternative?",
    answer:
      "Every project on this page is open source and free to run yourself. Minutes, Handy, OpenWhispr, and FreeFlow ship free apps; VoiceInk's source is free but its ready-made app is a one-time purchase. Wispr Flow itself has a free plan capped at 2,000 words a week on desktop.",
  },
  {
    question: "Which open-source dictation app is closest to Wispr Flow?",
    answer:
      "OpenWhispr is the closest feature match, with AI cleanup, meeting notes, and sync. Handy is the most popular simple local option. FreeFlow copies Wispr Flow's fast cloud workflow with your own API key. None of them matches Wispr Flow's phone apps.",
  },
  {
    question: "Can my AI assistant use what I dictate?",
    answer:
      "With Minutes, yes: every dictation is saved as a Markdown file, and its MCP server lets Claude, Codex, or another client list and search those files alongside your meetings. OpenWhispr also has an MCP server for its notes and transcriptions.",
  },
] as const;

const sources = [
  { label: "Wispr Flow data controls", href: "https://wisprflow.ai/data-controls" },
  { label: "Wispr Flow terms of service", href: "https://wisprflow.ai/terms-of-service" },
  { label: "Wispr Flow pricing", href: "https://wisprflow.ai/pricing" },
  { label: "Handy GitHub", href: "https://github.com/cjpais/Handy" },
  { label: "OpenWhispr GitHub", href: "https://github.com/OpenWhispr/openwhispr" },
  { label: "OpenWhispr pricing", href: "https://openwhispr.com/pricing" },
  { label: "FluidVoice GitHub", href: "https://github.com/altic-dev/FluidVoice" },
  { label: "VoiceInk GitHub", href: "https://github.com/Beingpax/VoiceInk" },
  { label: "VoiceInk app and pricing", href: "https://tryvoiceink.com" },
  { label: "Voquill GitHub", href: "https://github.com/voquill/voquill" },
  { label: "FreeFlow GitHub", href: "https://github.com/zachlatta/freeflow" },
  { label: "Minutes on GitHub", href: "https://github.com/silverstein/minutes" },
  { label: "Minutes MCP reference", href: "https://useminutes.app/docs/mcp/tools" },
] as const;

const LAST_REVIEWED = "2026-10-29";

export default function OpenSourceWisprFlowAlternativesPage() {
  return (
    <div className="mx-auto max-w-[980px] px-6 pb-16 pt-10 sm:px-8 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([
            resourceArticleSchema({ metadata, path: "/resources/open-source-wispr-flow-alternatives", lastReviewed: LAST_REVIEWED, sources }),
            faqPageSchema(faqs),
          ]) }}
      />
      <div className="mb-10 flex items-center justify-between border-b border-[color:var(--border)] pb-4">
        <a href="/" className="font-mono text-[15px] font-medium text-[var(--text)]">
          minutes
        </a>
        <div className="flex gap-5 text-sm text-[var(--text-secondary)]">
          <a href="/resources/open-source-wispr-flow-alternatives.md" className="hover:text-[var(--accent)]">
            page.md
          </a>
          <a href="/resources" className="hover:text-[var(--accent)]">
            resources
          </a>
          <a href="/compare" className="hover:text-[var(--accent)]">
            compare
          </a>
        </div>
      </div>

      <section className="max-w-[800px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
          Resource
        </p>
        <h1 className="mt-4 font-serif text-[40px] leading-[0.98] tracking-[-0.045em] text-[var(--text)] sm:text-[58px]">
          Open-source Wispr Flow alternatives
        </h1>
        <p className="mt-5 text-[17px] leading-8 text-[var(--text-secondary)]">
          Wispr Flow is closed source, and it transcribes everything you say in the cloud. If
          you want dictation you can inspect, or that never leaves your computer, there are
          now several good open-source apps. Here are seven, what each is best at, and where
          each falls short of Wispr Flow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Last reviewed: {LAST_REVIEWED}
          </span>
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
            Written by the Minutes maintainer
          </span>
        </div>
      </section>

      <section className="mt-12 rounded-[8px] border border-[color:var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-panel)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
          Quick answer
        </p>
        <div className="mt-4 space-y-3 text-[15px] leading-8 text-[var(--text-secondary)]">
          <p>
            For simple dictation that stays on your machine,{" "}
            <span className="font-medium text-[var(--text)]">Handy</span> is the most widely used.
            For the closest match to Wispr Flow&rsquo;s features, including AI cleanup,{" "}
            <span className="font-medium text-[var(--text)]">OpenWhispr</span> is the pick. For
            dictation that becomes notes your AI assistant can search later, alongside your
            meetings, consider <span className="font-medium text-[var(--text)]">Minutes</span>,
            which is what this site is for.
          </p>
          <p>
            The trade-off to expect: Wispr Flow&rsquo;s AI editing and phone apps are more polished
            than anything here. What you gain is local transcription, no word limits, and code you
            can read.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="Wispr Flow, for reference" />
        <div className="max-w-[800px] space-y-4 text-[15px] leading-8 text-[var(--text-secondary)]">
          <p>
            Wispr Flow runs on macOS, Windows, iOS, and Android. It transcribes in the cloud, then
            applies AI edits: it removes filler words, applies your self-corrections, formats
            lists, and adapts tone to the app you are typing in. It has a personal dictionary,
            voice snippets, and a Command Mode for editing selected text by voice. The free plan
            allows 2,000 words a week on desktop; Pro costs $15 per user per month, or $12 billed
            annually. Training on your data is opt-in. The source code is not published.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="Side by side" />
        <div className="overflow-x-auto rounded-[8px] border border-[color:var(--border)] bg-[var(--bg-elevated)]">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                  Project
                </th>
                {tableColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((tool) => (
                <tr key={tool.name} className="border-b border-[color:var(--border)] last:border-b-0">
                  <td className="px-4 py-4 align-top text-[14px] font-medium text-[var(--text)]">
                    {tool.name}
                  </td>
                  {tableColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-4 align-top text-[14px] leading-7 text-[var(--text-secondary)]"
                    >
                      {tool[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="Shortlist" />
        <div className="grid gap-4 md:grid-cols-2">
          {alternatives.map((tool) => (
            <div
              key={tool.name}
              className="rounded-[8px] border border-[color:var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-panel)]"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
                {tool.bestFor}
              </p>
              <h3 className="mt-3 text-[18px] font-medium text-[var(--text)]">{tool.name}</h3>
              <p className="mt-2 text-[15px] leading-8 text-[var(--text-secondary)]">
                {tool.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="How to choose" />
        <div className="max-w-[800px] space-y-4 text-[15px] leading-8 text-[var(--text-secondary)]">
          <p>
            If privacy is the reason you are leaving Wispr Flow, start with an app that transcribes
            locally by default: Handy, Minutes, FluidVoice, or VoiceInk. Check what its optional AI
            cleanup sends to the cloud before you turn it on.
          </p>
          <p>
            If you want Wispr Flow&rsquo;s polish, try OpenWhispr or Voquill with AI cleanup, or
            FreeFlow if fast cloud transcription with your own key is fine.
          </p>
          <p>
            If you also record meetings or voice memos and want one archive an assistant can search,
            Minutes keeps dictations and meetings together as Markdown.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="How we evaluated" />
        <div className="max-w-[800px] space-y-4 text-[15px] leading-8 text-[var(--text-secondary)]">
          <p>
            Each project was checked against its own repository, license file, and README on{" "}
            {LAST_REVIEWED}; Wispr Flow against its own data-controls, pricing, features, and terms
            pages. This is a documentation review, not a hands-on test of accuracy or speed. We
            included projects that are open-source licensed, released within the last year, and
            built for dictation into other apps. Buzz is excellent for transcribing files but does
            not type into other apps, so it is not listed. Whispering, now part of Epicenter, was
            left out while its app is being reworked.
          </p>
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="mt-14 rounded-[8px] border border-[color:var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-panel)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
          Next step
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/compare/wispr-flow-vs-minutes"
            className="inline-flex items-center rounded-[5px] bg-[var(--accent)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-black hover:bg-[var(--accent-hover)]"
          >
            Minutes vs Wispr Flow
          </a>
          <a
            href="/resources/local-dictation-macos"
            className="inline-flex items-center rounded-[5px] border border-[color:var(--border-mid)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text)] hover:bg-[var(--bg-hover)]"
          >
            Local dictation on macOS
          </a>
          <a
            href="/compare/superwhisper-vs-minutes"
            className="inline-flex items-center rounded-[5px] border border-[color:var(--border-mid)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text)] hover:bg-[var(--bg-hover)]"
          >
            Minutes vs superwhisper
          </a>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="Sources" />
        <ul className="space-y-2 text-[14px] leading-7 text-[var(--text-secondary)]">
          {sources.map((source) => (
            <li key={source.href}>
              <a href={source.href} className="text-[var(--accent)] hover:underline">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <RelatedResources slug="open-source-wispr-flow-alternatives" />

      <PublicFooter />
    </div>
  );
}
