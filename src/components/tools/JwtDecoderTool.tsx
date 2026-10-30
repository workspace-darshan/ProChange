"use client";
import { useState, useEffect } from "react";
import { Copy, Check, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function JwtDecoderTool() {
  const [input, setInput] = useState<string>(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFyeWFuIFBhdGVsIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzkzMTY0MDAwfQ.4Spm88g5T_k"
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("jwt-decoder", input);
      setOutput(res.output);
      setError(res.error || "");
      setMeta(res.meta || "");
    }
    const t = setTimeout(run, 120);
    return () => clearTimeout(t);
  }, [input]);

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
          <h2>JWT Token Inspector & Claims Decoder</h2>
          <p>Inspect JSON Web Token headers, payload claims, expiration timestamp, and validity locally without sending secrets over network</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Claims JSON"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>RAW JWT TOKEN (eyJhbGci...)</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON Web Token (JWT) here..."
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>DECODED HEADER & CLAIMS</span>
            {meta && (
              <span style={{ fontSize: "0.85rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <KeyRound size={13} /> {meta}
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
    </div>
  );
}
