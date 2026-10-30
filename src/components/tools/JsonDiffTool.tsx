"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ArrowLeftRight } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function JsonDiffTool() {
  const [jsonA, setJsonA] = useState<string>('{\n  "name": "proChange",\n  "version": 1.0,\n  "status": "beta",\n  "port": 3000\n}');
  const [jsonB, setJsonB] = useState<string>('{\n  "name": "proChange",\n  "version": 2.0,\n  "status": "production",\n  "port": 3001,\n  "routes": "modular"\n}');
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("json-diff", jsonA, jsonB);
      setOutput(res.output);
    }
    const t = setTimeout(run, 120);
    return () => clearTimeout(t);
  }, [jsonA, jsonB]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const swap = () => {
    const temp = jsonA;
    setJsonA(jsonB);
    setJsonB(temp);
  };

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>JSON Diff & Comparison Inspector</h2>
          <p>Compare two JSON objects side-by-side to highlight additions (+), modifications (~), and deletions (-)</p>
        </div>
        <div className="tool-actions">
          <button className="primary-button" onClick={swap} title="Swap Original and Modified">
            <ArrowLeftRight size={15} /> Swap A ⇄ B
          </button>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Diff Report"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>ORIGINAL JSON (A)</span>
            <button className="subtle-btn" onClick={() => setJsonA("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={jsonA}
            onChange={(e) => setJsonA(e.target.value)}
            placeholder="Paste original JSON..."
            rows={12}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>MODIFIED JSON (B)</span>
            <button className="subtle-btn" onClick={() => setJsonB("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={jsonB}
            onChange={(e) => setJsonB(e.target.value)}
            placeholder="Paste modified JSON..."
            rows={12}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="pane" style={{ marginTop: "1rem" }}>
        <div className="pane-head">
          <span>DELTA / DIFF OUTPUT</span>
        </div>
        <textarea
          className="code-textarea"
          value={output}
          readOnly
          rows={10}
          spellCheck={false}
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}
        />
      </div>
    </div>
  );
}
