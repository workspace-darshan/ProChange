"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function JsonToTypesTool() {
  const [input, setInput] = useState<string>(
    '{\n  "userId": 101,\n  "username": "darshan_dev",\n  "isActive": true,\n  "profile": {\n    "role": "Lead Architect",\n    "location": "India"\n  },\n  "skills": ["TypeScript", "Next.js", "React"]\n}'
  );
  const [targetLang, setTargetLang] = useState<"typescript" | "csharp">("typescript");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function run() {
      const res = await executeTool("json-to-types", input, undefined, { targetLanguage: targetLang });
      setOutput(res.output);
      setError(res.error || "");
    }
    const t = setTimeout(run, 120);
    return () => clearTimeout(t);
  }, [input, targetLang]);

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
          <h2>JSON to Type Definitions (TypeScript & C#)</h2>
          <p>Instantly generate strongly-typed TypeScript interfaces or C# class models from JSON payloads</p>
        </div>
        <div className="tool-actions">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${targetLang === "typescript" ? "active" : ""}`}
              onClick={() => setTargetLang("typescript")}
            >
              TypeScript
            </button>
            <button
              className={`mode-btn ${targetLang === "csharp" ? "active" : ""}`}
              onClick={() => setTargetLang("csharp")}
            >
              C# Class
            </button>
          </div>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Types"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>JSON OBJECT INPUT</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON object here..."
            rows={15}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>GENERATED {targetLang.toUpperCase()} DEFINITION</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Code2 size={13} /> {targetLang === "typescript" ? "interface" : "class"}
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
