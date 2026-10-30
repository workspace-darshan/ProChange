import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import ColorConverterTool from "@/components/tools/ColorConverterTool";

export const metadata: Metadata = {
  title: "Color Converter & Swatch | proChange",
  description: "Color Converter & Swatch - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="color-converter">
      <ColorConverterTool />
    </AppShell>
  );
}
