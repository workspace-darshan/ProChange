import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import UrlEncoderTool from "@/components/tools/UrlEncoderTool";

export const metadata: Metadata = {
  title: "URL Encoder & Decoder | proChange",
  description: "URL Encoder & Decoder - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="url-encoder">
      <UrlEncoderTool />
    </AppShell>
  );
}
