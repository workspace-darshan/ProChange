"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Download } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function MockDataGeneratorTool() {
  const [count, setCount] = useState<number>(50);
  const [format, setFormat] = useState<string>("json");
  const [output, setOutput] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    void executeTool("mock-data-generator", count.toString(), "", {
      count,
      format,
    }).then((res) => {
      setOutput(res.output);
      setMeta(res.meta || "");
    });
  }, [count, format]);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  const downloadFile = () => {
    try {
      const type = format === "csv" ? "text/csv" : format === "sql" ? "text/plain" : "application/json";
      const blob = new Blob([output], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mock_data_${count}_records.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">⚡</span>
          <div>
            <div className="tool-category-badge">GENERATORS</div>
            <h1 className="tool-title">Custom Mock Data Generator</h1>
            <p className="tool-desc">
              Generate 10 to 1,000+ realistic mock data records with names, emails, passwords, ages, roles, addresses, and phone numbers in JSON, CSV, or SQL format.
            </p>
          </div>
        </div>
      </div>

      <div className="custom-tool-card" style={{ marginBottom: 18 }}>
        <div className="custom-tool-header">
          <strong>Volume & Format Configuration</strong>
          <span>Choose how many records you need:</span>
        </div>
        <div className="custom-tool-row">
          <div className="config-group">
            <span className="config-label">Volume:</span>
            {[10, 50, 100, 250, 500, 1000].map((c) => (
              <button
                key={c}
                className={`pill-choice ${count === c ? "active" : ""}`}
                onClick={() => setCount(c)}
              >
                {c} Records
              </button>
            ))}
          </div>

          <div className="config-group">
            <span className="config-label">Output Format:</span>
            {["json", "csv", "sql"].map((fmt) => (
              <button
                key={fmt}
                className={`pill-choice ${format === fmt ? "active" : ""}`}
                onClick={() => setFormat(fmt)}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          {output && (
            <button className="download-pill-btn" onClick={downloadFile}>
              <Download size={14} /> Download File
            </button>
          )}
        </div>
      </div>

      {/* Editor / Output Area */}
      <div className="editor-card">
        <div className="output-toolbar">
          <div className="toolbar-left">
            <span className="pane-label">
              <span className="pane-dot output-dot" /> GENERATED MOCK DATA
            </span>
            {meta && <span className="output-meta-tag">{meta}</span>}
          </div>
          <div className="toolbar-right">
            <button className="copy-button" onClick={copyOutput}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Output"}</span>
            </button>
          </div>
        </div>
        <div className="output-pane">
          <pre className="output-code">{output}</pre>
        </div>
      </div>
    </div>
  );
}
