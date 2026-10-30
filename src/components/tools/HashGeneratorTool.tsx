"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Hash, Shield } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function HashGeneratorTool() {
  const [input, setInput] = useState<string>("Hello, proChange!");
  const [algo, setAlgo] = useState<string>("SHA-256");
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("hash-generator", input, undefined, { algorithm: algo });
      setOutput(res.output);
    }
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, [input, algo]);

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
          <h2>Cryptographic Hash Generator</h2>
          <p>Compute secure SHA-256, SHA-512, and SHA-1 message digests locally using WebCrypto API</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            {["SHA-256", "SHA-512", "SHA-1"].map((a) => (
              <button
                key={a}
                className={`mode-btn ${algo === a ? "active" : ""}`}
                onClick={() => setAlgo(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Hash"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>INPUT TEXT</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to compute cryptographic hash..."
            rows={12}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>COMPUTED {algo} HASH</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Shield size={13} /> Browser WebCrypto
            </span>
          </div>
          <textarea
            className="code-textarea"
            value={output}
            readOnly
            rows={12}
            spellCheck={false}
            style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", wordBreak: "break-all" }}
          />
        </div>
      </div>
    </div>
  );
}
