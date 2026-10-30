import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import CurlToFetchTool from "@/components/tools/CurlToFetchTool";

export const metadata: Metadata = {
  title: "cURL to Fetch Converter | proChange",
  description: "cURL to Fetch Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="curl-to-fetch">
      <CurlToFetchTool />
    </AppShell>
  );
}
