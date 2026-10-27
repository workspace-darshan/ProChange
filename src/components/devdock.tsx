"use client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Command,
  Sun,
  Moon,
  Github,
  Copy,
  Check,
  RotateCcw,
  ArrowLeftRight,
  Braces,
  Sparkles,
  ShieldCheck,
  Clock3,
  Code2,
  Zap,
  PanelLeftClose,
  PanelLeft,
  X,
  Keyboard,
  Pipette,
  Palette,
  Calendar,
  ArrowRightLeft,
  Database,
  KeyRound,
  Globe,
  Terminal,
  FileText,
  Monitor,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { tools, ToolCategory } from "@/lib/tools/registry";
import { executeTool, parseColor } from "@/lib/tools/execute";

const samples: Record<string, string> = {
  "json-formatter":
    '{"name":"DevDock","version":1,"features":["JSON","Base64","JWT"],"fast":true}',
  "json-diff": '{\n  "name": "DevDock",\n  "version": 1\n}',
  "sql-formatter":
    "select u.id, u.name, u.email, count(o.id) as total_orders from users u left join orders o on u.id = o.user_id where u.active = 1 and u.created_at >= '2026-01-01' group by u.id, u.name, u.email having count(o.id) > 2 order by total_orders desc limit 10;",
  "css-unit-converter": "24px",
  "markdown-preview":
    "# Welcome to DevDock\n\nDevDock is a **privacy-first**, *high-speed* developer workbench.\n\n### Key Features:\n- 100% client-side execution\n- Bi-directional converters\n- Zero server telemetry\n\n```javascript\nconsole.log('Built for developers');\n```",
  base64: "Hello, developer! 👋",
  "url-encoder": "https://example.com/search?q=hello world&sort=recent",
  "html-entities": '<button class="primary">Hello & welcome</button>',
  "curl-to-fetch":
    'curl -X POST https://api.github.com/user/repos -H "Authorization: Bearer ghp_token123" -H "Content-Type: application/json" -d \'{"name": "devdock", "private": true}\'',
  "jwt-decoder":
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vLXVzZXIiLCJyb2xlIjoiZGV2ZWxvcGVyIiwiaWF0IjoxNzAwMDAwMDAwfQ.",
  "regex-tester":
    "/dev[a-z]+/gi\nDevDock helps developers. Another DEVtool is here.",
  "uuid-generator": "5",
  "lorem-ipsum": "3",
  "hash-generator": "Hello, world!",
  "password-generator": "16",
  timestamp: "1700000000",
  "cron-parser": "*/15 9-17 * * 1-5",
  "url-parser":
    "https://api.devdock.dev:8080/v1/search?category=tools&sort=desc&limit=25#results",
  "color-converter": "#7C5CFC",
};

const categoryIcons: Record<string, typeof Braces> = {
  Formatters: Braces,
  "Encoders & Decoders": ArrowLeftRight,
  Generators: Sparkles,
  "Web & Time": Clock3,
  Security: ShieldCheck,
};

const presetColors = [
  { name: "Dev Purple", hex: "#7C5CFC" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "Dark Slate", hex: "#1E293B" },
  { name: "Pure White", hex: "#FFFFFF" },
];

export default function DevDock() {
  // Navigation: "home" or any tool ID
  const [active, setActive] = useState<string>("home");
  const [input, setInput] = useState(samples["json-formatter"]);
  const [secondary, setSecondary] = useState(
    '{\n  "name": "DevDock",\n  "version": 2\n}',
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState("");
  const [extraData, setExtraData] = useState<Record<string, any>>({});
  const [query, setQuery] = useState("");
  const [homeCategoryFilter, setHomeCategoryFilter] = useState<string>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState("");
  const [history, setHistory] = useState<string[]>([
    "timestamp",
    "color-converter",
    "base64",
  ]);

  // Persistent Scratchpad
  const [scratchpad, setScratchpad] = useState<string>("");
  const [scratchCopied, setScratchCopied] = useState(false);

  // Live timestamp ticker for Dashboard
  const [currentEpoch, setCurrentEpoch] = useState<number>(() =>
    Math.floor(Date.now() / 1000),
  );

  // Bidirectional modes per tool
  const [toolModes, setToolModes] = useState<Record<string, string>>({
    base64: "encode",
    "url-encoder": "encode",
    "html-entities": "escape",
    "json-formatter": "beautify",
    "hash-generator": "SHA-256",
    "lorem-ipsum": "paragraphs",
    timestamp: "auto",
  });

  // Additional options
  const [hashFormat, setHashFormat] = useState<"hex" | "base64">("hex");
  const [uuidUppercase, setUuidUppercase] = useState(false);
  const [uuidNoHyphens, setUuidNoHyphens] = useState(false);
  const [cssBaseSize, setCssBaseSize] = useState<number>(16);

  // Color picker state
  const [currentColorHex, setCurrentColorHex] = useState("#7C5CFC");
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Datetime input state
  const [datetimeLocal, setDatetimeLocal] = useState("");

  // Load Scratchpad from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("devdock_scratchpad");
      if (saved) setScratchpad(saved);
    } catch {
      // ignore
    }
  }, []);

  const saveScratchpad = (val: string) => {
    setScratchpad(val);
    try {
      localStorage.setItem("devdock_scratchpad", val);
    } catch {
      // ignore
    }
  };

  // Live ticking epoch clock on home page
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const current = useMemo(
    () => tools.find((t) => t.id === active) || tools[0],
    [active],
  );

  const filtered = useMemo(
    () =>
      tools.filter((t) =>
        (t.name + " " + t.description + " " + t.keywords.join(" "))
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  const homeFilteredTools = useMemo(() => {
    return tools.filter((t) => {
      const matchesCategory =
        homeCategoryFilter === "All" || t.category === homeCategoryFilter;
      const matchesQuery =
        !query ||
        (t.name + " " + t.description + " " + t.keywords.join(" "))
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [homeCategoryFilter, query]);

  // Sync color hex whenever input updates in color-converter
  useEffect(() => {
    if (active === "color-converter") {
      try {
        const parsed = parseColor(input);
        setCurrentColorHex(parsed.hex);
      } catch {
        // keep current valid hex
      }
    }
  }, [input, active]);

  const selectTool = useCallback((id: string) => {
    setActive(id);
    if (id !== "home") {
      setInput(samples[id] ?? "");
      setSecondary(id === "json-diff" ? samples["json-diff"] : "");
      setOutput("");
      setError("");
      setMeta("");
      setExtraData({});
      setHistory((h) => [id, ...h.filter((x) => x !== id)].slice(0, 6));
    }
    setQuery("");
    setSearchOpen(false);
  }, []);

  const run = useCallback(async () => {
    if (active === "home") return;

    const currentMode = toolModes[active];
    const options = {
      mode: currentMode,
      algorithm: active === "hash-generator" ? currentMode : undefined,
      format: hashFormat,
      uppercase: uuidUppercase,
      noHyphens: uuidNoHyphens,
      baseSize: cssBaseSize,
    };

    const result = await executeTool(active, input, secondary, options);
    setOutput(result.output);
    setError(result.error ?? "");
    setMeta(result.meta ?? "");
    if (result.extra) {
      setExtraData(result.extra);
      if (result.extra.hex) {
        setCurrentColorHex(result.extra.hex);
      }
    }
  }, [
    active,
    input,
    secondary,
    toolModes,
    hashFormat,
    uuidUppercase,
    uuidNoHyphens,
    cssBaseSize,
  ]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Debounced auto-run on input/options change
  useEffect(() => {
    if (active === "home") return;
    const t = setTimeout(() => {
      void run();
    }, 200);
    return () => clearTimeout(t);
  }, [
    input,
    secondary,
    active,
    toolModes,
    hashFormat,
    uuidUppercase,
    uuidNoHyphens,
    cssBaseSize,
    run,
  ]);

  async function copyText(text: string, label = "output") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopiedLabel(label);
      setTimeout(() => {
        setCopied(false);
        setCopiedLabel("");
      }, 1400);
    } catch {
      setError(
        "Clipboard access was blocked. Select and copy the text manually.",
      );
    }
  }

  // Swap output into input and toggle mode for reversible tools
  const handleSwapBidirectional = () => {
    if (!output || error) return;
    const currentMode = toolModes[active];
    let newMode = currentMode;

    if (active === "base64") {
      newMode = currentMode === "encode" ? "decode" : "encode";
    } else if (active === "url-encoder") {
      newMode = currentMode === "encode" ? "decode" : "encode";
    } else if (active === "html-entities") {
      newMode = currentMode === "escape" ? "unescape" : "escape";
    }

    setToolModes((prev) => ({ ...prev, [active]: newMode }));
    setInput(output);
  };

  // Quick timestamp helpers
  const handleSetTimestampPreset = (
    preset: "now" | "4pm" | "start" | "end",
  ) => {
    const now = new Date();
    if (preset === "now") {
      setInput(Math.floor(now.getTime() / 1000).toString());
    } else if (preset === "4pm") {
      const d = new Date();
      d.setHours(16, 0, 0, 0);
      setInput(Math.floor(d.getTime() / 1000).toString());
    } else if (preset === "start") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      setInput(Math.floor(d.getTime() / 1000).toString());
    } else if (preset === "end") {
      const d = new Date();
      d.setHours(23, 59, 59, 0);
      setInput(Math.floor(d.getTime() / 1000).toString());
    }
  };

  const handleDatetimeLocalChange = (val: string) => {
    setDatetimeLocal(val);
    if (!val) return;
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) {
      setInput(Math.floor(d.getTime() / 1000).toString());
    }
  };

  return (
    <main className={dark ? "app dark" : "app light"}>
      {/* Minimized Top Navbar (44px) */}
      <header className="topbar">
        <div
          className="brand"
          onClick={() => setActive("home")}
          style={{ cursor: "pointer" }}
          title="Return to DevDock Dashboard"
        >
          <div className="brand-mark">
            <Code2 size={16} />
          </div>
          <span className="brand-title">devdock</span>
          <span className="beta">BETA</span>
        </div>

        <div className="topbar-center">
          <button className="global-search" onClick={() => setSearchOpen(true)}>
            <Search size={14} />
            <span>Search tools & shortcuts...</span>
            <kbd>
              <Command size={10} /> K
            </kbd>
          </button>
        </div>

        <div className="topbar-actions">
          <span className="local-badge">
            <span /> Local WebCrypto
          </span>
          <button
            className="icon-button"
            aria-label="Toggle theme"
            onClick={() => setDark((v) => !v)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <a
            className="icon-button"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub Repository"
          >
            <Github size={15} />
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
                <PanelLeftClose size={14} />
              </button>
            </div>

            <button
              className={
                "nav-overview " + (active === "home" ? "active-home" : "")
              }
              onClick={() => setActive("home")}
            >
              <div className="nav-mini-icon">
                <Zap size={15} />
              </div>
              <span>Dashboard / Home</span>
              <span className="count">{tools.length}</span>
            </button>

            <div className="side-label">YOUR TOOLKIT</div>

            <div className="sidebar-scroll-list">
              {Object.entries(
                tools.reduce(
                  (groups, t) => ({
                    ...groups,
                    [t.category]: [...(groups[t.category] || []), t],
                  }),
                  {} as Record<string, typeof tools>,
                ),
              ).map(([category, list]) => {
                const Icon = categoryIcons[category] ?? Code2;
                return (
                  <div className="nav-group" key={category}>
                    <div className="nav-category">
                      <Icon size={13} />
                      <span>{category}</span>
                    </div>
                    {list.map((tool) => (
                      <button
                        key={tool.id}
                        className={
                          "tool-nav " + (active === tool.id ? "selected" : "")
                        }
                        onClick={() => selectTool(tool.id)}
                      >
                        <span className="tool-symbol">{tool.icon}</span>
                        <span className="tool-nav-name">{tool.name}</span>
                        {active === tool.id && <span className="active-dot" />}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="sidebar-bottom">
              <div className="sidebar-tip">
                <div className="tip-icon">
                  <Keyboard size={14} />
                </div>
                <div>
                  <strong>Work faster</strong>
                  <p>
                    Press <kbd>Ctrl K</kbd> to search.
                  </p>
                </div>
              </div>
              <div className="version-row">
                <span>DevDock v1.2.0</span>
                <span className="version-dot" /> <span>Offline-Ready</span>
              </div>
            </div>
          </aside>
        )}

        {/* Vertically Scrolling Middle Area */}
        <section className="main-area">
          {/* Minimized Breadcrumbs (34px) */}
          <div className="breadcrumbs">
            <button
              className="crumb-home"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeft size={14} />
              ) : (
                <PanelLeftClose size={14} />
              )}
            </button>
            <button
              className="crumb-link-btn"
              onClick={() => setActive("home")}
            >
              DevDock
            </button>
            <span className="crumb-slash">/</span>
            {active === "home" ? (
              <span className="crumb-active">Overview & Shortcuts</span>
            ) : (
              <>
                <span className="crumb-category">{current.category}</span>
                <span className="crumb-slash">/</span>
                <span className="crumb-active">{current.name}</span>
              </>
            )}
            <span className="crumb-spacer" />
            <span className="shortcut-note">Runs 100% locally in browser</span>
          </div>

          {/* ========================================================= */}
          {/* HOME / DASHBOARD PAGE (When active === 'home')             */}
          {/* ========================================================= */}
          {active === "home" ? (
            <div className="workspace home-workspace">
              {/* Hero Banner */}
              <div className="home-hero">
                <div className="hero-badge">
                  <Sparkles size={12} />
                  <span>LOCAL DEVELOPER TOOLBOX</span>
                </div>
                <h1 className="hero-title">Developer Supertools, Fast & Private</h1>
                <p className="hero-subtitle">
                  All formatting, conversions, encoders, and crypto run entirely
                  inside your browser. Zero server logs, zero latency, 100% offline.
                </p>

                {/* Home Search Box */}
                <div className="hero-search-bar">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search 19 developer tools (e.g. 4pm, json, base64, cron, color)..."
                  />
                  {query && (
                    <button
                      className="hero-search-clear"
                      onClick={() => setQuery("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Developer Environment & Ticking Epoch Bar */}
              <div className="dev-stats-bar">
                <div className="stat-item">
                  <span className="stat-label">CURRENT UNIX TIME</span>
                  <div className="stat-value-row">
                    <span className="stat-value">{currentEpoch}</span>
                    <button
                      className="stat-copy-btn"
                      onClick={() =>
                        copyText(currentEpoch.toString(), "epoch")
                      }
                      title="Copy current Unix timestamp"
                    >
                      {copied && copiedLabel === "epoch" ? (
                        <Check size={11} />
                      ) : (
                        <Copy size={11} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-label">LOCAL TIMEZONE</span>
                  <span className="stat-value">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">TOTAL UTILITIES</span>
                  <span className="stat-value">{tools.length} Tools Ready</span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">SECURITY & PRIVACY</span>
                  <span className="stat-value text-emerald">
                    <CheckCircle2 size={13} /> 100% Client-Side
                  </span>
                </div>
              </div>

              {/* Interactive Quick Scratchpad */}
              <div className="home-scratchpad-card">
                <div className="scratchpad-header">
                  <div className="scratchpad-title">
                    <FileText size={15} />
                    <strong>Developer Scratchpad (Persistent Auto-Save)</strong>
                  </div>
                  <div className="scratchpad-actions">
                    <span className="scratchpad-stats">
                      {scratchpad.length} chars ·{" "}
                      {scratchpad.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                      className="scratchpad-btn"
                      onClick={() => {
                        copyText(scratchpad, "scratch");
                        setScratchCopied(true);
                        setTimeout(() => setScratchCopied(false), 1200);
                      }}
                      disabled={!scratchpad}
                    >
                      {scratchCopied ? <Check size={12} /> : <Copy size={12} />}{" "}
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
                  placeholder="Temporary developer notes, code snippets, curl commands, JSON drafts... automatically saved in your browser."
                  rows={4}
                />
              </div>

              {/* Keyboard Shortcuts Cheat Sheet */}
              <div className="shortcuts-section">
                <div className="section-header">
                  <Keyboard size={15} />
                  <h2>Essential Keyboard Shortcuts</h2>
                </div>
                <div className="shortcuts-grid">
                  <div className="shortcut-card">
                    <div className="shortcut-keys">
                      <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    </div>
                    <strong>Universal Command Palette</strong>
                    <p>Open quick tool finder from anywhere.</p>
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
                    <strong>Close Modals</strong>
                    <p>Dismiss command palette and active overlays.</p>
                  </div>

                  <div className="shortcut-card">
                    <div className="shortcut-keys">
                      <span className="custom-key-pill">Swap & Invert</span>
                    </div>
                    <strong>Bi-directional Toggle</strong>
                    <p>Reverse Encoders (Text ⇄ Base64, Raw ⇄ URL).</p>
                  </div>

                  <div className="shortcut-card">
                    <div className="shortcut-keys">
                      <span className="custom-key-pill">Today 4:00 PM</span>
                    </div>
                    <strong>Human Time to Unix</strong>
                    <p>Convert times like 4pm directly to timestamp.</p>
                  </div>

                  <div className="shortcut-card">
                    <div className="shortcut-keys">
                      <span className="custom-key-pill">Pick Color</span>
                    </div>
                    <strong>Live Color Pipette</strong>
                    <p>Interactive HEX, RGB, and HSL converter.</p>
                  </div>
                </div>
              </div>

              {/* All Tools Directory with Category Filters */}
              <div className="tools-directory-section">
                <div className="directory-header">
                  <div>
                    <h2>Explore All Developer Tools</h2>
                    <p>
                      Showing {homeFilteredTools.length} of {tools.length}{" "}
                      utilities
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="category-filter-pills">
                    {[
                      "All",
                      "Formatters",
                      "Encoders & Decoders",
                      "Web & Time",
                      "Security",
                      "Generators",
                    ].map((cat) => (
                      <button
                        key={cat}
                        className={`filter-pill ${homeCategoryFilter === cat ? "active" : ""}`}
                        onClick={() => setHomeCategoryFilter(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tool Cards Grid */}
                <div className="tool-cards-grid">
                  {homeFilteredTools.map((t) => (
                    <div
                      key={t.id}
                      className="tool-card"
                      onClick={() => selectTool(t.id)}
                    >
                      <div className="tool-card-head">
                        <span className="tool-card-icon">{t.icon}</span>
                        {t.badge && (
                          <span className="tool-card-badge">{t.badge}</span>
                        )}
                      </div>
                      <h3 className="tool-card-title">{t.name}</h3>
                      <p className="tool-card-desc">{t.description}</p>
                      <div className="tool-card-footer">
                        <span className="tool-card-cat">{t.category}</span>
                        <span className="tool-card-action">
                          Open <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About DevDock & Pro Tips Section (Only on Dashboard) */}
              <div className="below-grid">
                <div className="info-card">
                  <div className="info-card-title">
                    <div className="info-icon">
                      <Zap size={15} />
                    </div>
                    <strong>About DevDock Workbench</strong>
                  </div>
                  <p>
                    DevDock is a privacy-first, zero-telemetry developer toolkit. All conversions, formatting, regex matching, and cryptographic operations execute 100% inside your local browser engine.
                  </p>
                  <div className="tag-row">
                    <span>100% Client-Side</span>
                    <span>Zero Data Upload</span>
                    <span>Offline-Ready PWA</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-title">
                    <div className="info-icon">
                      <Keyboard size={15} />
                    </div>
                    <strong>DevDock Pro Tips</strong>
                  </div>
                  <ul>
                    <li>
                      Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to jump between all 19 utilities instantly.
                    </li>
                    <li>
                      Click <strong>&quot;Today 4:00 PM&quot;</strong> in Timestamp Converter for immediate Unix conversion.
                    </li>
                    <li>
                      Use <strong>&quot;Swap &amp; Invert&quot;</strong> on Base64, URL, and HTML tools to reverse directions.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Dashboard Footer */}
              <footer>
                <span>DevDock Developer Toolbox · Built for developers</span>
                <span>
                  Engineered with care <span className="footer-heart">♥</span>
                </span>
              </footer>
            </div>
          ) : (
            /* ========================================================= */
            /* INDIVIDUAL TOOL WORKSPACE                                 */
            /* ========================================================= */
            <div className="workspace">
              {/* Tool Heading */}
              <div className="tool-heading">
                <div className="heading-icon">{current.icon}</div>
                <div className="heading-copy">
                  <div className="eyebrow">
                    {current.category.toUpperCase()}
                  </div>
                  <h1>{current.name}</h1>
                  <p>{current.description}</p>
                </div>
                <button
                  className="reset-button"
                  onClick={() => {
                    setInput(samples[active] ?? "");
                    setOutput("");
                    setError("");
                    setMeta("");
                  }}
                  title="Reset to default sample"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* COLOR CONVERTER SPECIAL CARD */}
              {active === "color-converter" && (
                <div className="color-preview-card">
                  <div className="color-preview-header">
                    <div className="color-preview-label">
                      <Palette size={15} />
                      <span>Live Color Preview & Picker</span>
                    </div>
                    <div className="color-format-chips">
                      <span className="format-badge">HEX</span>
                      <span className="format-badge">RGB</span>
                      <span className="format-badge">HSL</span>
                      <span className="format-badge">CMYK</span>
                    </div>
                  </div>

                  <div className="color-preview-body">
                    <div
                      className="color-swatch-box"
                      style={{ backgroundColor: currentColorHex }}
                      onClick={() => colorInputRef.current?.click()}
                      title="Click to open color picker"
                    >
                      <span
                        className="swatch-contrast-label"
                        style={{
                          color: extraData.contrastText || "#ffffff",
                        }}
                      >
                        Aa
                      </span>
                      <input
                        ref={colorInputRef}
                        type="color"
                        className="color-picker-native"
                        value={currentColorHex}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setCurrentColorHex(val);
                          setInput(val);
                        }}
                      />
                    </div>

                    <div className="color-swatch-info">
                      <div className="color-main-row">
                        <span className="color-hex-display">
                          {currentColorHex}
                        </span>
                        <button
                          className="color-pick-trigger-btn"
                          onClick={() => colorInputRef.current?.click()}
                        >
                          <Pipette size={13} /> Pick Color
                        </button>
                        <button
                          className="quick-copy-pill"
                          onClick={() => copyText(currentColorHex, "hex")}
                        >
                          {copied && copiedLabel === "hex" ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span>
                            {copied && copiedLabel === "hex"
                              ? "Copied!"
                              : "Copy HEX"}
                          </span>
                        </button>
                        {extraData.rgb && (
                          <button
                            className="quick-copy-pill"
                            onClick={() => copyText(extraData.rgb, "rgb")}
                          >
                            {copied && copiedLabel === "rgb" ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>
                              {copied && copiedLabel === "rgb"
                                ? "Copied!"
                                : "Copy RGB"}
                            </span>
                          </button>
                        )}
                        {extraData.hsl && (
                          <button
                            className="quick-copy-pill"
                            onClick={() => copyText(extraData.hsl, "hsl")}
                          >
                            {copied && copiedLabel === "hsl" ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>
                              {copied && copiedLabel === "hsl"
                                ? "Copied!"
                                : "Copy HSL"}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="preset-colors-row">
                        <span className="palette-label">Preset Colors:</span>
                        {presetColors.map((p) => (
                          <button
                            key={p.hex}
                            className="palette-swatch-chip"
                            style={{ backgroundColor: p.hex }}
                            title={`${p.name} (${p.hex})`}
                            onClick={() => {
                              setCurrentColorHex(p.hex);
                              setInput(p.hex);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TIMESTAMP CONVERTER SPECIAL CONTROLS */}
              {active === "timestamp" && (
                <div className="timestamp-tools-bar">
                  <div className="timestamp-tools-row">
                    <div className="timestamp-picker-field">
                      <Calendar size={14} />
                      <span>Select Date & Time:</span>
                      <input
                        type="datetime-local"
                        className="datetime-input"
                        value={datetimeLocal}
                        onChange={(e) =>
                          handleDatetimeLocalChange(e.target.value)
                        }
                      />
                    </div>

                    <div className="timestamp-presets-row">
                      <span className="presets-label">Quick Timestamps:</span>
                      <button
                        className="preset-btn highlight"
                        onClick={() => handleSetTimestampPreset("4pm")}
                        title="Convert 4:00 PM today to Unix timestamp"
                      >
                        <Clock3 size={12} /> Today 4:00 PM
                      </button>
                      <button
                        className="preset-btn"
                        onClick={() => handleSetTimestampPreset("now")}
                        title="Current timestamp right now"
                      >
                        Now
                      </button>
                      <button
                        className="preset-btn"
                        onClick={() => handleSetTimestampPreset("start")}
                        title="Start of today (00:00:00)"
                      >
                        Today 00:00
                      </button>
                      <button
                        className="preset-btn"
                        onClick={() => handleSetTimestampPreset("end")}
                        title="End of today (23:59:59)"
                      >
                        Today 23:59
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor Toolbar with Bidirectional Switchers */}
              <div className="editor-toolbar">
                <div className="toolbar-left">
                  <span className="pane-label">
                    <span className="pane-dot input-dot" /> INPUT
                  </span>
                  <span className="toolbar-separator" />

                  {/* Base64 Mode */}
                  {active === "base64" && (
                    <div className="mode-switch-group">
                      <button
                        className={`mode-btn ${toolModes.base64 === "encode" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({ ...m, base64: "encode" }))
                        }
                      >
                        Encode (Text → B64)
                      </button>
                      <button
                        className={`mode-btn ${toolModes.base64 === "decode" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({ ...m, base64: "decode" }))
                        }
                      >
                        Decode (B64 → Text)
                      </button>
                    </div>
                  )}

                  {/* URL Encoder Mode */}
                  {active === "url-encoder" && (
                    <div className="mode-switch-group">
                      <button
                        className={`mode-btn ${toolModes["url-encoder"] === "encode" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "url-encoder": "encode",
                          }))
                        }
                      >
                        Encode (Raw → URL)
                      </button>
                      <button
                        className={`mode-btn ${toolModes["url-encoder"] === "decode" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "url-encoder": "decode",
                          }))
                        }
                      >
                        Decode (URL → Raw)
                      </button>
                    </div>
                  )}

                  {/* HTML Entities Mode */}
                  {active === "html-entities" && (
                    <div className="mode-switch-group">
                      <button
                        className={`mode-btn ${toolModes["html-entities"] === "escape" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "html-entities": "escape",
                          }))
                        }
                      >
                        Escape (&lt;div&gt;)
                      </button>
                      <button
                        className={`mode-btn ${toolModes["html-entities"] === "unescape" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "html-entities": "unescape",
                          }))
                        }
                      >
                        Unescape (&amp; → &)
                      </button>
                    </div>
                  )}

                  {/* JSON Formatter Mode */}
                  {active === "json-formatter" && (
                    <div className="mode-switch-group">
                      <button
                        className={`mode-btn ${toolModes["json-formatter"] === "beautify" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "json-formatter": "beautify",
                          }))
                        }
                      >
                        Beautify (Format)
                      </button>
                      <button
                        className={`mode-btn ${toolModes["json-formatter"] === "minify" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "json-formatter": "minify",
                          }))
                        }
                      >
                        Minify (Compact)
                      </button>
                    </div>
                  )}

                  {/* Hash Algorithm */}
                  {active === "hash-generator" && (
                    <div className="mode-switch-group">
                      {["SHA-256", "SHA-512", "SHA-1"].map((algo) => (
                        <button
                          key={algo}
                          className={`mode-btn ${toolModes["hash-generator"] === algo ? "active" : ""}`}
                          onClick={() =>
                            setToolModes((m) => ({
                              ...m,
                              "hash-generator": algo,
                            }))
                          }
                        >
                          {algo}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* UUID Options */}
                  {active === "uuid-generator" && (
                    <div className="mode-switch-group">
                      <button
                        className={`mode-btn ${!uuidUppercase ? "active" : ""}`}
                        onClick={() => setUuidUppercase(false)}
                      >
                        lowercase
                      </button>
                      <button
                        className={`mode-btn ${uuidUppercase ? "active" : ""}`}
                        onClick={() => setUuidUppercase(true)}
                      >
                        UPPERCASE
                      </button>
                    </div>
                  )}

                  {/* Lorem Mode */}
                  {active === "lorem-ipsum" && (
                    <div className="mode-switch-group">
                      <button
                        className={`mode-btn ${toolModes["lorem-ipsum"] === "paragraphs" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "lorem-ipsum": "paragraphs",
                          }))
                        }
                      >
                        Paragraphs
                      </button>
                      <button
                        className={`mode-btn ${toolModes["lorem-ipsum"] === "mock-users" ? "active" : ""}`}
                        onClick={() =>
                          setToolModes((m) => ({
                            ...m,
                            "lorem-ipsum": "mock-users",
                          }))
                        }
                      >
                        Mock User JSON
                      </button>
                    </div>
                  )}

                  {/* CSS Unit Converter Base */}
                  {active === "css-unit-converter" && (
                    <div className="base-size-pill">
                      <span>Base:</span>
                      <input
                        type="number"
                        min="8"
                        max="32"
                        value={cssBaseSize}
                        onChange={(e) =>
                          setCssBaseSize(Number(e.target.value) || 16)
                        }
                        style={{ width: "42px" }}
                      />
                      <span>px</span>
                    </div>
                  )}

                  {/* Swap & Invert button */}
                  {(active === "base64" ||
                    active === "url-encoder" ||
                    active === "html-entities") && (
                    <button
                      className="swap-btn"
                      onClick={handleSwapBidirectional}
                      disabled={!output || !!error}
                      title="Swap output into input and invert conversion direction"
                    >
                      <ArrowRightLeft size={12} /> Swap & Invert
                    </button>
                  )}

                  {active === "json-diff" && (
                    <button
                      className="swap-btn"
                      onClick={() => {
                        const temp = input;
                        setInput(secondary);
                        setSecondary(temp);
                      }}
                      title="Swap left and right JSON inputs"
                    >
                      <ArrowRightLeft size={12} /> Swap A ⇄ B
                    </button>
                  )}
                </div>

                <div className="toolbar-right">
                  <span className="char-count">
                    {input.length.toLocaleString()} chars
                  </span>
                  <button
                    className="text-action-btn"
                    onClick={() => setInput("")}
                    title="Clear input"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Input Editor Grid */}
              <div
                className={
                  "editor-grid " +
                  (active === "json-diff" ? "has-secondary" : "")
                }
              >
                <div className="input-pane">
                  <div className="line-gutter">
                    {input
                      .split("\n")
                      .slice(0, 200)
                      .map((_, i) => (
                        <span key={i}>{i + 1}</span>
                      ))}
                  </div>
                  <textarea
                    aria-label="Tool input"
                    spellCheck={false}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      active === "uuid-generator"
                        ? "How many UUIDs? Enter a number, e.g. 5"
                        : active === "password-generator"
                          ? "Password length? Enter a number, e.g. 16 or 32"
                          : active === "timestamp"
                            ? "Enter Unix timestamp (e.g. 1700000000) or human time like 'today 4pm', '4:00 PM', or ISO date"
                            : active === "color-converter"
                              ? "Enter HEX (#7C5CFC), RGB (rgb(124, 92, 252)), or HSL (hsl(252, 96%, 67%))"
                              : active === "cron-parser"
                                ? "Enter cron expression, e.g. */15 9-17 * * 1-5"
                                : active === "css-unit-converter"
                                  ? "Enter CSS value, e.g. 24px, 1.5rem, or 2em"
                                  : "Paste or type your input here…"
                    }
                  />
                </div>

                {active === "json-diff" && (
                  <div className="secondary-pane">
                    <div className="secondary-title">COMPARE WITH (JSON B)</div>
                    <textarea
                      aria-label="Second JSON input"
                      spellCheck={false}
                      value={secondary}
                      onChange={(e) => setSecondary(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Action / Run Bar */}
              <div className="run-row">
                <div className="run-hint">
                  <span className="keyboard-key">⌘</span>
                  <span className="keyboard-key">↵</span>
                  <span>or auto-runs while typing</span>
                </div>
                <button className="run-button" onClick={() => void run()}>
                  <Zap size={15} fill="currentColor" /> Run {current.name}
                  <span className="run-arrow">↗</span>
                </button>
              </div>

              {/* Output Toolbar */}
              <div className="output-toolbar">
                <div className="toolbar-left">
                  <span className="pane-label">
                    <span className="pane-dot output-dot" /> OUTPUT
                  </span>
                  {output && !error && (
                    <span className="success-label">
                      <Check size={12} /> Success
                    </span>
                  )}
                  {meta && <span className="output-meta-tag">{meta}</span>}
                </div>

                <div className="toolbar-right">
                  <button
                    className={`copy-button ${copied ? "copied" : ""}`}
                    onClick={() => void copyText(output)}
                    disabled={!output}
                    title="Copy complete output"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>
                      {copied ? "Copied to clipboard!" : "Copy Output"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Output Pane */}
              <div className={"output-pane " + (error ? "has-error" : "")}>
                {error ? (
                  <div className="error-box">
                    <div className="error-icon">!</div>
                    <div>
                      <strong>Could not process input</strong>
                      <p>{error}</p>
                    </div>
                  </div>
                ) : output ? (
                  active === "markdown-preview" ? (
                    <div
                      className="markdown-rendered-view"
                      dangerouslySetInnerHTML={{ __html: output }}
                    />
                  ) : (
                    <>
                      <div className="output-gutter">
                        {output
                          .split("\n")
                          .slice(0, 300)
                          .map((_, i) => (
                            <span key={i}>{i + 1}</span>
                          ))}
                      </div>
                      <pre>{output}</pre>
                    </>
                  )
                ) : (
                  <div className="empty-output">
                    <div className="empty-output-icon">
                      <Sparkles size={18} />
                    </div>
                    <strong>Your converted output will appear here</strong>
                    <p>
                      Enter your input above. All conversions run instantly and
                      securely in your browser.
                    </p>
                  </div>
                )}
              </div>

              {/* Slim privacy status bar */}
              <div className="tool-status-bar">
                <span className="tool-status-pill">
                  <ShieldCheck size={13} />
                  <span>Local client-side execution · Zero server logs</span>
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="search-modal">
            <div className="modal-search-row">
              <Search size={16} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, conversions, formats…"
              />
              <kbd>ESC</kbd>
              <button
                className="subtle-icon"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={15} />
              </button>
            </div>
            <div className="search-results">
              <div className="results-label">
                {query ? "SEARCH RESULTS" : "ALL TOOLS"}
              </div>
              {filtered.length ? (
                filtered.map((t) => (
                  <button
                    key={t.id}
                    className="search-result"
                    onClick={() => selectTool(t.id)}
                  >
                    <span className="result-icon">{t.icon}</span>
                    <span className="result-copy">
                      <strong>{t.name}</strong>
                      <small>{t.description}</small>
                    </span>
                    <span className="result-category">{t.category}</span>
                    <span className="result-enter">↵</span>
                  </button>
                ))
              ) : (
                <div className="no-results">
                  No tools found matching &quot;{query}&quot;.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> Navigate
              </span>
              <span>
                <kbd>↵</kbd> Select tool
              </span>
              <span>{tools.length} utilities available</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
