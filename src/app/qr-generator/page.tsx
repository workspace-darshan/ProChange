import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import QrGeneratorTool from "@/components/tools/QrGeneratorTool";

export const metadata: Metadata = {
  title: "QR Code Generator | proChange",
  description: "QR Code Generator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="qr-generator">
      <QrGeneratorTool />
    </AppShell>
  );
}
