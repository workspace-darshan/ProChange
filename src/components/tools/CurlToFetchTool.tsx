"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function CurlToFetchTool() {
  const [input, setInput] = useState<string>(
    'curl -X POST https://api.example.com/v1/auth/login -H "Content-Type: application/json" -H "Authorization: Bearer token123" -d \'{"email":"dev@prochange.com","pass":"secret"}\''
  );
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("curl-to-fetch", input);
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
          <h2>cURL to Fetch & Axios Converter</h2>
          <p>Transform raw bash curl command lines into modern JavaScript Fetch API requests</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Fetch Snippet"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>RAW CURL COMMAND</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste curl -X POST ... command here"
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>MODERN JAVASCRIPT FETCH CODE</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Terminal size={13} /> Async / Await
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
