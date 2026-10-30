import type { Metadata } from "next";
import { FaqSection } from "@/components/faq-section";
import { PublicFooter } from "@/components/public-footer";
import { SectionLabel } from "@/components/section-label";
import { faqPageSchema, resourceArticleSchema } from "@/lib/schema";
import { RelatedResources } from "@/components/related-resources";

export const metadata: Metadata = {
  title: "Open-source Granola alternatives: 9 tools compared",
  description:
    "Granola isn't open source. Nine open-source alternatives compared on license, platforms, local transcription, storage, and MCP, with each one's limits.",
  alternates: {
    canonical: "/resources/open-source-alternatives-to-granola-ai",
  },
};

// Every cell below is sourced to the project's own repo, LICENSE, or docs,
// checked on LAST_REVIEWED. "Not found" means a search of the repo turned up
// nothing, not that the project has ruled the feature out.
const alternatives = [
  {
    name: "Minutes",
    bestFor: "Markdown conversation memory for your own AI",
    summary:
      "Meetings, voice memos, and dictation transcribed on your machine (Parakeet v3 on Apple Silicon, Whisper elsewhere) and saved as Markdown that Claude, Codex, or another MCP client can search. Written by the Minutes maintainer, so weigh it accordingly.",
    license: "MIT",
    platforms: "macOS (Apple Silicon), Windows; Linux CLI",
    local: "Yes, by default",
    storage: "Markdown + YAML files",
    mcp: "Yes, local",
    capture: "Mic and system audio, no bot",
  },
  {
    name: "Anarlog (formerly Hyprnote)",
    bestFor: "The closest open-source take on an AI notepad",
    summary:
      "An editable local notepad with SQLite storage, Markdown export, a CLI, and MCP. On-device transcription is Mac-only; the docs point new users to Anarlog Cloud for the easiest setup.",
    license: "MIT; enterprise directory commercial",
    platforms: "macOS, Windows, Linux; mobile in beta",
    local: "On Mac only; cloud is the easy path",
    storage: "SQLite and files; Markdown export",
    mcp: "Yes",
    capture: "Device audio, no bot",
  },
  {
    name: "Meetily",
    bestFor: "Local transcription and summaries",
    summary:
      "The most-starred project here. Transcribes locally with Whisper or Parakeet and summarizes with Ollama or a cloud model. Meetily PRO is a separate, paid codebase.",
    license: "MIT; PRO is separate and paid",
    platforms: "macOS, Windows; Linux from source",
    local: "Yes",
    storage: "Local SQLite",
    mcp: "Not found",
    capture: "Device audio, no bot",
  },
  {
    name: "OpenWhispr",
    bestFor: "Dictation and meeting notes in one app",
    summary:
      "Started as a dictation app and now also transcribes meetings, with on-device speaker labels and calendar integration. Local or cloud models for every feature, plus optional cloud sync and team sharing through OpenWhispr Cloud.",
    license: "MIT",
    platforms: "macOS, Windows, Linux",
    local: "Your choice of local or cloud",
    storage: "Local SQLite; optional cloud sync",
    mcp: "Yes",
    capture: "Device audio; detects Zoom, Teams, FaceTime calls",
  },
  {
    name: "StenographAI (StenoAI)",
    bestFor: "A local AI notepad for confidential calls",
    summary:
      "Records, summarizes, and answers questions about meetings with local AI by default; cloud providers are opt-in. Parakeet v3 on Apple Silicon for live text, Whisper for other languages, and notes saved as Markdown.",
    license: "MIT",
    platforms: "macOS; Windows and Linux alpha",
    local: "Yes, by default",
    storage: "Markdown",
    mcp: "Agent skill; no server found",
    capture: "Mic and system audio, no bot",
  },
  {
    name: "OpenOats",
    bestFor: "A live in-call assistant on a Mac",
    summary:
      "Transcribes on an Apple Silicon Mac and saves plain-text transcripts to your Documents folder. Closer to a live assistant during the call than a notepad afterward.",
    license: "MIT",
    platforms: "macOS 14.2+ (Apple Silicon)",
    local: "Yes",
    storage: "Plain-text files",
    mcp: "Not found",
    capture: "Device audio, no bot",
  },
  {
    name: "LokalBot",
    bestFor: "A small on-device Mac notetaker",
    summary:
      "Transcribes on-device by default and offers an optional read-only MCP server and CLI. A young, single-developer project with Windows and Linux in alpha.",
    license: "GPL-3.0",
    platforms: "macOS 15+ (Apple Silicon); Windows, Linux alpha",
    local: "Yes, by default",
    storage: "Not stated",
    mcp: "Optional, read-only",
    capture: "Device audio, no bot",
  },
  {
    name: "Omi",
    bestFor: "Memory across desktop, phone, and a wearable",
    summary:
      "MIT-licensed apps and wearable hardware. Audio streams to the Omi backend for transcription, so the open license does not make it local by default. MCP is hosted.",
    license: "MIT",
    platforms: "macOS, iOS, Android, wearable; Windows from source",
    local: "No; Omi backend",
    storage: "Omi backend",
    mcp: "Hosted",
    capture: "Device, phone, or wearable",
  },
  {
    name: "Vexa",
    bestFor: "Self-hosted meeting-bot infrastructure",
    summary:
      "An API that sends a bot into Meet, Teams, Zoom, and Jitsi and returns transcripts, with MCP. Transcription needs a Vexa token or your own GPU service. Something you operate, not a desktop notepad.",
    license: "Apache-2.0",
    platforms: "Self-hosted server, or hosted",
    local: "Only with your own GPU service",
    storage: "Postgres and a Markdown workspace",
    mcp: "Yes",
    capture: "Meeting bot",
  },
] as const;

const tableColumns = [
  { key: "license", label: "License" },
  { key: "platforms", label: "Platforms" },
  { key: "local", label: "On-device transcription" },
  { key: "storage", label: "Storage" },
  { key: "mcp", label: "MCP" },
  { key: "capture", label: "Capture" },
] as const;

const faqs = [
  {
    question: "Is Granola open source?",
    answer:
      "No. Granola is proprietary: its application terms grant a limited license to use the app, and it does not publish its source code. Transcription runs through third-party cloud providers, so it also needs an internet connection to finish a transcript.",
  },
  {
    question: "Is there a free version of Granola?",
    answer:
      "Yes. Granola's Basic plan is free, with paid Business and Enterprise plans above it. Free is not the same as open source or local: Basic still transcribes in the cloud, and its MCP access covers only the last 30 days of notes.",
  },
  {
    question: "Which open-source Granola alternative runs fully offline?",
    answer:
      "Minutes, Meetily, StenographAI, OpenOats, and LokalBot transcribe on your own machine by default, OpenWhispr can if you pick its local models, and Anarlog can on a Mac. Summaries are a separate step: they stay offline only if you use a local model such as Ollama or skip summarization. Omi and Vexa depend on a backend service.",
  },
  {
    question: "Is there an open-source Granola alternative for Windows?",
    answer:
      "Minutes, Anarlog, Meetily, and OpenWhispr ship Windows builds. StenographAI and LokalBot have Windows builds in alpha, and Omi's Windows app is built from source. OpenOats is Mac-only.",
  },
  {
    question: "Do any of them have an MCP server like Granola's?",
    answer:
      "Minutes, Anarlog, OpenWhispr, and Vexa ship MCP servers, LokalBot has an optional read-only one, and Omi offers a hosted MCP endpoint. StenographAI ships an agent skill instead. That lets Claude, Codex, or another MCP client read your meetings, the same job Granola's hosted MCP does for Granola notes.",
  },
] as const;

const sources = [
  { label: "Granola application terms of service", href: "https://docs.granola.ai/help-center/policies/terms-of-service/application-terms-of-service" },
  { label: "Granola security", href: "https://www.granola.ai/security" },
  { label: "Granola pricing", href: "https://www.granola.ai/pricing" },
  { label: "Granola MCP", href: "https://docs.granola.ai/help-center/sharing/integrations/mcp" },
  { label: "Anarlog (formerly Hyprnote) GitHub", href: "https://github.com/fastrepl/anarlog" },
  { label: "Anarlog licensing", href: "https://github.com/fastrepl/anarlog/blob/main/LICENSING.md" },
  { label: "Anarlog models and providers", href: "https://docs.anarlog.so/models-and-providers" },
  { label: "Meetily GitHub", href: "https://github.com/Zackriya-Solutions/meetily" },
  { label: "Meetily PRO", href: "https://meetily.ai/pro/" },
  { label: "OpenWhispr GitHub", href: "https://github.com/OpenWhispr/openwhispr" },
  { label: "OpenWhispr MCP", href: "https://docs.openwhispr.com/integrations/mcp" },
  { label: "StenographAI (StenoAI) GitHub", href: "https://github.com/stenolabs/stenoai" },
  { label: "OpenOats GitHub", href: "https://github.com/yazinsai/OpenOats" },
  { label: "LokalBot GitHub", href: "https://github.com/stevyhacker/lokalbot" },
  { label: "Omi GitHub", href: "https://github.com/BasedHardware/omi" },
  { label: "Omi transcription backend", href: "https://docs.omi.me/doc/developer/backend/transcription" },
  { label: "Vexa GitHub", href: "https://github.com/Vexa-ai/vexa" },
  { label: "Vexa MCP", href: "https://docs.vexa.ai/vexa-mcp" },
  { label: "Minutes security and data paths", href: "https://useminutes.app/security" },
  { label: "Minutes MCP reference", href: "https://useminutes.app/docs/mcp/tools" },
] as const;

const LAST_REVIEWED = "2026-10-29";

export default function OpenSourceAlternativesToGranolaPage() {
  return (
    <div className="mx-auto max-w-[980px] px-6 pb-16 pt-10 sm:px-8 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([
            resourceArticleSchema({ metadata, path: "/resources/open-source-alternatives-to-granola-ai", lastReviewed: LAST_REVIEWED, sources }),
            faqPageSchema(faqs),
          ]) }}
      />
      <div className="mb-10 flex items-center justify-between border-b border-[color:var(--border)] pb-4">
        <a href="/" className="font-mono text-[15px] font-medium text-[var(--text)]">
          minutes
        </a>
        <div className="flex gap-5 text-sm text-[var(--text-secondary)]">
          <a href="/resources/open-source-alternatives-to-granola-ai.md" className="hover:text-[var(--accent)]">
            page.md
          </a>
          <a href="/for-agents" className="hover:text-[var(--accent)]">
            for agents
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
          Open-source Granola alternatives
        </h1>
        <p className="mt-5 text-[17px] leading-8 text-[var(--text-secondary)]">
          Granola is not open source, and it transcribes in the cloud. If you want an
          open-source tool instead, the best pick depends on what you liked about Granola: the
          notepad, the bot-free capture, or the meeting memory your AI can read. Here are nine
          open-source projects, what each is actually for, and where each falls short.
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
            For the editable AI notepad Granola is known for,{" "}
            <span className="font-medium text-[var(--text)]">Anarlog (formerly Hyprnote)</span>{" "}
            is the closest open-source match. For local transcription and summaries,{" "}
            <span className="font-medium text-[var(--text)]">Meetily</span> is the most widely
            used. For meetings saved as Markdown that your existing AI assistant can search,
            consider <span className="font-medium text-[var(--text)]">Minutes</span>, which is
            what this site is for.
          </p>
          <p>
            All three capture device audio without a bot. Check two things before you choose:
            whether transcription actually runs on your machine by default, and where the notes
            are stored.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="Granola, for reference" />
        <div className="max-w-[800px] space-y-4 text-[15px] leading-8 text-[var(--text-secondary)]">
          <p>
            Granola runs on macOS, Windows, iOS, and Android and records without adding a bot to
            the call. Transcription goes through third-party cloud providers, and notes are
            stored on Granola&rsquo;s servers. It has a free Basic plan, paid Business and
            Enterprise plans, and a hosted MCP server that lets AI assistants read your notes.
            The source code is not published.
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
            Pick <span className="font-medium text-[var(--text)]">Anarlog</span> if you want to
            write and edit notes during the meeting, the way Granola works.
          </p>
          <p>
            Pick <span className="font-medium text-[var(--text)]">OpenWhispr</span> if you want
            dictation and meeting notes in one app with local or cloud models, or{" "}
            <span className="font-medium text-[var(--text)]">StenographAI</span> for a local-first
            notepad aimed at confidential conversations.
          </p>
          <p>
            Pick <span className="font-medium text-[var(--text)]">Meetily</span>,{" "}
            <span className="font-medium text-[var(--text)]">OpenOats</span>, or{" "}
            <span className="font-medium text-[var(--text)]">LokalBot</span> if the priority is
            transcription that stays on your machine, and you are happy with that project&rsquo;s
            platform support.
          </p>
          <p>
            Pick <span className="font-medium text-[var(--text)]">Minutes</span> if you want
            meetings, voice memos, and dictation in one Markdown archive that Claude, Codex, or
            another assistant can search through MCP.
          </p>
          <p>
            Pick <span className="font-medium text-[var(--text)]">Omi</span> for a phone or
            wearable, or <span className="font-medium text-[var(--text)]">Vexa</span> if you want
            to run meeting-bot infrastructure yourself.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="When an open-source alternative is not the right fit" />
        <div className="max-w-[800px] space-y-4 text-[15px] leading-8 text-[var(--text-secondary)]">
          <p>
            If what you want is Granola&rsquo;s polished hosted experience, shared team notes,
            and workspace features, none of these is a drop-in replacement. Open-source tools
            win on control, inspectable files, and local processing. They ask more of you in
            setup, and features such as sharing are thinner or absent.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel label="How we evaluated" />
        <div className="max-w-[800px] space-y-4 text-[15px] leading-8 text-[var(--text-secondary)]">
          <p>
            Each entry was checked against the project&rsquo;s own repository, license file, and
            documentation on {LAST_REVIEWED}. This is a documentation review, not a hands-on
            benchmark of accuracy or reliability. Projects were included only if they are
            open-source licensed, actively maintained, and built for meetings. Tools with no
            license, a license that now restricts commercial use, or no updates in over a year
            were left out.
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
            href="/for-agents"
            className="inline-flex items-center rounded-[5px] bg-[var(--accent)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-black hover:bg-[var(--accent-hover)]"
          >
            See agent setup
          </a>
          <a
            href="/compare/granola-vs-minutes"
            className="inline-flex items-center rounded-[5px] border border-[color:var(--border-mid)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text)] hover:bg-[var(--bg-hover)]"
          >
            Minutes vs Granola
          </a>
          <a
            href="/compare/hyprnote-vs-minutes"
            className="inline-flex items-center rounded-[5px] border border-[color:var(--border-mid)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text)] hover:bg-[var(--bg-hover)]"
          >
            Minutes vs Anarlog
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

      <RelatedResources slug="open-source-alternatives-to-granola-ai" />

      <PublicFooter />
    </div>
  );
}
