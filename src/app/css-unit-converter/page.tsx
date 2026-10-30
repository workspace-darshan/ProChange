import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import CssUnitConverterTool from "@/components/tools/CssUnitConverterTool";

export const metadata: Metadata = {
  title: "CSS Unit Converter (PX to REM) | proChange",
  description: "CSS Unit Converter (PX to REM) - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="css-unit-converter">
      <CssUnitConverterTool />
    </AppShell>
  );
}
