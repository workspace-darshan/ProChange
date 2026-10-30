import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import ImageEditorTool from "@/components/tools/ImageEditorTool";

export const metadata: Metadata = {
  title: "Lightroom Image Studio & Editor | proChange",
  description: "Lightroom-grade photo editing: exposure, highlights, shadows, Kelvin temperature, vibrance, clarity, vignette, tone grading, split compare, and dynamic histogram.",
};

export default function Page() {
  return (
    <AppShell activeTool="image-editor">
      <ImageEditorTool />
    </AppShell>
  );
}
