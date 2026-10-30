"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ArrowRightLeft } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function HtmlEntitiesTool() {
  const [mode, setMode] = useState<"escape" | "unescape">("escape");
  const [input, setInput] = useState<string>('<div class="prochange-card">\n  <h3>"Privacy First" & Zero Tracking</h3>\n  <p>Runs 100% locally!</p>\n</div>');
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("html-entities", input, undefined, { mode });
      setOutput(res.output);
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
    if (!output) return;
    setInput(output);
    setMode((m) => (m === "escape" ? "unescape" : "escape"));
  };

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>HTML Entities Escape & Unescape</h2>
          <p>Safely convert sensitive characters like &lt;, &gt;, &amp;, &quot;, and &#39; into HTML entities or restore raw markup</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "escape" ? "active" : ""}`}
              onClick={() => setMode("escape")}
            >
              Escape (&lt;div&gt;)
            </button>
            <button
              className={`mode-btn ${mode === "unescape" ? "active" : ""}`}
              onClick={() => setMode("unescape")}
            >
              Unescape (&lt; → &lt;)
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
            <span>INPUT ({mode === "escape" ? "Raw HTML Markup" : "Escaped HTML Entities"})</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter markup here..."
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>OUTPUT ({mode === "escape" ? "Safe HTML Entities" : "Raw HTML Markup"})</span>
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
