import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import WorldClockTool from "@/components/tools/WorldClockTool";

export const metadata: Metadata = {
  title: "World Clock & Accurate Timezones | proChange",
  description: "Accurate live international clocks, UTC offsets, day/night cycles, and interactive meeting scrubber powered by countries.dev API.",
};

export default function Page() {
  return (
    <AppShell activeTool="world-clock">
      <WorldClockTool />
    </AppShell>
  );
}
