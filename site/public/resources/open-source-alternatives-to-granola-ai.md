# Open-source Granola alternatives

Last reviewed: 2026-10-29 · Written by the Minutes maintainer

Granola is not open source, and it transcribes in the cloud. The best open-source pick depends on what you liked about Granola: the notepad, the bot-free capture, or the meeting memory your AI can read. There are nine open-source projects below. This is a documentation review of each project's repo, license, and docs, not a hands-on benchmark.

## Quick answer

For the editable AI notepad, Anarlog (formerly Hyprnote) is the closest open-source match. For local transcription and summaries, Meetily is the most widely used. For meetings saved as Markdown that your existing AI assistant can search, consider Minutes. Check whether transcription runs on your machine by default and where notes are stored.

## Granola, for reference

macOS, Windows, iOS, and Android; no bot. Transcription goes through third-party cloud providers and notes are stored on Granola's servers. Free Basic plan, paid Business and Enterprise plans, hosted MCP server. Source code is not published.

## Side by side

| Project | License | Platforms | On-device transcription | Storage | MCP | Capture |
|---|---|---|---|---|---|---|
| Minutes (Parakeet v3 on Apple Silicon, Whisper elsewhere) | MIT | macOS (Apple Silicon), Windows; Linux CLI | Yes, by default | Markdown + YAML files | Yes, local | Mic and system audio, no bot |
| Anarlog (formerly Hyprnote) | MIT; enterprise directory commercial | macOS, Windows, Linux; mobile in beta | On Mac only; cloud is the easy path | SQLite and files; Markdown export | Yes | Device audio, no bot |
| Meetily | MIT; PRO is separate and paid | macOS, Windows; Linux from source | Yes | Local SQLite | Not found | Device audio, no bot |
| OpenWhispr | MIT | macOS, Windows, Linux | Your choice of local or cloud | Local SQLite; optional cloud sync | Yes | Device audio; detects Zoom, Teams, FaceTime calls |
| StenographAI (StenoAI) | MIT | macOS; Windows and Linux alpha | Yes, by default | Markdown | Agent skill; no server found | Mic and system audio, no bot |
| OpenOats | MIT | macOS 14.2+ (Apple Silicon) | Yes | Plain-text files | Not found | Device audio, no bot |
| LokalBot | GPL-3.0 | macOS 15+ (Apple Silicon); Windows, Linux alpha | Yes, by default | Not stated | Optional, read-only | Device audio, no bot |
| Omi | MIT | macOS, iOS, Android, wearable; Windows from source | No; Omi backend | Omi backend | Hosted | Device, phone, or wearable |
| Vexa | Apache-2.0 | Self-hosted server, or hosted | Only with your own GPU service | Postgres and a Markdown workspace | Yes | Meeting bot |

"Not found" means a search of the repo turned up nothing.

## Common questions

- **Is Granola open source?** No. Its application terms grant a limited license to use the app, and the source is not published.
- **Is there a free version of Granola?** Yes, the Basic plan. It still transcribes in the cloud, and its MCP access covers only the last 30 days of notes.
- **Which alternative runs fully offline?** Minutes, Meetily, StenographAI, OpenOats, and LokalBot transcribe on-device by default; OpenWhispr can with local models; Anarlog can on a Mac. Summaries stay offline only with a local model or none.
- **Windows?** Minutes, Anarlog, Meetily, and OpenWhispr ship Windows builds; StenographAI and LokalBot are alpha; Omi builds from source; OpenOats is Mac-only.
- **MCP like Granola's?** Minutes, Anarlog, OpenWhispr, and Vexa ship MCP servers; StenographAI ships an agent skill; LokalBot has an optional read-only one; Omi's is hosted.

None of these is a drop-in replacement for Granola's hosted sharing and workspace features.

Try [Minutes with sample meetings](https://useminutes.app/for-agents#try), check the [proof limits](https://useminutes.app/proof), or read [Minutes vs Granola](https://useminutes.app/compare/granola-vs-minutes).

## Sources

- [Granola application terms](https://docs.granola.ai/help-center/policies/terms-of-service/application-terms-of-service)
- [Granola security](https://www.granola.ai/security)
- [Granola pricing](https://www.granola.ai/pricing)
- [Granola MCP](https://docs.granola.ai/help-center/sharing/integrations/mcp)
- [Anarlog](https://github.com/fastrepl/anarlog) · [licensing](https://github.com/fastrepl/anarlog/blob/main/LICENSING.md) · [models and providers](https://docs.anarlog.so/models-and-providers)
- [Meetily](https://github.com/Zackriya-Solutions/meetily) · [PRO](https://meetily.ai/pro/)
- [OpenWhispr](https://github.com/OpenWhispr/openwhispr) · [MCP](https://docs.openwhispr.com/integrations/mcp)
- [StenographAI](https://github.com/stenolabs/stenoai)
- [OpenOats](https://github.com/yazinsai/OpenOats)
- [LokalBot](https://github.com/stevyhacker/lokalbot)
- [Omi](https://github.com/BasedHardware/omi) · [transcription backend](https://docs.omi.me/doc/developer/backend/transcription)
- [Vexa](https://github.com/Vexa-ai/vexa) · [MCP](https://docs.vexa.ai/vexa-mcp)
- [Minutes](https://github.com/silverstein/minutes) · [security](https://useminutes.app/security)
