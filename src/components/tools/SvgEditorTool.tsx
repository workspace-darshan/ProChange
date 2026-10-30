"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Code2,
  Eye,
  Download,
  Copy,
  Check,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Palette,
  FileCode,
  Layers,
  Upload,
  AlertCircle,
  Wand2,
  RotateCcw,
  Sliders,
  CheckSquare,
  Square,
  Circle as CircleIcon,
  HelpCircle,
} from "lucide-react";

// Built-in Curated Sample SVGs
const sampleSvgs: { name: string; category: string; code: string }[] = [
  {
    name: "React Vector Logo",
    category: "Brand",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348" width="100%" height="100%">
  <title>React Logo</title>
  <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
  <g stroke="#61DAFB" stroke-width="1" fill="none">
    <ellipse rx="11" ry="4.2"/>
    <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
    <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
  </g>
</svg>`,
  },
  {
    name: "Modern Launch Rocket",
    category: "Icon",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C5CFC"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#EF4444"/>
    </linearGradient>
  </defs>
  <!-- Background Glow -->
  <circle cx="50" cy="50" r="44" fill="#15171E" stroke="#2E303A" stroke-width="2"/>
  <!-- Stars -->
  <circle cx="28" cy="24" r="1.5" fill="#A3A5B2"/>
  <circle cx="74" cy="30" r="2" fill="#A3A5B2"/>
  <circle cx="32" cy="70" r="1.5" fill="#A3A5B2"/>
  <!-- Rocket Body -->
  <path d="M50 18 C38 32 36 54 36 64 L64 64 C64 54 62 32 50 18 Z" fill="url(#rocketGrad)"/>
  <!-- Wings -->
  <path d="M36 48 L22 62 L36 62 Z" fill="#6D28D9"/>
  <path d="M64 48 L78 62 L64 62 Z" fill="#6D28D9"/>
  <!-- Window -->
  <circle cx="50" cy="40" r="6" fill="#0E1015" stroke="#61DAFB" stroke-width="2"/>
  <!-- Flame Thrust -->
  <path d="M42 66 Q50 88 58 66 Q50 74 42 66 Z" fill="url(#flameGrad)"/>
</svg>`,
  },
  {
    name: "Achievement Gold Badge",
    category: "Badge",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </linearGradient>
  </defs>
  <!-- Ribbons -->
  <polygon points="44,80 44,110 60,98 76,110 76,80" fill="#991B1B"/>
  <!-- Star Burst Badge -->
  <circle cx="60" cy="56" r="42" fill="url(#gold)" stroke="#78350F" stroke-width="2"/>
  <circle cx="60" cy="56" r="34" fill="#1C1917" stroke="#FEF08A" stroke-width="1.5"/>
  <!-- Central Star -->
  <polygon points="60,34 65,49 81,49 68,59 73,74 60,64 47,74 52,59 39,49 55,49" fill="#FACC15"/>
</svg>`,
  },
  {
    name: "Geometric Abstract Wave",
    category: "Abstract",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="100%" height="100%">
  <defs>
    <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7C5CFC" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#EC4899" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="200" height="120" rx="8" fill="#0D0F12"/>
  <path d="M0 60 C50 20 80 100 140 50 C170 25 185 70 200 65 L200 120 L0 120 Z" fill="url(#wave2)"/>
  <path d="M0 75 C40 45 90 90 130 65 C160 45 180 80 200 70 L200 120 L0 120 Z" fill="url(#wave1)"/>
  <circle cx="150" cy="35" r="16" fill="#F59E0B" opacity="0.85"/>
</svg>`,
  },
];

export default function SvgEditorTool() {
  const [svgCode, setSvgCode] = useState<string>(sampleSvgs[0].code);
  const [parseError, setParseError] = useState<string | null>(null);

  // Canvas View Controls
  const [zoom, setZoom] = useState<number>(1);
  const [canvasBg, setCanvasBg] = useState<"dark" | "white" | "checker-dark" | "checker-light">("dark");
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "palette" | "layers">("preview");

  // Copy Feedback
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedDataUri, setCopiedDataUri] = useState<boolean>(false);
  const [copiedJsx, setCopiedJsx] = useState<boolean>(false);
  const [copiedPng, setCopiedPng] = useState<boolean>(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validate and parse SVG XML
  useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, "image/svg+xml");
      const err = doc.querySelector("parsererror");
      if (err) {
        setParseError(err.textContent?.split("\n")[0] || "Invalid SVG XML syntax");
      } else {
        setParseError(null);
      }
    } catch (e: any) {
      setParseError(e.message || "XML parsing exception");
    }
  }, [svgCode]);

  // Extract Extracted Colors for the No-Code Palette Replacer
  const extractedColors = useMemo(() => {
    const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b|rgb\([^)]+\)|rgba\([^)]+\)/g;
    const matches = svgCode.match(colorRegex) || [];
    const unique = Array.from(new Set(matches.map((c) => c.toLowerCase())));
    return unique.slice(0, 16); // up to 16 colors
  }, [svgCode]);

  // Replace all occurrences of a color across the SVG
  const replaceColorInSvg = (oldColor: string, newColor: string) => {
    // Case-insensitive global replace
    const regex = new RegExp(oldColor, "gi");
    setSvgCode((prev) => prev.replace(regex, newColor));
  };

  // Extract SVG Layers / Elements Tree
  const svgLayers = useMemo(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, "image/svg+xml");
      const elements: { tag: string; id?: string; fill?: string; stroke?: string }[] = [];
      const traverse = (node: Element) => {
        if (node.tagName && node.tagName.toLowerCase() !== "svg") {
          elements.push({
            tag: node.tagName,
            id: node.getAttribute("id") || undefined,
            fill: node.getAttribute("fill") || undefined,
            stroke: node.getAttribute("stroke") || undefined,
          });
        }
        for (let i = 0; i < node.children.length; i++) {
          traverse(node.children[i]);
        }
      };
      if (doc.documentElement) traverse(doc.documentElement);
      return elements.slice(0, 30);
    } catch {
      return [];
    }
  }, [svgCode]);

  // Prettify / Format SVG XML Code
  const prettifySvg = () => {
    try {
      let formatted = "";
      const reg = /(>)(<)(\/*)/g;
      let xml = svgCode.replace(reg, "$1\r\n$2$3");
      let pad = 0;
      xml.split("\r\n").forEach((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1;
        } else {
          indent = 0;
        }
        formatted += "  ".repeat(pad) + node.trim() + "\r\n";
        pad += indent;
      });
      setSvgCode(formatted.trim());
    } catch {
      // ignore
    }
  };

  // SVGO-style Minify & Clean
  const minifySvg = () => {
    const minified = svgCode
      .replace(/<!--[\s\S]*?-->/g, "") // strip comments
      .replace(/>\s+</g, "><") // strip space between tags
      .replace(/\s{2,}/g, " ") // collapse multiple spaces
      .trim();
    setSvgCode(minified);
  };

  // Insert Snippet into Code
  const insertSnippet = (snippet: string) => {
    // Insert right before </svg>
    const closingIdx = svgCode.lastIndexOf("</svg>");
    if (closingIdx !== -1) {
      const next = svgCode.slice(0, closingIdx) + "  " + snippet + "\n" + svgCode.slice(closingIdx);
      setSvgCode(next);
    } else {
      setSvgCode((prev) => prev + "\n" + snippet);
    }
  };

  // Scale All Strokes Multiplier
  const multiplyStrokeWidth = (factor: number) => {
    const updated = svgCode.replace(/stroke-width="([^"]+)"/g, (_, val) => {
      const num = parseFloat(val);
      if (isNaN(num)) return `stroke-width="${val}"`;
      const newVal = (num * factor).toFixed(1).replace(/\.0$/, "");
      return `stroke-width="${newVal}"`;
    });
    setSvgCode(updated);
  };

  // Copy SVG Code
  const copySvg = async () => {
    await navigator.clipboard.writeText(svgCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  // Copy Data URI
  const copyDataUri = async () => {
    const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
    await navigator.clipboard.writeText(uri);
    setCopiedDataUri(true);
    setTimeout(() => setCopiedDataUri(false), 1500);
  };

  // Copy as React JSX Component
  const copyReactJsx = async () => {
    // Transform class -> className, for -> htmlFor
    let jsx = svgCode
      .replace(/class=/g, "className=")
      .replace(/xmlns:xlink/g, "xmlnsXlink")
      .replace(/xlink:href/g, "xlinkHref")
      .replace(/stroke-width/g, "strokeWidth")
      .replace(/stroke-linecap/g, "strokeLinecap")
      .replace(/stroke-linejoin/g, "strokeLinejoin")
      .replace(/fill-rule/g, "fillRule")
      .replace(/clip-rule/g, "clipRule");

    const componentCode = `export default function SvgIcon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${jsx.trim()}\n  );\n}`;
    await navigator.clipboard.writeText(componentCode);
    setCopiedJsx(true);
    setTimeout(() => setCopiedJsx(false), 1500);
  };

  // Export as Raster PNG at custom scale
  const exportPng = (scale = 2) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return;

      const viewBox = svgEl.getAttribute("viewBox");
      let w = 800;
      let h = 800;
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(Number);
        if (parts.length >= 4) {
          w = parts[2];
          h = parts[3];
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const a = document.createElement("a");
        a.download = `prochange-vector-${scale}x-${Date.now()}.png`;
        a.href = canvas.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = url;
    } catch {
      alert("PNG export failed. Please check SVG syntax.");
    }
  };

  // Download .svg File
  const downloadSvgFile = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prochange-vector-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setSvgCode(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  // Background pattern styles
  const getCanvasBgStyle = () => {
    if (canvasBg === "dark") return { background: "#0a0c10" };
    if (canvasBg === "white") return { background: "#ffffff" };
    if (canvasBg === "checker-dark") {
      return {
        backgroundColor: "#111318",
        backgroundImage:
          "linear-gradient(45deg, #181b22 25%, transparent 25%), linear-gradient(-45deg, #181b22 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181b22 75%), linear-gradient(-45deg, transparent 75%, #181b22 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
      };
    }
    return {
      backgroundColor: "#f1f3f7",
      backgroundImage:
        "linear-gradient(45deg, #e2e5eb 25%, transparent 25%), linear-gradient(-45deg, #e2e5eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e5eb 75%), linear-gradient(-45deg, transparent 75%, #e2e5eb 75%)",
      backgroundSize: "20px 20px",
      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
    };
  };

  return (
    <div className="workspace home-workspace" style={{ padding: "16px 20px 28px", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" style={{ display: "none" }} onChange={handleFileUpload} />

      {/* Top Header & Global Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={13} style={{ color: "var(--accent)" }} />
            <span>SVG CODE VIEWER & LIVE VECTOR EDITOR</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "2px 0 0", letterSpacing: "-0.5px" }}>
            SVG Viewer & Editor
          </h1>
        </div>

        {/* Global Toolbar Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Sample Switchers */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Presets:</span>
            {sampleSvgs.map((s) => (
              <button
                key={s.name}
                className="subtle-btn"
                onClick={() => setSvgCode(s.code)}
                title={`Load ${s.name}`}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  borderColor: svgCode === s.code ? "var(--accent)" : "var(--line)",
                  background: svgCode === s.code ? "rgba(16, 185, 129, 0.12)" : "transparent",
                  color: svgCode === s.code ? "var(--accent)" : "var(--text)",
                }}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: "var(--line)", margin: "0 2px" }} />

          {/* Upload SVG */}
          <button
            className="secondary-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload local .svg file"
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            <Upload size={13} />
            <span>Upload SVG</span>
          </button>

          {/* Copy React JSX */}
          <button
            className="secondary-btn"
            onClick={copyReactJsx}
            title="Copy as React / Next.js JSX component"
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            {copiedJsx ? <Check size={13} style={{ color: "var(--accent)" }} /> : <Code2 size={13} />}
            <span>{copiedJsx ? "Copied JSX!" : "Copy JSX"}</span>
          </button>

          {/* Copy Data URI */}
          <button
            className="secondary-btn"
            onClick={copyDataUri}
            title="Copy as data:image/svg+xml Data URI"
            style={{ padding: "6px 10px", fontSize: 12 }}
          >
            {copiedDataUri ? <Check size={13} style={{ color: "var(--accent)" }} /> : <FileCode size={13} />}
            <span>{copiedDataUri ? "Copied URI!" : "Data URI"}</span>
          </button>

          {/* Download SVG */}
          <button
            className="primary-button"
            onClick={downloadSvgFile}
            title="Download clean .svg vector file"
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            <Download size={14} />
            <span>Download .SVG</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 16,
          minHeight: 560,
          maxHeight: "calc(100vh - 170px)",
          overflow: "hidden",
        }}
      >
        {/* Left Column: Interactive Code Editor */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Editor Header Bar */}
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid var(--line)",
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Code2 size={15} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 12.5, fontWeight: 750 }}>SVG Code Editor</span>
              <span
                style={{
                  fontSize: 10.5,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: parseError ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  color: parseError ? "#f87171" : "#34d399",
                  fontWeight: 700,
                }}
              >
                {parseError ? "XML Syntax Error" : "Valid XML"}
              </span>
            </div>

            {/* Code Utilities: Prettify, Minify, Copy */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button
                className="subtle-btn"
                onClick={prettifySvg}
                title="Format / Prettify SVG indentation"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                <Wand2 size={12} /> Format
              </button>

              <button
                className="subtle-btn"
                onClick={minifySvg}
                title="Minify / Optimize SVG (strip comments & spaces)"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                Minify
              </button>

              <button
                className="subtle-btn"
                onClick={copySvg}
                title="Copy raw SVG markup"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                {copiedCode ? <Check size={12} style={{ color: "var(--accent)" }} /> : <Copy size={12} />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Quick Insert Snippet Toolbar */}
          <div
            style={{
              padding: "6px 14px",
              borderBottom: "1px solid var(--line-soft)",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              overflowX: "auto",
            }}
          >
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Insert:</span>
            {[
              { label: "+ Circle", code: '<circle cx="50" cy="50" r="20" fill="#10B981"/>' },
              { label: "+ Rect", code: '<rect x="20" y="20" width="60" height="40" rx="4" fill="#7C5CFC"/>' },
              { label: "+ Path", code: '<path d="M10 80 Q52 10 95 80 T180 80" fill="none" stroke="#3B82F6" stroke-width="3"/>' },
              { label: "+ Gradient", code: '<linearGradient id="newGrad"><stop offset="0%" stop-color="#FF5722"/><stop offset="100%" stop-color="#FFEB3B"/></linearGradient>' },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => insertSnippet(s.code)}
                style={{
                  padding: "2px 7px",
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 600,
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  color: "var(--text)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Code Textarea Body */}
          <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
            <textarea
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              placeholder="Paste or write SVG XML markup here..."
              spellCheck={false}
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                padding: "14px 16px",
                border: 0,
                outline: "none",
                background: "transparent",
                color: "#e2e8f0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 13,
                lineHeight: "1.65",
                resize: "none",
                tabSize: 2,
                boxSizing: "border-box",
                overflowY: "auto",
              }}
            />
          </div>

          {/* Parse Error Status Banner if invalid */}
          {parseError && (
            <div
              style={{
                padding: "6px 14px",
                background: "rgba(239, 68, 68, 0.12)",
                borderTop: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontSize: 11.5,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <AlertCircle size={14} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {parseError}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Live Vector Preview & Visual Inspector */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Preview Header & Tab Switcher */}
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid var(--line)",
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div className="mode-toggle">
              <button
                className={`mode-btn ${activeRightTab === "preview" ? "active" : ""}`}
                onClick={() => setActiveRightTab("preview")}
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                <Eye size={13} /> Visual Canvas
              </button>
              <button
                className={`mode-btn ${activeRightTab === "palette" ? "active" : ""}`}
                onClick={() => setActiveRightTab("palette")}
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                <Palette size={13} /> Color Palette ({extractedColors.length})
              </button>
              <button
                className={`mode-btn ${activeRightTab === "layers" ? "active" : ""}`}
                onClick={() => setActiveRightTab("layers")}
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                <Layers size={13} /> Elements ({svgLayers.length})
              </button>
            </div>

            {/* Quick Export Raster PNG Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>PNG:</span>
              <button
                className="subtle-btn"
                onClick={() => exportPng(1)}
                title="Export 1x PNG"
                style={{ padding: "3px 6px", fontSize: 10.5 }}
              >
                1x
              </button>
              <button
                className="subtle-btn"
                onClick={() => exportPng(2)}
                title="Export 2x Retina PNG"
                style={{ padding: "3px 6px", fontSize: 10.5, fontWeight: 700, color: "var(--accent)" }}
              >
                2x
              </button>
              <button
                className="subtle-btn"
                onClick={() => exportPng(4)}
                title="Export 4x High-Res PNG"
                style={{ padding: "3px 6px", fontSize: 10.5 }}
              >
                4x
              </button>
            </div>
          </div>

          {/* TAB 1: VISUAL CANVAS */}
          {activeRightTab === "preview" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              {/* Canvas Viewport Toolbar (Zoom + Background selector) */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  zIndex: 20,
                  background: "rgba(21, 22, 27, 0.9)",
                  backdropFilter: "blur(8px)",
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                }}
              >
                {/* Background Pattern Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {[
                    { id: "dark", label: "Dark" },
                    { id: "white", label: "White" },
                    { id: "checker-dark", label: "Grid Dark" },
                    { id: "checker-light", label: "Grid Light" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setCanvasBg(b.id as any)}
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        border: canvasBg === b.id ? "1px solid var(--accent)" : "1px solid transparent",
                        background: canvasBg === b.id ? "rgba(16, 185, 129, 0.15)" : "transparent",
                        color: canvasBg === b.id ? "var(--accent)" : "var(--muted)",
                        cursor: "pointer",
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                <div style={{ width: 1, height: 16, background: "var(--line)" }} />

                {/* Zoom Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <button
                    className="subtle-btn"
                    onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}
                    title="Zoom Out"
                    style={{ padding: "2px 5px" }}
                  >
                    <ZoomOut size={12} />
                  </button>
                  <span style={{ fontSize: 10.5, fontWeight: 700, minWidth: 32, textAlign: "center", color: "var(--muted)" }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    className="subtle-btn"
                    onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                    title="Zoom In"
                    style={{ padding: "2px 5px" }}
                  >
                    <ZoomIn size={12} />
                  </button>
                  <button className="subtle-btn" onClick={() => setZoom(1)} style={{ padding: "2px 5px", fontSize: 10 }}>
                    100%
                  </button>
                </div>
              </div>

              {/* Stroke Width Quick Multiplier */}
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  zIndex: 20,
                  background: "rgba(21, 22, 27, 0.9)",
                  backdropFilter: "blur(8px)",
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  fontSize: 11,
                }}
              >
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Stroke:</span>
                <button className="subtle-btn" onClick={() => multiplyStrokeWidth(0.8)} style={{ padding: "2px 5px", fontSize: 10 }}>
                  -20%
                </button>
                <button className="subtle-btn" onClick={() => multiplyStrokeWidth(1.2)} style={{ padding: "2px 5px", fontSize: 10 }}>
                  +20%
                </button>
              </div>

              {/* Canvas Viewport */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 30,
                  overflow: "auto",
                  ...getCanvasBgStyle(),
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: "transform 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    maxWidth: "90%",
                    maxHeight: "90%",
                  }}
                  dangerouslySetInnerHTML={{ __html: svgCode }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: EXTRACTED COLOR PALETTE REPLACER */}
          {activeRightTab === "palette" && (
            <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
              <div style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 13, display: "block" }}>Interactive Color Palette</strong>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Click any swatch to replace that color everywhere across your SVG in real time.
                </p>
              </div>

              {extractedColors.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                  No explicit fill or stroke hex colors detected in this SVG.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                  {extractedColors.map((color) => (
                    <div
                      key={color}
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <input
                        type="color"
                        value={color.startsWith("#") && color.length === 7 ? color : "#ffffff"}
                        onChange={(e) => replaceColorInSvg(color, e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          padding: 0,
                          border: 0,
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      />
                      <div style={{ overflow: "hidden" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>
                          {color}
                        </span>
                        <span style={{ display: "block", fontSize: 9.5, color: "var(--muted)" }}>Click to edit</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SVG LAYER & ELEMENTS TREE */}
          {activeRightTab === "layers" && (
            <div style={{ flex: 1, padding: "12px 16px", overflowY: "auto" }}>
              <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Element Hierarchy ({svgLayers.length} nodes)
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Root & child elements</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {svgLayers.map((layer, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--line-soft)",
                      borderRadius: 6,
                      padding: "7px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 5px",
                          borderRadius: 4,
                          background: "var(--surface-3)",
                          color: "var(--accent)",
                          fontFamily: "ui-monospace, monospace",
                        }}
                      >
                        &lt;{layer.tag}&gt;
                      </span>
                      {layer.id && (
                        <span style={{ fontSize: 11, color: "var(--text)", fontWeight: 600 }}>#{layer.id}</span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {layer.fill && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--muted)" }}>
                          <span>fill:</span>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: layer.fill }} />
                        </div>
                      )}
                      {layer.stroke && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--muted)" }}>
                          <span>stroke:</span>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: layer.stroke }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
