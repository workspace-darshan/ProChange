import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import JsonFormatterTool from "@/components/tools/JsonFormatterTool";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator | proChange",
  description: "JSON Formatter & Validator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="json-formatter">
      <JsonFormatterTool />
    </AppShell>
  );
}
