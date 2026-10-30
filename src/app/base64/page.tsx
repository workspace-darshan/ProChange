import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import Base64Tool from "@/components/tools/Base64Tool";

export const metadata: Metadata = {
  title: "Base64 Text & Image Converter | proChange",
  description: "Base64 Text & Image Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="base64">
      <Base64Tool />
    </AppShell>
  );
}
