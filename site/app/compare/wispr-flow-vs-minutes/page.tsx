import type { Metadata } from "next";
import { ComparePage } from "@/components/compare-page";

export const metadata: Metadata = {
  title: "Minutes vs Wispr Flow: an open-source, local alternative",
  description:
    "Wispr Flow transcribes in the cloud and is closed source. Minutes is MIT-licensed dictation that runs on your machine and saves every dictation as Markdown.",
  alternates: {
    canonical: "/compare/wispr-flow-vs-minutes",
  },
};

const comparisonRows = [
  {
    label: "Best for",
    competitor: "Polished AI dictation into any app, on desktop and phone",
    minutes: "Local dictation that also feeds a searchable archive of your meetings, memos, and notes",
  },
  {
    label: "Where speech is transcribed",
    competitor: "Always in the cloud, per Wispr's data-controls page",
    minutes: "On your machine: Parakeet v3 on Apple Silicon once installed, Whisper otherwise",
  },
  {
    label: "Text cleanup",
    competitor: "AI auto-edits: filler removal, self-corrections, lists, punctuation, per-app styles",
    minutes: "Rule-based cleanup on your device (filler words, snippets, voice commands); no AI rewriting",
  },
  {
    label: "Where the text goes",
    competitor: "Into the active text field; history can be stored on Wispr's servers (a setting)",
    minutes: "At your cursor on a Mac, on the clipboard on Windows and Linux, and saved as a Markdown file on your disk",
  },
  {
    label: "Custom words",
    competitor: "Self-learning personal dictionary and voice snippets",
    minutes: "Dictation dictionary (up to 128 entries) and voice snippets",
  },
  {
    label: "AI assistant access",
    competitor: "Command Mode edits selected text by voice (paid, experimental)",
    minutes: "Claude, Codex, or any MCP client can list and search your dictations alongside meetings and memos",
  },
  {
    label: "Meetings",
    competitor: "Notetaker on Mac and Windows",
    minutes: "Meeting recording with speaker labels, action items, and decisions, in the same archive",
  },
  {
    label: "Open source",
    competitor: "No",
    minutes: "Yes, MIT",
  },
  {
    label: "Platforms",
    competitor: "macOS, Windows, iOS, Android",
    minutes: "macOS and Windows desktop apps; Linux CLI",
  },
  {
    label: "Pricing",
    competitor: "Free: 2,000 words a week on desktop. Pro: $15 per user per month, or $12 billed annually",
    minutes: "Free",
  },
] as const;

const sources = [
  { label: "Wispr Flow data controls", href: "https://wisprflow.ai/data-controls" },
  { label: "Wispr Flow privacy policy", href: "https://wisprflow.ai/privacy-policy" },
  { label: "Wispr Flow pricing", href: "https://wisprflow.ai/pricing" },
  { label: "Wispr Flow features", href: "https://wisprflow.ai/features" },
  { label: "Wispr Flow terms of service", href: "https://wisprflow.ai/terms-of-service" },
  { label: "Wispr Flow Command Mode", href: "https://docs.wisprflow.ai/articles/4816967992-how-to-use-command-mode" },
  { label: "Whisper vs Parakeet v3: our dictation measurements", href: "https://useminutes.app/writing/whisper-cpp-vs-parakeet-cpp" },
  { label: "Minutes MCP reference", href: "https://useminutes.app/docs/mcp/tools" },
  { label: "Minutes on GitHub", href: "https://github.com/silverstein/minutes" },
] as const;

export default function WisprFlowVsMinutesPage() {
  return (
    <ComparePage
      competitorName="Wispr Flow"
      competitorLabel="Wispr Flow"
      markdownHref="/compare/wispr-flow-vs-minutes.md"
      lastReviewed="2026-10-29"
      heroSummary="Wispr Flow is a polished AI dictation app: speak anywhere and get edited text, on your computer or phone. It is closed source, and its own data-controls page says transcription always happens in the cloud. Minutes is an open-source (MIT) alternative that transcribes on your machine and saves every dictation as a Markdown file, next to your meetings and voice memos, where Claude, Codex, or another assistant can find it later."
      quickVerdictCompetitor="you want the most polished dictation with AI editing, on your phone as well as your computer, and cloud transcription is fine for what you say."
      quickVerdictMinutes="you want dictation that never leaves your machine, costs nothing, and builds a searchable record your AI assistant can work from, and you can do without AI rewriting."
      comparisonRows={comparisonRows as any}
      competitorWins={[
        "The text you get is better finished. Wispr Flow's AI edits remove fillers, apply your self-corrections, format lists, and adapt tone per app. Minutes applies rules on your device and does not rewrite what you said.",
        "It runs on iOS and Android as well as Mac and Windows. Minutes has no mobile app, and on Windows and Linux the text goes to the clipboard rather than being typed at the cursor.",
        "Command Mode lets you rewrite or search selected text by voice. Minutes has no equivalent.",
      ]}
      minutesWins={[
        "Your voice is transcribed on your own machine. There is no account and no server holding your audio or transcripts, so there is no storage setting to check.",
        "Every dictation is saved as a Markdown file, and Claude, Codex, or any MCP client can list and search those files alongside your meetings and memos. Dictation becomes notes your assistant can triage, not just text that disappears into a field.",
        "It is MIT licensed and free, with no weekly word limit. You can read the capture and transcription code, and change it.",
      ]}
      workflowSection={[
        "With Wispr Flow, dictation is mainly input: you speak and finished text appears where you are typing. With Minutes, each dictation is also a record. It lands in the same local archive as your recorded meetings and voice memos, so you can ask an assistant later what you said about a project last week and get the source file back.",
        "On an Apple Silicon Mac, Minutes transcribes with NVIDIA's Parakeet v3 once you install it from the app. On 39 of our own dictation clips it decoded a typical clip in 51 ms, against 168 ms for Whisper small, which Minutes uses elsewhere. That is model time on an M4 Max, not end-to-end latency from releasing the key, which we have not measured.",
      ]}
      chooseSection={[
        "Choose Wispr Flow if the quality of the finished text matters most, you dictate on your phone, or you rely on per-app styles and Command Mode.",
        "Choose Minutes if your voice should stay on your machine, you want dictation and meetings in one archive your AI can search, or you want an open-source tool you can inspect and extend.",
        "Using both works too: Wispr Flow for polished text on your phone, Minutes for private dictation and meeting capture on your computer.",
      ]}
      notRightFitSection={[
        "Minutes is not the right choice if you want AI to clean up and restyle your dictation. It removes filler words and expands snippets, but it does not rewrite sentences.",
        "It is also not the fit if you mainly dictate on a phone, or if you want text typed at the cursor on Windows today.",
      ]}
      evaluatedSection={[
        "Reviewed on October 29, 2026 against Wispr Flow's own data-controls page, privacy policy, pricing, features page, terms of service, and Command Mode documentation. Wispr Flow was not installed or tested for this page.",
        "Minutes claims are taken from its source code: dictation engines, cleanup rules, where text is written, and which MCP tools return dictations. The Parakeet timing comes from our published benchmark, linked below.",
      ]}
      sources={sources as any}
    />
  );
}
