import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import WhiteboardCanvasTool from "@/components/tools/WhiteboardCanvasTool";

export const metadata: Metadata = {
  title: "Eraser Whiteboard & Canvas | proChange",
  description: "Eraser.io & Notion-style infinite diagramming canvas: freehand sketch, tech icons, stickies, and 1-click screenshot copy.",
};

export default function Page() {
  return (
    <AppShell activeTool="canvas-board">
      <WhiteboardCanvasTool />
    </AppShell>
  );
}
