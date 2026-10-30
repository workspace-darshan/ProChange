import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import LoremIpsumTool from "@/components/tools/LoremIpsumTool";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator | proChange",
  description: "Lorem Ipsum Generator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="lorem-ipsum">
      <LoremIpsumTool />
    </AppShell>
  );
}
