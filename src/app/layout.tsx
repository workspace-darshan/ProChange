import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProChange — All-in-One Developer & Utility Suite",
  description: "A fast, local-first powerhouse suite for everyday developer & productivity tasks.",
  icons: {
    icon: "/pro-change-logo-1024.png",
    shortcut: "/pro-change-logo-1024.png",
    apple: "/pro-change-logo-1024.png",
  },
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
