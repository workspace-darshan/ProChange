import AppShell from "@/components/layout/AppShell";
import ToolRouter from "@/components/ToolRouter";
import { tools } from "@/lib/tools/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return tools.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = tools.find((t) => t.id === id);
  if (!found) return { title: "ProChange" };
  return {
    title: `${found.name} — ProChange`,
    description: found.description,
  };
}

export default async function ToolSubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = tools.find((t) => t.id === id);
  if (!found) {
    notFound();
  }
  return (
    <AppShell activeTool={id}>
      <ToolRouter toolId={id} />
    </AppShell>
  );
}
