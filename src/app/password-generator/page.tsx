import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import PasswordGeneratorTool from "@/components/tools/PasswordGeneratorTool";

export const metadata: Metadata = {
  title: "Password Generator | proChange",
  description: "Password Generator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="password-generator">
      <PasswordGeneratorTool />
    </AppShell>
  );
}
