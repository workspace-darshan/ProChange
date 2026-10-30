import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import WeatherTool from "@/components/tools/WeatherTool";

export const metadata: Metadata = {
  title: "Live Global Weather Forecast | proChange",
  description: "Real-time atmospheric conditions, 24-hour hourly temperatures, and 7-day outlook for any world location via Open-Meteo API.",
};

export default function Page() {
  return (
    <AppShell activeTool="weather">
      <WeatherTool />
    </AppShell>
  );
}
