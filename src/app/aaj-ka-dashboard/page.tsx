import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import AajKaDashboardTool from "@/components/tools/AajKaDashboardTool";

export const metadata: Metadata = {
  title: "Aaj Ka Dashboard | Morning Rates, Mandi Bhav, Gold, AQI & WhatsApp Card",
  description: "Your daily morning hub: Gold & Silver rates (24K/22K), Mausam + AQI, USD-INR, Mandi Bhav, Mutual Fund NAV, Daily streak, Brain quiz and 1-click WhatsApp share card.",
};

export default function Page() {
  return (
    <AppShell activeTool="aaj-ka-dashboard">
      <AajKaDashboardTool />
    </AppShell>
  );
}
