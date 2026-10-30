"use client";
import { useState, useEffect } from "react";
import { Copy, Check, CheckCircle2, AlertCircle } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState<string>("pro[a-z]+");
  const [flags, setFlags] = useState<string>("gi");
  const [testString, setTestString] = useState<string>("proChange accelerates proDevs. Another proTool is ready for testing.");
  const [output, setOutput] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const fullInput = `/${pattern}/${flags}\n${testString}`;
      const res = await executeTool("regex-tester", fullInput);
      setOutput(res.output);
      setError(res.error || "");
      setMeta(res.meta || "");
    }
    const t = setTimeout(run, 120);
    return () => clearTimeout(t);
  }, [pattern, flags, testString]);

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
          <h2>Regular Expression Tester & Match Inspector</h2>
          <p>Test regex patterns with customizable flags, capture groups, and real-time match breakdown</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Report"}
          </button>
        </div>
      </div>

      <div className="card-plate" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, opacity: 0.5 }}>/</span>
            <input
              type="text"
              className="control-input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. [a-z0-9_-]+"
              style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", flex: 1 }}
            />
            <span style={{ fontSize: "1.2rem", fontWeight: 700, opacity: 0.5 }}>/</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.95rem" }}>Flags:</span>
            <input
              type="text"
              className="control-input"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g, i, m, s"
              style={{ width: "90px", fontFamily: "var(--font-mono)" }}
            />
          </div>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>TEST STRING</span>
            <button className="subtle-btn" onClick={() => setTestString("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Type text to test regular expression against..."
            rows={14}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>MATCHES & CAPTURE GROUPS</span>
            {meta && (
              <span style={{ fontSize: "0.85rem", color: "var(--accent)" }}>
                {meta}
              </span>
            )}
          </div>
          <textarea
            className={`code-textarea ${error ? "has-error" : ""}`}
            value={error || output}
            readOnly
            rows={14}
            spellCheck={false}
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}
          />
        </div>
      </div>
    </div>
  );
}
