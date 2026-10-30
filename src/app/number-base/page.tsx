import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import NumberBaseTool from "@/components/tools/NumberBaseTool";

export const metadata: Metadata = {
  title: "Number Base Converter | proChange",
  description: "Number Base Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="number-base">
      <NumberBaseTool />
    </AppShell>
  );
}
