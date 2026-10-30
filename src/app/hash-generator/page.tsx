import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import HashGeneratorTool from "@/components/tools/HashGeneratorTool";

export const metadata: Metadata = {
  title: "Cryptographic Hash Generator | proChange",
  description: "Cryptographic Hash Generator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="hash-generator">
      <HashGeneratorTool />
    </AppShell>
  );
}
