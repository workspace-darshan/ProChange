"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function UrlEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState<string>("https://prochange.dev/search?q=developer suite&category=tools&sort=popular#section-2");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("url-encoder", input, undefined, { mode });
      setOutput(res.output);
      setError(res.error || "");
    }
    const t = setTimeout(run, 120);
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

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>URL Percent-Encoding & Decoding</h2>
          <p>Safely encode special URL characters into %xx hex sequences or decode them back to readable text</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "encode" ? "active" : ""}`}
              onClick={() => setMode("encode")}
            >
              Encode URL
            </button>
            <button
              className={`mode-btn ${mode === "decode" ? "active" : ""}`}
              onClick={() => setMode("decode")}
            >
              Decode URL
            </button>
          </div>
          <button className="primary-button" onClick={swap} title="Swap input and output">
            <ArrowRightLeft size={15} /> Swap
          </button>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>INPUT ({mode === "encode" ? "Raw URL / Text" : "Encoded %xx URL"})</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter URL to encode/decode..."
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>OUTPUT ({mode === "encode" ? "Encoded URL" : "Decoded URL"})</span>
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
    </div>
  );
}
