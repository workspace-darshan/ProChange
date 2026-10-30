import { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import MovieExplorerTool from "@/components/tools/MovieExplorerTool";

export const metadata: Metadata = {
  title: "Movie & TV Explorer | proChange",
  description: "Movie & TV Explorer - Fast, privacy-first local developer utility on proChange.",
};

export default function Page() {
  return (
    <AppShell activeTool="movie-explorer">
      <MovieExplorerTool />
    </AppShell>
  );
}
