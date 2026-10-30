import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import JsonToCsvTool from "@/components/tools/JsonToCsvTool";

export const metadata: Metadata = {
  title: "JSON Array to CSV Converter | proChange",
  description: "JSON Array to CSV Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="json-to-csv">
      <JsonToCsvTool />
    </AppShell>
  );
}
