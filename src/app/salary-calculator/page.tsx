import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import SalaryCalculatorTool from "@/components/tools/SalaryCalculatorTool";

export const metadata: Metadata = {
  title: "Salary & LPA In-Hand Calculator | proChange",
  description: "Salary & LPA In-Hand Calculator - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="salary-calculator">
      <SalaryCalculatorTool />
    </AppShell>
  );
}
