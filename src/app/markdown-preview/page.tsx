import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import MarkdownPreviewTool from "@/components/tools/MarkdownPreviewTool";

export const metadata: Metadata = {
  title: "Markdown Live Previewer | proChange",
  description: "Markdown Live Previewer - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="markdown-preview">
      <MarkdownPreviewTool />
    </AppShell>
  );
}
