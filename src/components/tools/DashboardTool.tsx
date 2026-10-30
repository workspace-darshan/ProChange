"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  X,
  Clock3,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Keyboard,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { tools } from "@/lib/tools/registry";

export default function DashboardTool() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [scratchpad, setScratchpad] = useState("");
  const [scratchCopied, setScratchCopied] = useState(false);
  const [epoch, setEpoch] = useState(() => Math.floor(Date.now() / 1000));
  const [copiedEpoch, setCopiedEpoch] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("prochange_scratchpad");
      if (saved) setScratchpad(saved);
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      setEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const saveScratchpad = (val: string) => {
    setScratchpad(val);
    try {
      localStorage.setItem("prochange_scratchpad", val);
    } catch {
      // ignore
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const filteredTools = tools.filter((t) => {
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchesQuery =
      !query ||
      (t.name + " " + t.description + " " + t.keywords.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="workspace home-workspace">
      {/* 2-Column Top Grid: Hero on Left, Stats + Scratchpad on Right */}
      <div className="home-top-grid">
        {/* Left: Hero Banner */}
        <div className="home-top-left">
          <div className="home-hero">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <img
                  src="/pro-change-logo-1024.png"
                  alt="proChange logo"
                  width={46}
                  height={46}
                  style={{ borderRadius: "10px", boxShadow: "0 4px 16px rgba(16, 185, 129, 0.35)" }}
                />
                <div className="hero-badge" style={{ margin: 0 }}>
                  <Sparkles size={13} />
                  <span>PROCHANGE SUITE · 38 POWER UTILITIES</span>
                </div>
              </div>
              <h1 className="hero-title">proChange Developer & Daily Powerhouse</h1>
              <p className="hero-subtitle">
                Fast, local-first converters, salary in-hand calculations, 250 countries explorer, live world clock, and daily live morning dashboard.
              </p>

              {/* Aaj Ka Dashboard CTA */}
              <div style={{ marginTop: "14px", marginBottom: "16px" }}>
                <Link
                  href="/aaj-ka-dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 18px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    color: "#fef3c7",
                    fontSize: "13px",
                    fontWeight: "700",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.15)",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🌅</span>
                  <span>Aaj Ka Dashboard — Gold, Mausam, Mandi Bhav, USD & WhatsApp Rate Card</span>
                  <span style={{ color: "#fbbf24" }}>→</span>
                </Link>
              </div>
            </div>

            {/* Home Search Box */}
            <div className="hero-search-bar">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 26 utilities (e.g. mock data, salary LPA, temp mail, movies, cron, base64, qr)..."
              />
              {query && (
                <button className="hero-search-clear" onClick={() => setQuery("")}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Dashboard Metrics + Persistent Scratchpad */}
        <div className="home-top-right">
          <div className="home-stats-grid">
            <div className="stat-item">
              <span className="stat-label">CURRENT EPOCH TIMESTAMP</span>
              <div className="stat-value-row">
                <span className="stat-value">
                  <Clock3 size={13} style={{ display: "inline", marginRight: 4 }} />
                  {epoch}
                </span>
                <button
                  className="stat-copy-btn"
                  onClick={() => {
                    void copyText(epoch.toString());
                    setCopiedEpoch(true);
                    setTimeout(() => setCopiedEpoch(false), 1200);
                  }}
                  title="Copy current epoch"
                >
                  {copiedEpoch ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-label">LOCAL TIMEZONE</span>
              <span className="stat-value">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">AVAILABLE TOOLS</span>
              <span className="stat-value">{tools.length} Utilities Ready</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">DATA INTEGRITY</span>
              <span className="stat-value text-emerald">
                <CheckCircle2 size={14} /> 100% Offline / Local
              </span>
            </div>
          </div>

          <div className="home-scratchpad-card">
            <div className="scratchpad-header">
              <div className="scratchpad-title">
                <FileText size={16} />
                <strong>Developer Scratchpad (Persistent Auto-Save)</strong>
              </div>
              <div className="scratchpad-actions">
                <span className="scratchpad-stats">
                  {scratchpad.length} chars · {scratchpad.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  className="scratchpad-btn"
                  onClick={() => {
                    void copyText(scratchpad);
                    setScratchCopied(true);
                    setTimeout(() => setScratchCopied(false), 1200);
                  }}
                  disabled={!scratchpad}
                >
                  {scratchCopied ? <Check size={13} /> : <Copy size={13} />}{" "}
                  {scratchCopied ? "Copied" : "Copy Notes"}
                </button>
                <button
                  className="scratchpad-btn danger"
                  onClick={() => saveScratchpad("")}
                  disabled={!scratchpad}
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className="scratchpad-textarea"
              value={scratchpad}
              onChange={(e) => saveScratchpad(e.target.value)}
              placeholder="Jot down notes, temporary snippets, credentials, or API responses here. Auto-saved in browser local storage..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheat Sheet */}
      <div className="shortcuts-cheatsheet-section">
        <div className="cheatsheet-header">
          <Keyboard size={16} />
          <h2>Essential Keyboard Shortcuts & Pro Actions</h2>
        </div>
        <div className="shortcuts-grid">
          <div className="shortcut-card">
            <div className="shortcut-keys">
              <kbd>⌘ / Ctrl</kbd> + <kbd>K</kbd>
            </div>
            <strong>Command Palette</strong>
            <p>Instant search and jump across all 26 tools.</p>
          </div>

          <div className="shortcut-card">
            <div className="shortcut-keys">
              <kbd>⌘ / Ctrl</kbd> + <kbd>Enter</kbd>
            </div>
            <strong>Run Active Tool</strong>
            <p>Execute formatters or generators instantly.</p>
          </div>

          <div className="shortcut-card">
            <div className="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <strong>Dismiss Overlays</strong>
            <p>Close search modal or active dialogs.</p>
          </div>

          <div className="shortcut-card">
            <div className="shortcut-keys">
              <span className="custom-key-pill">Mock Data 1000</span>
            </div>
            <strong>Custom Generator</strong>
            <p>Make 1000+ records in JSON, CSV, or SQL.</p>
          </div>

          <div className="shortcut-card">
            <div className="shortcut-keys">
              <span className="custom-key-pill">Salary In-Hand</span>
            </div>
            <strong>LPA & Monthly Take-Home</strong>
            <p>Instant Indian CTC to net monthly salary.</p>
          </div>

          <div className="shortcut-card">
            <div className="shortcut-keys">
              <span className="custom-key-pill">Swap & Invert</span>
            </div>
            <strong>Bi-directional Toggle</strong>
            <p>Reverse Encoders, CSV ⇄ JSON, YAML ⇄ JSON.</p>
          </div>
        </div>
      </div>

      {/* All Tools Directory with Category Filters */}
      <div className="tools-directory-section">
        <div className="directory-header">
          <div>
            <h2>Explore All {tools.length} proChange Utilities</h2>
            <p>Showing {filteredTools.length} tools</p>
          </div>

          <div className="category-filter-pills">
            {["All", "Generators", "Converters", "Encoders & Decoders", "Daily & Finance", "Formatters", "Testers & Text"].map((cat) => (
              <button
                key={cat}
                className={`category-pill ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-cards-grid">
          {filteredTools.map((t) => (
            <Link key={t.id} href={`/${t.id}`} className="tool-card">
              <div className="tool-card-head">
                <span className="tool-card-icon">{t.icon}</span>
                {t.badge && <span className="tool-card-badge">{t.badge}</span>}
              </div>
              <h3 className="tool-card-title">{t.name}</h3>
              <p className="tool-card-desc">{t.description}</p>
              <div className="tool-card-footer">
                <span className="tool-card-cat">{t.category}</span>
                <span className="tool-card-action">
                  Open <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* About proChange & Pro Tips Section (Only on Dashboard) */}
      <div className="below-grid">
        <div className="info-card">
          <div className="info-card-title">
            <div className="info-icon">
              <Zap size={16} />
            </div>
            <strong>About proChange Suite</strong>
          </div>
          <p>
            proChange is a privacy-first, zero-telemetry developer & utility suite. All mock data generation, salary math, formatting, cryptographic operations, and conversions execute 100% inside your local browser engine.
          </p>
        </div>

        <div className="info-card">
          <div className="info-card-title">
            <div className="info-icon">
              <ShieldCheck size={16} />
            </div>
            <strong>Developer Privacy First</strong>
          </div>
          <p>
            No pasted passwords, tokens, or JWT payloads ever touch external analytics or remote servers. All utilities run client-side.
          </p>
        </div>
      </div>
    </div>
  );
}
