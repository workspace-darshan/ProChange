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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('prochange_theme');
                  var isLight = t === 'light';
                  if (isLight) {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
