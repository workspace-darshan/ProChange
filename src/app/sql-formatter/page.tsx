import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import SqlFormatterTool from "@/components/tools/SqlFormatterTool";

export const metadata: Metadata = {
  title: "SQL Query Formatter | proChange",
  description: "SQL Query Formatter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="sql-formatter">
      <SqlFormatterTool />
    </AppShell>
  );
}
