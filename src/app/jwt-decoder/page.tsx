import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import JwtDecoderTool from "@/components/tools/JwtDecoderTool";

export const metadata: Metadata = {
  title: "JWT Token Decoder | proChange",
  description: "JWT Token Decoder - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="jwt-decoder">
      <JwtDecoderTool />
    </AppShell>
  );
}
