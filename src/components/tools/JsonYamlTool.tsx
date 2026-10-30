"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function JsonYamlTool() {
  const [mode, setMode] = useState<"json-to-yaml" | "yaml-to-json">("json-to-yaml");
  const [input, setInput] = useState<string>(
    '{\n  "service": "prochange-api",\n  "version": "2.0.0",\n  "database": {\n    "host": "localhost",\n    "port": 5432,\n    "ssl": true\n  },\n  "replicas": 3\n}'
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("json-yaml-converter", input, undefined, { mode });
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
    setMode((m) => (m === "json-to-yaml" ? "yaml-to-json" : "json-to-yaml"));
  };

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>JSON ⇄ YAML Configuration Converter</h2>
          <p>Seamlessly convert JSON configuration files to clean YAML and YAML configs back to formatted JSON</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "json-to-yaml" ? "active" : ""}`}
              onClick={() => setMode("json-to-yaml")}
            >
              JSON → YAML
            </button>
            <button
              className={`mode-btn ${mode === "yaml-to-json" ? "active" : ""}`}
              onClick={() => setMode("yaml-to-json")}
            >
              YAML → JSON
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
            <span>INPUT ({mode === "json-to-yaml" ? "JSON Config" : "YAML Config"})</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "json-to-yaml" ? "Paste JSON structure here..." : "Paste YAML config here..."}
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>OUTPUT ({mode === "json-to-yaml" ? "YAML Config" : "Formatted JSON"})</span>
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
