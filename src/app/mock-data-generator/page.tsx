import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import MockDataGeneratorTool from "@/components/tools/MockDataGeneratorTool";

export const metadata: Metadata = {
  title: "Custom Mock Data Generator | proChange",
  description: "Custom Mock Data Generator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="mock-data-generator">
      <MockDataGeneratorTool />
    </AppShell>
  );
}
