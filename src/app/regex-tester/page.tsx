import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import RegexTesterTool from "@/components/tools/RegexTesterTool";

export const metadata: Metadata = {
  title: "Regex Pattern Tester | proChange",
  description: "Regex Pattern Tester - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="regex-tester">
      <RegexTesterTool />
    </AppShell>
  );
}
