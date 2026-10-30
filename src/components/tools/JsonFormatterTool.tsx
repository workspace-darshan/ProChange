"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Braces, Minimize2, CheckCircle2 } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function JsonFormatterTool() {
  const [input, setInput] = useState<string>('{\n  "name": "proChange",\n  "version": 2.0,\n  "features": ["client-side", "privacy-first", "modular-routes"],\n  "active": true\n}');
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("json-formatter", input, undefined, { mode });
      setOutput(res.output);
      setError(res.error || "");
      setMeta(res.meta || "");
    }
    const t = setTimeout(run, 150);
    return () => clearTimeout(t);
  }, [input, mode]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>JSON Formatter, Validator & Minifier</h2>
          <p>Prettify, minify, and validate JSON syntax with instant error detection</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "beautify" ? "active" : ""}`}
              onClick={() => setMode("beautify")}
            >
              <Braces size={14} /> Prettify 2-Spaces
            </button>
            <button
              className={`mode-btn ${mode === "minify" ? "active" : ""}`}
              onClick={() => setMode("minify")}
            >
              <Minimize2 size={14} /> Minify (Compact)
            </button>
          </div>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>RAW JSON INPUT</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw or unformatted JSON here..."
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>FORMATTED OUTPUT</span>
            {!error && output && (
              <span style={{ fontSize: "0.85rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <CheckCircle2 size={14} /> Valid JSON
              </span>
            )}
          </div>
          <textarea
            className={`code-textarea ${error ? "has-error" : ""}`}
            value={error || output}
            readOnly
            rows={15}
            spellCheck={false}
          />
        </div>
      </div>

      {meta && (
        <div className="result-meta" style={{ marginTop: "0.75rem" }}>
          <span>{meta}</span>
        </div>
      )}
    </div>
  );
}
