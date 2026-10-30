import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import WorldExplorerTool from "@/components/tools/WorldExplorerTool";

export const metadata: Metadata = {
  title: "World Country Explorer | proChange",
  description: "Explore 250 sovereign countries, key statistics, borders, largest cities, and demographics live from countries.dev API.",
};

export default function Page() {
  return (
    <AppShell activeTool="world-explorer">
      <WorldExplorerTool />
    </AppShell>
  );
}
