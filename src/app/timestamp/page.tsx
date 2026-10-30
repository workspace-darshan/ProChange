import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import TimestampConverterTool from "@/components/tools/TimestampConverterTool";

export const metadata: Metadata = {
  title: "Timestamp & Date Converter | proChange",
  description: "Timestamp & Date Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="timestamp">
      <TimestampConverterTool />
    </AppShell>
  );
}
