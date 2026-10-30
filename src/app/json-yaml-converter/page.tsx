import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import JsonYamlTool from "@/components/tools/JsonYamlTool";

export const metadata: Metadata = {
  title: "JSON to YAML Converter | proChange",
  description: "JSON to YAML Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="json-yaml-converter">
      <JsonYamlTool />
    </AppShell>
  );
}
