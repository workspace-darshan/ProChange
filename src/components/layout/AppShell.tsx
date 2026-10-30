"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Command,
  Sun,
  Moon,
  Github,
  PanelLeftClose,
  PanelLeft,
  X,
  Zap,
  Code2,
  ArrowRightLeft,
  ArrowLeftRight,
  Braces,
  Sparkles,
  IndianRupee,
  Paintbrush,
} from "lucide-react";
import { tools, ToolCategory } from "@/lib/tools/registry";

const categoryIcons: Record<string, typeof Braces> = {
  Converters: ArrowRightLeft,
  "Encoders & Decoders": ArrowLeftRight,
  Formatters: Braces,
  Generators: Sparkles,
  "Daily & Finance": IndianRupee,
  "Testers & Text": Code2,
};

interface AppShellProps {
  activeTool: string;
  children: React.ReactNode;
}

export default function AppShell({ activeTool, children }: AppShellProps) {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentTool = tools.find((t) => t.id === activeTool) || null;

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const searchFiltered = tools.filter((t) =>
    (t.name + " " + t.description + " " + t.keywords.join(" "))
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <main className={dark ? "app dark" : "app light"}>
      {/* Top Navbar */}
      <header className="topbar">
        <Link
          href="/"
          className="brand"
          title="Return to proChange Dashboard"
        >
          <div className="brand-mark">
            <img
              src="/pro-change-logo-1024.png"
              alt="proChange logo"
              width={28}
              height={28}
              className="brand-logo-img"
            />
          </div>
          <span className="brand-title">proChange</span>
        </Link>

        <div className="topbar-center">
          <button className="global-search" onClick={() => setSearchOpen(true)}>
            <Search size={15} />
            <span>Search 26 tools, shortcuts, mock data, salary...</span>
            <kbd>
              <Command size={11} /> K
            </kbd>
          </button>
        </div>

        <div className="topbar-actions">
          <button
            className="icon-button"
            aria-label="Toggle theme"
            onClick={() => setDark((v) => !v)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            className="icon-button"
            href="https://github.com/workspace-darshan/ProChange"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub Repository"
          >
            <Github size={16} />
          </a>
        </div>
      </header>

      {/* App Shell */}
      <div className="shell">
        {/* Fixed Non-scrolling Sidebar */}
        {sidebarOpen && (
          <aside className="sidebar">
            <div className="side-head">
              <span>WORKSPACE</span>
              <button
                className="subtle-icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Hide sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>

            <Link
              href="/"
              className={
                "nav-overview " + (activeTool === "home" ? "active-home" : "")
              }
            >
              <div className="nav-mini-icon">
                <Zap size={16} />
              </div>
              <span>Dashboard / Home</span>
              <span className="count">{tools.length}</span>
            </Link>

            {/* Featured Whiteboard & Architecture Canvas */}
            <Link
              href="/canvas-board"
              className={
                "nav-overview " + (activeTool === "canvas-board" ? "active-home" : "")
              }
              style={{ marginTop: "-6px", marginBottom: "14px" }}
              title="Eraser.io & Notion-style Whiteboard & Architecture Canvas"
            >
              <div className="nav-mini-icon" style={{ background: "rgba(124, 92, 252, 0.16)", color: "#9d85fc" }}>
                <Paintbrush size={15} />
              </div>
              <span style={{ fontWeight: 700 }}>Whiteboard Canvas</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "9.5px",
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid rgba(124, 92, 252, 0.4)",
                  background: "rgba(124, 92, 252, 0.12)",
                  color: "#9d85fc",
                  letterSpacing: "0.5px",
                }}
              >
                ERASER
              </span>
            </Link>

            <div className="side-label">ALL {tools.length} UTILITIES</div>

            <div className="sidebar-scroll-list">
              {Object.entries(
                tools.reduce(
                  (groups, t) => ({
                    ...groups,
                    [t.category]: [...(groups[t.category] || []), t],
                  }),
                  {} as Record<string, typeof tools>
                )
              ).map(([category, list]) => {
                const Icon = categoryIcons[category] ?? Code2;
                return (
                  <div className="nav-group" key={category}>
                    <div className="nav-category">
                      <Icon size={14} />
                      <span>{category}</span>
                    </div>
                    {list.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/${tool.id}`}
                        className={
                          "tool-nav " + (activeTool === tool.id ? "selected" : "")
                        }
                      >
                        <span className="tool-symbol">{tool.icon}</span>
                        <span className="tool-nav-name">{tool.name}</span>
                        {activeTool === tool.id && <span className="active-dot" />}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="sidebar-bottom">
              <div className="version-row">
                <span>proChange v2.0.0</span>
              </div>
            </div>
          </aside>
        )}

        {/* Vertically Scrolling Middle Area */}
        <section className="main-area">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <button
              className="crumb-home"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeft size={15} />
              ) : (
                <PanelLeftClose size={15} />
              )}
            </button>
            <Link href="/" className="crumb-link-btn">
              proChange
            </Link>
            <span className="crumb-slash">/</span>
            {activeTool === "home" || !currentTool ? (
              <span className="crumb-active">Dashboard & Tools Directory</span>
            ) : (
              <>
                <span className="crumb-category">{currentTool.category}</span>
                <span className="crumb-slash">/</span>
                <span className="crumb-active">{currentTool.name}</span>
              </>
            )}
            <span className="crumb-spacer" />
          </div>

          {/* Page Content */}
          {children}
        </section>
      </div>

      {/* Global Command Palette Search Modal */}
      {searchOpen && (
        <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-search-row">
              <Search size={17} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, conversions, mock data, salary, qr..."
              />
              <kbd>ESC</kbd>
              <button
                className="subtle-icon"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>
            <div className="search-results">
              <div className="results-label">
                {searchQuery ? "SEARCH RESULTS" : "ALL 26 UTILITIES"}
              </div>
              {searchFiltered.length ? (
                searchFiltered.map((t) => (
                  <Link
                    key={t.id}
                    href={`/${t.id}`}
                    className="search-result"
                    onClick={() => setSearchOpen(false)}
                  >
                    <span className="result-icon">{t.icon}</span>
                    <span className="result-copy">
                      <strong>{t.name}</strong>
                      <small>{t.description}</small>
                    </span>
                    <span className="result-category">{t.category}</span>
                    <span className="result-enter">↵</span>
                  </Link>
                ))
              ) : (
                <div className="no-results">
                  No tools found matching &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
