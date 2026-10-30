import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import TextAnalyzerTool from "@/components/tools/TextAnalyzerTool";

export const metadata: Metadata = {
  title: "Text Case & Analyzer | proChange",
  description: "Text Case & Analyzer - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="text-analyzer">
      <TextAnalyzerTool />
    </AppShell>
  );
}
