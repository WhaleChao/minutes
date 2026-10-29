import type { Metadata } from "next";
import { collectionPageSchema } from "@/lib/schema";
import { PublicFooter } from "@/components/public-footer";
import { SectionLabel } from "@/components/section-label";

export const metadata: Metadata = {
  title: "Minutes resources",
  description:
    "Sourced, dated guides on removing AI notetaker bots, HIPAA and recording law, and local transcription and dictation.",
  alternates: {
    canonical: "/resources",
  },
};

/** Every page under /resources, grouped by the question a reader arrives with.
 *
 * This hub exists because the resource pages had no route in from the rest of
 * the site. Until 2026-09-02 the homepage, /compare, /docs, and the shared
 * footer all linked to exactly one of them, so the pages that earn the site's
 * non-branded search impressions were reachable only from each other. Keep the
 * list complete: a page missing here is a page with one fewer link in.
 */
const groups = [
  {
    label: "Stop or leave AI notetakers",
    intro:
      "Getting a recording bot out of a call, keeping it out, and what to do when the bot belongs to someone else.",
    pages: [
      {
        title: "How to remove AI notetaker bots from your meetings",
        href: "/resources/remove-ai-notetaker-bots-from-meetings",
        blurb:
          "Otter, Fireflies, and other bots across Zoom, Google Meet, and Teams, including bots that belong to someone else.",
      },
      {
        title: "How to stop Fireflies from joining your meetings",
        href: "/resources/stop-fireflies-from-joining-meetings",
        blurb:
          "The three-minute rule, the two settings that stop it returning, and the recording rules that outrank them.",
      },
      {
        title: "How to remove Otter AI from Zoom",
        href: "/resources/remove-otter-ai-from-zoom",
        blurb:
          "Remove Otter Notetaker mid-call, even as a non-host, then stop it coming back.",
      },
      {
        title: "How to remove Fireflies AI from Microsoft Teams",
        href: "/resources/remove-fireflies-ai-from-teams",
        blurb:
          "Who is allowed to remove it, the admin-center block and what it misses, and the lobby setting that works.",
      },
      {
        title: "How to remove Fireflies AI from Zoom",
        href: "/resources/remove-fireflies-ai-from-zoom",
        blurb:
          "The in-call step, the uninstall on both sides, the team setting that overrides yours, and Zoom's three bot controls.",
      },
      {
        title: "How to turn off built-in AI notetakers in Zoom and Teams",
        href: "/resources/turn-off-built-in-ai-notetakers",
        blurb:
          "The admin paths for Zoom AI Companion and Teams, the in-meeting stop, and why the toggle is grayed out.",
      },
      {
        title: "How to cancel Fireflies AI",
        href: "/resources/how-to-cancel-fireflies-ai",
        blurb:
          "The cancel path, what happens to your transcripts, the two refund pages that disagree, and exporting first.",
      },
    ],
  },
  {
    label: "HIPAA, privacy, and recording law",
    intro:
      "Which vendors can be trusted with protected or privileged conversations, under what conditions, and what the law asks of you either way.",
    pages: [
      {
        title: "HIPAA-compliant AI note takers",
        href: "/resources/hipaa-compliant-ai-note-taker",
        blurb:
          "Which note takers can be used with PHI, under what conditions, sourced to each vendor's own documentation.",
      },
      {
        title: "HIPAA-compliant transcription",
        href: "/resources/hipaa-compliant-transcription",
        blurb:
          "What the rule requires, the business associate test, and what a BAA does and does not settle.",
      },
      {
        title: "Is Otter.ai HIPAA compliant?",
        href: "/resources/is-otter-ai-hipaa-compliant",
        blurb:
          "Yes, on the Enterprise plan with a signed BAA. What that means for every other plan.",
      },
      {
        title: "Is Fireflies.ai HIPAA compliant?",
        href: "/resources/is-fireflies-ai-hipaa-compliant",
        blurb:
          "Yes, on Enterprise with Private Storage and a signed BAA, all three at once.",
      },
      {
        title: "Is Granola HIPAA compliant?",
        href: "/resources/is-granola-hipaa-compliant",
        blurb: "No, per Granola's own documentation. What Granola offers instead.",
      },
      {
        title: "Is Fireflies AI safe?",
        href: "/resources/is-fireflies-ai-safe",
        blurb:
          "Encryption, training, storage, certifications, and consent, each sourced to Fireflies' own pages.",
      },
      {
        title: "AI notetakers and attorney-client privilege",
        href: "/resources/ai-notetakers-attorney-client-privilege",
        blurb:
          "What ABA Formal Opinion 512 says about putting a vendor inside client conversations.",
      },
      {
        title: "Legal transcription software",
        href: "/resources/legal-transcription-software",
        blurb:
          "When you need certified human transcripts, when software is the right tool, and what confidentiality requires.",
      },
      {
        title: "Is it legal to record a meeting?",
        href: "/resources/is-it-legal-to-record-a-meeting",
        blurb:
          "One-party and all-party consent states, workplace rules, and a consent script that works everywhere.",
      },
    ],
  },
  {
    label: "Local transcription and dictation",
    intro:
      "Doing the work on your own machine: which tools, what they are for, and how an assistant reads the result.",
    pages: [
      {
        title: "The best local speech-to-text apps",
        href: "/resources/best-local-speech-to-text",
        blurb:
          "MacWhisper, superwhisper, Buzz, Vibe, whisper.cpp, and Minutes, matched to the job you are hiring for.",
      },
      {
        title: "Local dictation on macOS",
        href: "/resources/local-dictation-macos",
        blurb: "Every way to dictate on a Mac without sending your voice to a cloud.",
      },
      {
        title: "Open-source alternatives to Granola AI",
        href: "/resources/open-source-alternatives-to-granola-ai",
        blurb: "Local processing, inspectable output, and agent-friendly workflows.",
      },
      {
        title: "Best MCP meeting memory tools",
        href: "/resources/best-mcp-meeting-memory-tools",
        blurb: "Which meeting tools an assistant can actually read through MCP.",
      },
      {
        title: "Best meeting tools for Claude Code and Codex",
        href: "/resources/best-meeting-tools-for-claude-code-and-codex",
        blurb: "Meeting capture that leaves files a coding agent can use.",
      },
      {
        title: "Meeting minutes templates",
        href: "/resources/meeting-minutes-template",
        blurb:
          "Four markdown templates: team meeting, board meeting, action items, and 1:1.",
      },
    ],
  },
] as const;

export default function ResourcesHubPage() {
  return (
    <div className="mx-auto max-w-[920px] px-6 pb-16 pt-10 sm:px-8 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema({ metadata, path: "/resources", items: groups.flatMap((group): ReadonlyArray<{ title: string; href: string }> => group.pages) })) }}
      />
      <div className="mb-10 flex items-center justify-between border-b border-[color:var(--border)] pb-4">
        <a href="/" className="font-mono text-[15px] font-medium text-[var(--text)]">
          minutes
        </a>
        <div className="flex gap-5 text-sm text-[var(--text-secondary)]">
          <a href="/resources.md" className="hover:text-[var(--accent)]">
            resources.md
          </a>
          <a href="/compare" className="hover:text-[var(--accent)]">
            compare
          </a>
          <a href="/docs" className="hover:text-[var(--accent)]">
            docs
          </a>
        </div>
      </div>

      <section className="max-w-[760px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
          Resources
        </p>
        <h1 className="mt-4 font-serif text-[42px] leading-[0.98] tracking-[-0.045em] text-[var(--text)] sm:text-[56px]">
          Minutes resources
        </h1>
        <p className="mt-5 text-[17px] leading-8 text-[var(--text-secondary)]">
          Guides to the questions people bring to a recorded conversation: how to get a bot
          out of a call, whether a vendor can be trusted with regulated audio, and how to do
          the work on your own machine instead. Every page cites its sources and shows the
          date it was last checked.
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.label} className="mt-14">
          <SectionLabel label={group.label} />
          <p className="mb-6 max-w-[760px] text-[15px] leading-8 text-[var(--text-secondary)]">
            {group.intro}
          </p>
          <div className="grid gap-4">
            {group.pages.map((page) => (
              <a
                key={page.href}
                href={page.href}
                className="rounded-[8px] border border-[color:var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-panel)] transition hover:border-[color:var(--border-mid)] hover:bg-[var(--bg-hover)]"
              >
                <h3 className="text-[18px] font-medium text-[var(--text)]">{page.title}</h3>
                <p className="mt-2 text-[15px] leading-8 text-[var(--text-secondary)]">
                  {page.blurb}
                </p>
              </a>
            ))}
          </div>
        </section>
      ))}

      <PublicFooter />
    </div>
  );
}
