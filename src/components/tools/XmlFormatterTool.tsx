"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function XmlFormatterTool() {
  const [input, setInput] = useState<string>(
    '<prochange suite="developer"><platform version="2.0"><tools count="26"><tool id="xml"><name>XML Formatter</name><status>active</status></tool></tools></platform></prochange>'
  );
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("xml-formatter", input);
      setOutput(res.output);
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
          <h2>XML & HTML Markup Formatter</h2>
          <p>Cleanly indent and format XML structures and HTML markup trees</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy XML"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>RAW XML INPUT</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw XML here..."
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>INDENTED XML OUTPUT</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Code2 size={13} /> Formatted Tree
            </span>
          </div>
          <textarea
            className="code-textarea"
            value={output}
            readOnly
            rows={15}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
