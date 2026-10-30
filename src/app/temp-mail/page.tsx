import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import TempMailTool from "@/components/tools/TempMailTool";

export const metadata: Metadata = {
  title: "Disposable Temp Mail | proChange",
  description: "Disposable Temp Mail - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="temp-mail">
      <TempMailTool />
    </AppShell>
  );
}
