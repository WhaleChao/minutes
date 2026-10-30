"use client";

import type { MouseEvent } from "react";
import {
  GITHUB_CONTRIBUTORS,
  GITHUB_FORKS,
  GITHUB_STARS,
  NPM_MONTHLY_DOWNLOADS,
} from "@/lib/proof";
import { MINUTES_MCP_TOOL_COUNT } from "@/lib/release";

const primaryNav = [
  { label: "How it works", href: "#product" },
  { label: "For agents", href: "/for-agents" },
  { label: "Compare", href: "/compare" },
  {
    label: "Resources",
    href: "/resources",
  },
  { label: "Docs", href: "/docs" },
] as const;

/** "1,572" -> "1.6k", the compact form a nav link has room for.
 *
 * Reads the same hand-refreshed constant as the proof line below, so the nav
 * never shows a different number from the rest of the page.
 */
function compactCount(value: string): string {
  const count = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(count) || count < 1000) return value;
  return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

const GITHUB_STARS_COMPACT = compactCount(GITHUB_STARS);

/** GitHub's mark (Primer Octicons `mark-github`, MIT). The one icon the site
 * uses, approved as a DESIGN.md exception: the mark is what readers scan for
 * next to a star count. Inherits text color, so it follows the theme and hover.
 */
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

/** GitHub link with the star count. On desktop it sits beside Download rather
 * than among the page links, the way repo links usually sit in a nav's action
 * area; in the mobile menu it stays in the list, labelled.
 */
function GitHubStarsLink({ mobile = false }: { mobile?: boolean }) {
  return (
    <a
      href="https://github.com/silverstein/minutes"
      onClick={mobile ? closeMobileMenu : undefined}
      aria-label={`GitHub, ${GITHUB_STARS} stars`}
      className={
        mobile
          ? "flex items-center gap-2 border-b border-[color:var(--border)] py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-[var(--text)]"
          : "inline-flex items-center gap-2 text-[14px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
      }
    >
      <GitHubMark />
      {mobile ? <span>GitHub</span> : null}
      <span>{GITHUB_STARS_COMPACT}</span>
    </a>
  );
}

function closeMobileMenu(event: MouseEvent<HTMLAnchorElement>) {
  const menu = event.currentTarget.closest("details");
  if (menu) menu.open = false;
}

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      {primaryNav.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={mobile ? closeMobileMenu : undefined}
          className={
            mobile
              ? "border-b border-[color:var(--border)] py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-[var(--text)]"
              : "hover:text-[var(--accent)]"
          }
        >
          {item.label}
        </a>
      ))}
      {mobile ? <GitHubStarsLink mobile /> : null}
    </>
  );
}

function MemorySequence() {
  return (
    <div
      className="memory-sequence"
      aria-label="How a voice memo becomes durable memory for an AI agent"
    >
      <article className="memory-step">
        <div className="memory-step-meta">
          <span>01</span>
          <span>09:41</span>
          <strong>Voice memo</strong>
        </div>
        <div className="memory-artifact memory-capture">
          <div className="memory-artifact-bar">
            <span>pricing-idea.m4a</span>
            <span>00:46</span>
          </div>
          <p>
            “Next three consultant signups get monthly. Annual stays the
            enterprise default.”
          </p>
          <span className="memory-capture-meta">
            Captured on Mac · transcribed locally · 4.2s
          </span>
        </div>
      </article>

      <article className="memory-step">
        <div className="memory-step-meta">
          <span>02</span>
          <span>09:42</span>
          <strong>Local file</strong>
        </div>
        <div className="memory-artifact memory-file">
          <div className="memory-artifact-bar">
            <span>~/meetings/2026-02-28-pricing-strategy.md</span>
            <span>0600</span>
          </div>
          <pre>
            <code>{`---
title: Pricing Strategy; Monthly Test
type: meeting
consent: verbal_all_parties
decisions:
  - text: Launch monthly billing for
      the next 3 consultant signups
    authority: high
---

## Transcript
[SPEAKER_0 1:02] Next three consultant
signups get monthly.`}</code>
          </pre>
        </div>
      </article>

      <article className="memory-step">
        <div className="memory-step-meta">
          <span>03</span>
          <span>Later</span>
          <strong>Recall</strong>
        </div>
        <div className="memory-artifact memory-recall">
          <div className="memory-recall-header">
            <span>Any MCP client</span>
            <span>Minutes</span>
          </div>
          <p className="memory-prompt">
            What did we decide about consultant pricing?
          </p>
          <div className="memory-answer">
            <span className="memory-answer-mark">minutes</span>
            <p>
              Launch monthly billing for the next three consultant signups.
              Annual remains the enterprise default.
            </p>
            <span className="memory-source">
              Source: 2026-02-28-pricing-strategy.md · decision · high authority
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}

export function MemoryCompoundsHero() {
  return (
    <>
      <header className="marketing-header">
        <nav
          className="marketing-nav"
          aria-label="Primary navigation"
        >
          <a
            href="/"
            className="font-mono text-[16px] font-semibold tracking-[-0.02em] text-[var(--text)]"
          >
            minutes
          </a>

          <div className="hidden items-center gap-7 text-[14px] text-[var(--text-secondary)] lg:flex">
            <NavigationLinks />
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            <GitHubStarsLink />
            <a
              href="#install"
              className="inline-flex rounded-[4px] bg-[var(--accent)] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--marketing-button-text)] hover:bg-[var(--accent-hover)]"
            >
              Download
            </a>
          </div>

          <details className="marketing-mobile-menu lg:hidden">
            <summary>Menu</summary>
            <div className="marketing-mobile-links">
              <NavigationLinks mobile />
              <a
                href="#install"
                onClick={closeMobileMenu}
                className="mt-3 bg-[var(--accent)] px-4 py-3 text-center font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--marketing-button-text)]"
              >
                Download
              </a>
            </div>
          </details>
        </nav>
      </header>

      <section className="marketing-hero" aria-labelledby="home-title">
        <div className="marketing-hero-copy">
          <p className="marketing-eyebrow">
            Open source · Local first · MIT
          </p>
          <h1 id="home-title">
            Your conversations. Your memory.
            <span>Ready for the AI you use.</span>
          </h1>
          <p className="marketing-lede">
            Minutes is a free, open-source conversation memory app. Record and
            transcribe meetings, voice memos, and dictation locally. Let Claude,
            Codex, and other AI assistants search the history you choose to share.
          </p>

          <div className="marketing-actions">
            <a href="#install" className="marketing-primary-action">
              Download Minutes
            </a>
            <a href="/for-agents#try" className="marketing-secondary-action">
              Try it with your AI
            </a>
          </div>

          <p className="marketing-proof-line">
            {GITHUB_STARS} stars · {GITHUB_FORKS} forks ·{" "}
            {GITHUB_CONTRIBUTORS} contributors · {NPM_MONTHLY_DOWNLOADS} npm
            downloads/mo
          </p>

          <div className="marketing-works-with">
            <span>One folder, every surface</span>
            <div>
              <strong>Desktop</strong>
              <strong>CLI</strong>
              <strong>Claude</strong>
              <strong>Codex</strong>
              <strong>Any MCP client</strong>
            </div>
          </div>
        </div>

        <div id="memory-flow" className="marketing-hero-product">
          <p className="marketing-product-kicker">
            One conversation. One durable file. Recall with a source.
          </p>
          <MemorySequence />
        </div>
      </section>

      <section className="marketing-proof-band" aria-label="Minutes proof points">
        <div className="marketing-proof-band-inner">
          <div>
            <span>Your folder of truth</span>
            <strong>Plain Markdown</strong>
            <p>Readable without Minutes. Ten years from now, grep still works.</p>
          </div>
          <div>
            <span>Processing</span>
            <strong>Local by design</strong>
            <p>Capture and transcription stay local. Cloud AI receives only the context you authorize.</p>
          </div>
          <div>
            <span>Command surfaces</span>
            <strong>CLI + {MINUTES_MCP_TOOL_COUNT} MCP tools</strong>
            <p>Run Minutes in your shell or through Claude, Codex, Gemini, and any MCP client.</p>
          </div>
          <a href="/compare">
            <span>Choose by fit</span>
            <strong>Compare Minutes</strong>
            <p>See the differences in architecture, ownership, workflow, and tradeoffs.</p>
          </a>
        </div>
      </section>
    </>
  );
}
