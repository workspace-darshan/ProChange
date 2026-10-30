import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import HtmlEntitiesTool from "@/components/tools/HtmlEntitiesTool";

export const metadata: Metadata = {
  title: "HTML Entities Converter | proChange",
  description: "HTML Entities Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="html-entities">
      <HtmlEntitiesTool />
    </AppShell>
  );
}
