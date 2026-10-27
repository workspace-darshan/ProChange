import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "DevDock — Developer Toolbox",
  description: "A fast, local-first toolbox for everyday developer tasks.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
