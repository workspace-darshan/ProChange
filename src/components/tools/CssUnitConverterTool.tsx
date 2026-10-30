"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function CssUnitConverterTool() {
  const [input, setInput] = useState<string>("padding: 16px;\nmargin-top: 24px;\nfont-size: 14px;\nborder-radius: 8px;");
  const [baseSize, setBaseSize] = useState<number>(16);
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("css-unit-converter", input, undefined, { baseSize });
      setOutput(res.output);
    }
    const t = setTimeout(run, 120);
    return () => clearTimeout(t);
  }, [input, baseSize]);

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
          <h2>CSS Unit Converter (PX ⇄ REM)</h2>
          <p>Quickly convert pixel measurements to REM / EM based on root font size</p>
        </div>
        <div className="tool-actions">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Base Font Size:</span>
            <input
              type="number"
              className="control-input"
              value={baseSize}
              onChange={(e) => setBaseSize(Number(e.target.value) || 16)}
              style={{ width: "80px" }}
              min={1}
            />
            <span style={{ fontSize: "0.9rem" }}>px</span>
          </div>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy REM CSS"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>INPUT CSS (with PX)</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. font-size: 16px; margin: 32px;"
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>OUTPUT CSS (with REM)</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <ArrowRightLeft size={13} /> 1rem = {baseSize}px
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
