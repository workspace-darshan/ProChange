"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Type } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function TextAnalyzerTool() {
  const [input, setInput] = useState<string>("proChange is a modern high performance developer workbench with modular page architecture.");
  const [output, setOutput] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("text-analyzer", input);
      setOutput(res.output);
      setMeta(res.meta || "");
    }
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, [input]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Quick case conversions
  const words = input.trim().split(/\s+/).filter(Boolean);
  const charCount = input.length;
  const wordCount = words.length;

  const toCamel = () => {
    return words
      .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join("");
  };

  const toSnake = () => words.map((w) => w.toLowerCase()).join("_");
  const toKebab = () => words.map((w) => w.toLowerCase()).join("-");
  const toConstant = () => words.map((w) => w.toUpperCase()).join("_");

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>Text Analyzer & Case Converter</h2>
          <p>Instant case transformations (camelCase, snake_case, kebab-case) and character/word statistics</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Stats & Cases"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
        <div className="card-plate" style={{ padding: "0.85rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>{wordCount}</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Words</div>
        </div>
        <div className="card-plate" style={{ padding: "0.85rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>{charCount}</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Characters</div>
        </div>
        <div className="card-plate" style={{ padding: "0.85rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>{Math.ceil(wordCount / 200)} min</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Read Time</div>
        </div>
      </div>

      <div className="pane" style={{ marginBottom: "1rem" }}>
        <div className="pane-head">
          <span>INPUT TEXT</span>
          <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
        </div>
        <textarea
          className="code-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text..."
          rows={6}
          spellCheck={false}
        />
      </div>

      <div className="card-plate" style={{ padding: "1.25rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Type size={16} /> Quick Case Transformations
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "camelCase", val: toCamel() },
            { label: "kebab-case", val: toKebab() },
            { label: "snake_case", val: toSnake() },
            { label: "CONSTANT_CASE", val: toConstant() },
          ].map((item) => (
            <div key={item.label} style={{ background: "var(--bg-card)", padding: "0.75rem", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{item.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", wordBreak: "break-all", fontWeight: 600 }}>
                {item.val || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
