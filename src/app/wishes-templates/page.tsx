import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import WishesTemplatesTool from "@/components/tools/WishesTemplatesTool";

export const metadata: Metadata = {
  title: "Wishes & Messages Templates | proChange",
  description: "Wishes & Messages Templates - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="wishes-templates">
      <WishesTemplatesTool />
    </AppShell>
  );
}
