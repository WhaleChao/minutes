# Minutes vs Wispr Flow

Last reviewed: 2026-10-29

Wispr Flow is a polished AI dictation app: speak anywhere and get edited text, on your computer or phone. It is closed source, and its own data-controls page says transcription always happens in the cloud. Minutes is an open-source (MIT) alternative that transcribes on your machine and saves every dictation as a Markdown file, next to your meetings and voice memos, where Claude, Codex, or another assistant can find it later.

## Quick verdict

- Choose **Wispr Flow** if you want the most polished dictation with AI editing, on your phone as well as your computer, and cloud transcription is fine for what you say.
- Choose **Minutes** if you want dictation that never leaves your machine, costs nothing, and builds a searchable record your AI assistant can work from, and you can do without AI rephrasing.

## At a glance

- Where speech is transcribed — Wispr Flow: always in the cloud; Minutes: on your machine (Parakeet v3 on Apple Silicon once installed, Whisper otherwise)
- Text cleanup — Wispr Flow: AI auto-edits, per-app styles; Minutes: rule-based editing on your device (fillers, self-corrections, voice commands for new lines and bullets, snippets, and on a Mac, formatting for terminals and AI chat apps), no AI rephrasing
- Where the text goes — Wispr Flow: the active text field, history optionally stored on Wispr's servers; Minutes: at the cursor on a Mac, clipboard on Windows and Linux, plus a Markdown file on your disk
- Custom words — Wispr Flow: self-learning dictionary and snippets; Minutes: dictation dictionary (up to 128 entries) and voice snippets, and it offers to save spellings you fix in Minutes
- AI assistant access — Wispr Flow: Command Mode edits selected text by voice; Minutes: Claude, Codex, or any MCP client can list and search your dictations with your meetings and memos
- Open source — Wispr Flow: no; Minutes: yes, MIT
- Platforms — Wispr Flow: macOS, Windows, iOS, Android; Minutes: macOS and Windows desktop apps, Linux CLI
- Pricing — Wispr Flow: free plan of 2,000 words a week on desktop, Pro $15/user/month or $12 billed annually; Minutes: free

## Where Wispr Flow wins

- Further-reaching edits: AI removes fillers, applies self-corrections, formats lists, and adapts tone per app, and can rephrase. Minutes handles fillers, self-corrections, and spoken bullets with rules, but does not rephrase or change tone
- Phone apps on iOS and Android; Minutes has none, and types at the cursor only on a Mac
- Command Mode for rewriting or searching selected text by voice

## Where Minutes wins

- Transcription on your own machine, with no account and no server holding your audio or transcripts
- Every dictation saved as Markdown that your AI assistant can search alongside meetings and memos
- MIT licensed, free, no weekly word limit

## Speed

On an Apple Silicon Mac, Parakeet v3 decoded a typical clip from 39 of our own dictation clips in 51 ms, against 168 ms for Whisper small (model time on an M4 Max, not end-to-end latency). See https://useminutes.app/writing/whisper-cpp-vs-parakeet-cpp

## Sources

- https://wisprflow.ai/data-controls
- https://wisprflow.ai/privacy-policy
- https://wisprflow.ai/pricing
- https://wisprflow.ai/features
- https://wisprflow.ai/terms-of-service
- https://docs.wisprflow.ai/articles/4816967992-how-to-use-command-mode
- https://github.com/silverstein/minutes
