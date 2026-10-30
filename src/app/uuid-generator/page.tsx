import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import UuidGeneratorTool from "@/components/tools/UuidGeneratorTool";

export const metadata: Metadata = {
  title: "UUID Generator | proChange",
  description: "UUID Generator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="uuid-generator">
      <UuidGeneratorTool />
    </AppShell>
  );
}
