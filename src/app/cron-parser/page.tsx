import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import CronParserTool from "@/components/tools/CronParserTool";

export const metadata: Metadata = {
  title: "Cron Expression Parser | proChange",
  description: "Cron Expression Parser - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="cron-parser">
      <CronParserTool />
    </AppShell>
  );
}
