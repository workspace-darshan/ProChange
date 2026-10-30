import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import TypingTestTool from "@/components/tools/TypingTestTool";

export const metadata: Metadata = {
  title: "Typing Speed Test (WPM & Accuracy) | proChange",
  description:
    "Fast, distraction-free typing speed test with live WPM, accuracy, consistency, English, Hindi & Gujarati scripts, daily challenge, and shareable results.",
  keywords: [
    "typing",
    "wpm",
    "speed",
    "keyboard",
    "test",
    "practice",
    "hindi typing",
    "gujarati typing",
  ],
};

export default function Page() {
  return (
    <AppShell activeTool="typing-test">
      <TypingTestTool />
    </AppShell>
  );
}
