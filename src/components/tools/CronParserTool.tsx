"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Clock3 } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function CronParserTool() {
  const [input, setInput] = useState<string>("*/15 9-18 * * 1-5");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("cron-parser", input);
      setOutput(res.output);
      setError(res.error || "");
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

  const presets = [
    { label: "Every 15 mins (Mon-Fri 9-6)", expr: "*/15 9-18 * * 1-5" },
    { label: "Every day at midnight", expr: "0 0 * * *" },
    { label: "Every Sunday at 4am", expr: "0 4 * * 0" },
    { label: "1st of every month", expr: "0 0 1 * *" },
  ];

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>Cron Expression Parser & Schedule Inspector</h2>
          <p>Translate cron schedules into plain English human explanations and run dates</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Description"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {presets.map((p) => (
          <button
            key={p.expr}
            className="secondary-btn"
            style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}
            onClick={() => setInput(p.expr)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>CRON EXPRESSION (5 Fields: min hour day month weekday)</span>
          </div>
          <input
            type="text"
            className="control-input"
            style={{ fontSize: "1.2rem", padding: "0.75rem", fontFamily: "var(--font-mono)" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. */10 * * * *"
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>HUMAN SCHEDULE TRANSLATION</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Clock3 size={13} /> Explanation
            </span>
          </div>
          <textarea
            className={`code-textarea ${error ? "has-error" : ""}`}
            value={error || output}
            readOnly
            rows={10}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
