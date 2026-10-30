# Open-source Wispr Flow alternatives

Last reviewed: 2026-10-29 · Written by the Minutes maintainer

Wispr Flow is closed source and transcribes everything you say in the cloud. Seven open-source dictation apps, checked against each project's repo, license, and README. This is a documentation review, not a hands-on test.

## Quick answer

For simple local dictation, Handy is the most widely used. For the closest match to Wispr Flow's features, including AI cleanup, OpenWhispr. For dictation that becomes notes your AI assistant can search alongside your meetings, consider Minutes. Wispr Flow's AI editing and phone apps are more polished than anything here.

## Wispr Flow, for reference

macOS, Windows, iOS, Android. Cloud transcription, then AI edits (fillers, self-corrections, lists, per-app tone), dictionary, snippets, Command Mode. Free plan: 2,000 words a week on desktop. Pro: $15/user/month, $12 billed annually. Training on your data is opt-in. Not open source.

## Side by side

| Project | License | Platforms | Local transcription by default | Engines | AI cleanup | Types into any app |
|---|---|---|---|---|---|---|
| Minutes | MIT | macOS, Windows; Linux CLI | Yes | Parakeet v3 (Apple Silicon), Whisper | None; rule-based self-corrections and voice commands on your device | At the cursor on Mac; clipboard on Windows and Linux |
| Handy | MIT (brand excluded) | macOS, Windows, Linux | Yes | Whisper, Parakeet v3 | Optional, off by default; cloud or Apple Intelligence | Yes |
| OpenWhispr | MIT | macOS, Windows, Linux | Your choice of local or cloud | Whisper, Parakeet, cloud providers | Local llama.cpp or cloud models | Yes |
| FluidVoice | GPL-3.0 | macOS | Yes | Parakeet, Whisper, Apple Speech, others | Optional; cloud or a closed local model | Yes |
| VoiceInk | GPL-3.0; paid app downloads | macOS 15+ | Yes | whisper.cpp, Parakeet | Optional cloud AI | Yes |
| Voquill | AGPL-3.0 | macOS, Windows, Linux | Local Whisper or cloud | Whisper | Your own API key | Yes |
| FreeFlow | MIT | macOS | No by default; Groq | Any OpenAI-compatible endpoint | LLM cleanup via Groq or a local server | Yes |

Buzz transcribes files rather than typing into other apps, so it is not listed. Whispering (now part of Epicenter) was left out while its app is being reworked.

## Common questions

- **Is Wispr Flow open source?** No. Its terms reserve the source code and forbid reverse-engineering it.
- **Does Wispr Flow work offline?** Its data-controls page says transcription always happens in the cloud.
- **Free alternatives?** All of these are open source; Minutes, Handy, OpenWhispr, and FreeFlow ship free apps; VoiceInk's ready-made app is a one-time purchase.
- **Closest to Wispr Flow?** OpenWhispr for features, Handy for simple local dictation, FreeFlow for the fast cloud workflow with your own key.
- **Can my AI assistant use what I dictate?** With Minutes, every dictation is a Markdown file its MCP server can list and search. OpenWhispr also has an MCP server.

Compare directly: [Minutes vs Wispr Flow](https://useminutes.app/compare/wispr-flow-vs-minutes)

## Sources

- [Wispr Flow data controls](https://wisprflow.ai/data-controls) · [terms](https://wisprflow.ai/terms-of-service) · [pricing](https://wisprflow.ai/pricing)
- [Handy](https://github.com/cjpais/Handy)
- [OpenWhispr](https://github.com/OpenWhispr/openwhispr) · [pricing](https://openwhispr.com/pricing)
- [FluidVoice](https://github.com/altic-dev/FluidVoice)
- [VoiceInk](https://github.com/Beingpax/VoiceInk) · [app](https://tryvoiceink.com)
- [Voquill](https://github.com/voquill/voquill)
- [FreeFlow](https://github.com/zachlatta/freeflow)
- [Minutes](https://github.com/silverstein/minutes)
