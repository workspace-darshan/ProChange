"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Database } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function SqlFormatterTool() {
  const [input, setInput] = useState<string>(
    "SELECT u.id, u.username, u.email, p.title, COUNT(c.id) AS comments_count FROM users u LEFT JOIN posts p ON p.author_id = u.id LEFT JOIN comments c ON c.post_id = p.id WHERE u.status = 'active' AND p.published_at >= '2026-01-01' GROUP BY u.id, u.username, u.email, p.title ORDER BY comments_count DESC LIMIT 25;"
  );
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("sql-formatter", input);
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
          <h2>SQL Query Formatter & Beautifier</h2>
          <p>Format complex SQL queries with standard uppercase keywords and clean clause indentation</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Formatted SQL"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>RAW SQL INPUT</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your unformatted SQL query here..."
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>BEAUTIFIED SQL</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Database size={13} /> ANSI / PostgreSQL / MySQL
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
