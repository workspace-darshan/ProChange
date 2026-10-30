import AppShell from "@/components/layout/AppShell";
import ToolRouter from "@/components/ToolRouter";
import { tools } from "@/lib/tools/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const found = tools.find((t) => t.id === tool);
  if (!found) return { title: "ProChange" };
  return {
    title: `${found.name} — ProChange`,
    description: found.description,
  };
}

export default async function ToolDynamicPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const found = tools.find((t) => t.id === tool);
  if (!found) {
    notFound();
  }
  return (
    <AppShell activeTool={tool}>
      <ToolRouter toolId={tool} />
    </AppShell>
  );
}
