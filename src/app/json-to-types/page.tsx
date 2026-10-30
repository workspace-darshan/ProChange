import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import JsonToTypesTool from "@/components/tools/JsonToTypesTool";

export const metadata: Metadata = {
  title: "JSON to Types (TypeScript / C#) | proChange",
  description: "JSON to Types (TypeScript / C#) - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="json-to-types">
      <JsonToTypesTool />
    </AppShell>
  );
}
