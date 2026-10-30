import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import JsonDiffTool from "@/components/tools/JsonDiffTool";

export const metadata: Metadata = {
  title: "JSON Diff Inspector | proChange",
  description: "JSON Diff Inspector - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="json-diff">
      <JsonDiffTool />
    </AppShell>
  );
}
