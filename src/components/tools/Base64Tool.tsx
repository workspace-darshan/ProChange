"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ArrowRightLeft, Image as ImageIcon } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState<string>("Hello, proChange!\nFast, local-first developer workstation.");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("base64", input, undefined, { mode });
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

  const swap = () => {
    if (!output || error) return;
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  const isDataUrl = output.startsWith("data:image/") || input.startsWith("data:image/");

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>Base64 Text & Image Converter</h2>
          <p>Bi-directional UTF-8 Base64 string and data URL encoder / decoder</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "encode" ? "active" : ""}`}
              onClick={() => setMode("encode")}
            >
              Encode to Base64
            </button>
            <button
              className={`mode-btn ${mode === "decode" ? "active" : ""}`}
              onClick={() => setMode("decode")}
            >
              Decode from Base64
            </button>
          </div>
          <button className="primary-button" onClick={swap} title="Swap input and output">
            <ArrowRightLeft size={15} /> Swap
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>INPUT ({mode === "encode" ? "Plain Text / UTF-8" : "Base64 String"})</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter plain text to encode..." : "Enter Base64 string to decode..."}
            rows={14}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>OUTPUT ({mode === "encode" ? "Base64 Encoded" : "Decoded Text"})</span>
            <button className="copy-btn" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            className={`code-textarea ${error ? "has-error" : ""}`}
            value={error || output}
            readOnly
            rows={14}
            spellCheck={false}
          />
        </div>
      </div>

      {isDataUrl && (
        <div className="card-plate" style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: 600 }}>
            <ImageIcon size={18} /> Base64 Image Preview
          </div>
          <img
            src={input.startsWith("data:image/") ? input : output}
            alt="Base64 Preview"
            style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 8, objectFit: "contain", border: "1px solid var(--border)" }}
            onError={(e) => ((e.target as HTMLElement).style.display = "none")}
          />
        </div>
      )}

      {meta && (
        <div className="result-meta" style={{ marginTop: "0.75rem" }}>
          <span>{meta}</span>
        </div>
      )}
    </div>
  );
}
