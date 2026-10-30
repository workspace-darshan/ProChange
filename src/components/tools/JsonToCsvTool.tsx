"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ArrowRightLeft, FileSpreadsheet } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function JsonToCsvTool() {
  const [mode, setMode] = useState<"json-to-csv" | "csv-to-json">("json-to-csv");
  const [input, setInput] = useState<string>(
    '[\n  {"id": 1, "name": "Aryan Patel", "role": "Senior Architect", "city": "Mumbai", "rating": 4.9},\n  {"id": 2, "name": "Priya Sharma", "role": "Staff Engineer", "city": "Bengaluru", "rating": 4.8},\n  {"id": 3, "name": "Rohan Verma", "role": "DevOps Specialist", "city": "Pune", "rating": 4.7}\n]'
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("json-to-csv", input, undefined, { mode });
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
    setMode((m) => (m === "json-to-csv" ? "csv-to-json" : "json-to-csv"));
  };

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>JSON Array ⇄ CSV Spreadsheet Converter</h2>
          <p>Bi-directionally convert tabular JSON records to CSV and CSV spreadsheets back to JSON arrays</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "json-to-csv" ? "active" : ""}`}
              onClick={() => setMode("json-to-csv")}
            >
              JSON → CSV
            </button>
            <button
              className={`mode-btn ${mode === "csv-to-json" ? "active" : ""}`}
              onClick={() => setMode("csv-to-json")}
            >
              CSV → JSON
            </button>
          </div>
          <button className="primary-button" onClick={swap} title="Swap input and output">
            <ArrowRightLeft size={15} /> Swap
          </button>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Output"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>INPUT ({mode === "json-to-csv" ? "JSON Array" : "CSV Rows"})</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "json-to-csv" ? "Paste JSON array of objects..." : "Paste CSV text with header row..."}
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>OUTPUT ({mode === "json-to-csv" ? "CSV Spreadsheets" : "JSON Array"})</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <FileSpreadsheet size={13} /> Formatted
            </span>
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
