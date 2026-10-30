import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import XmlFormatterTool from "@/components/tools/XmlFormatterTool";

export const metadata: Metadata = {
  title: "XML Formatter | proChange",
  description: "XML Formatter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="xml-formatter">
      <XmlFormatterTool />
    </AppShell>
  );
}
