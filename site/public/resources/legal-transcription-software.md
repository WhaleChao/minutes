# Legal transcription software: what confidentiality actually requires

Last reviewed: 2026-10-29 · Not legal advice

Most "legal transcription software" pages compare accuracy, turnaround, and price, and leave the question bar regulators now ask first to a security page: where does the privileged audio go, and who can use it?

## Quick answer

- **Certified transcripts are a human service, not a software feature.** When the transcript must be evidence — proceedings, certified depositions — hire a certified transcriptionist or court reporter. Software can produce a draft, but the certification is a person's.
- **Everything else is a software job, and architecture is the buying criterion.** Client meetings, dictated memos, internal case discussions: cloud transcription tools put a third party inside privileged conversations; on-device tools keep the transcription step free of any outside party.

## The three jobs firms actually have

1. **Court-grade transcripts** — human, certified, jurisdiction-formatted. Budget for a service.
2. **Working transcripts of privileged material** — client calls, strategy discussions, dictated notes. Speed matters, confidentiality governs. ABA Formal Opinion 512 requires understanding a tool's data handling before client information goes in — an analysis that gets much shorter when the transcription never leaves your machine.
3. **Non-privileged volume** — public hearings, CLEs, marketing content. Any decent tool; pick on price.

## What bar opinions now expect

ABA Formal Opinion 512 (July 2024) set the general rule for generative AI. The New York City Bar has since applied it to transcription:

- **Formal Opinion 2025-6** (December 2025), client calls: tell the client in advance and get consent; find out where the provider stores recordings, for how long, whether it trains on them, and whether you can delete them; review the transcript or summary before relying on it.
- **Formal Opinion 2026-2** (August 2026), non-client calls: advises against recording them by default.

Checklist for any tool: where audio is processed, retention of audio and transcripts, whether your data trains the vendor's models (and opt-out), subprocessors, deletion, and a BAA when health information is involved. Read the terms and acceptable use policy, not only the security page. Other states have their own opinions.

## Where Minutes fits — and doesn't

Minutes is built for job #2: records and transcribes on your own machine with on-device speech models, labels speakers, stores markdown on your disk with owner-only permissions — greppable, readable by your AI assistant straight from local files, with structured action items filled in once you connect one. If that assistant or a summarizer is a cloud service, the meeting context you authorize goes to that provider; use a local model or skip summarization to stay fully on-device. Open source (MIT): your security review can read the code.

Not the tool for: certified transcripts (hire a human), jurisdiction-formatted verbatim output, medical-legal templating. Your own obligations — consent, device encryption, matter-based access — stay with you.

## Sources

- Privilege analysis: https://useminutes.app/resources/ai-notetakers-attorney-client-privilege
- ABA Formal Opinion 512: https://www.americanbar.org/content/dam/aba/administrative/professional_responsibility/ethics-opinions/aba-formal-opinion-512.pdf
- NYC Bar Formal Opinion 2025-6: https://www.nycbar.org/reports/formal-opinion-2025-6-ethical-issues-affecting-use-of-ai-to-record-transcribe-and-summarize-conversations-with-clients/
- NYC Bar Formal Opinion 2026-2: https://www.nycbar.org/reports/formal-opinion-2026-2-ethical-use-of-ai-for-recording-transcribing-and-summarizing-non-client-conversations/
- Architecture: https://useminutes.app/security
- https://github.com/silverstein/minutes
