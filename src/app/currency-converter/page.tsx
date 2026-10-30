import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import CurrencyConverterTool from "@/components/tools/CurrencyConverterTool";

export const metadata: Metadata = {
  title: "Currency & Crypto Converter | proChange",
  description: "Currency & Crypto Converter - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="currency-converter">
      <CurrencyConverterTool />
    </AppShell>
  );
}
