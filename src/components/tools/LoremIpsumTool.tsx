"use client";
import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function LoremIpsumTool() {
  const [count, setCount] = useState<number>(3);
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const generate = async () => {
    const res = await executeTool("lorem-ipsum", String(count), undefined, { count });
    setOutput(res.output);
  };

  useEffect(() => {
    void generate();
  }, [count]);

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
          <h2>Lorem Ipsum Placeholder Text Generator</h2>
          <p>Generate clean, readable dummy placeholder paragraphs for UI design mockups and documentation</p>
        </div>
        <div className="tool-actions">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.95rem" }}>Paragraphs:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              className="control-input"
              style={{ width: "80px" }}
            />
          </div>
          <button className="primary-button" onClick={() => void generate()}>
            <RefreshCw size={15} /> Regenerate
          </button>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="pane">
        <div className="pane-head">
          <span>GENERATED LOREM IPSUM PARAGRAPHS</span>
        </div>
        <textarea
          className="code-textarea"
          value={output}
          readOnly
          rows={16}
          spellCheck={false}
          style={{ lineHeight: "1.7", fontSize: "1.05rem" }}
        />
      </div>
    </div>
  );
}
