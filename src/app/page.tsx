import AppShell from "@/components/layout/AppShell";
import DashboardTool from "@/components/tools/DashboardTool";

export default function Home() {
  return (
    <AppShell activeTool="home">
      <DashboardTool />
    </AppShell>
  );
}
