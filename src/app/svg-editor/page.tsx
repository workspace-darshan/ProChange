import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import SvgEditorTool from "@/components/tools/SvgEditorTool";

export const metadata: Metadata = {
  title: "SVG Viewer & Code Editor | proChange",
  description: "Live interactive SVG XML code editor and vector canvas with syntax validation, color palette replacer, prettifier, minifier, and raster PNG export.",
};

export default function Page() {
  return (
    <AppShell activeTool="svg-editor">
      <SvgEditorTool />
    </AppShell>
  );
}
