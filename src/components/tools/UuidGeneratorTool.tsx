"use client";
import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

export default function UuidGeneratorTool() {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [noHyphens, setNoHyphens] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const generate = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (noHyphens) id = id.replace(/-/g, "");
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  };

  useEffect(() => {
    generate();
  }, [count, uppercase, noHyphens]);

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>UUID v4 Generator</h2>
          <p>Generate standard RFC 4122 Version-4 Universally Unique Identifiers using browser WebCrypto</p>
        </div>
        <div className="tool-actions">
          <button className="primary-button" onClick={generate}>
            <RefreshCw size={15} /> Regenerate
          </button>
          <button className="copy-btn" onClick={copyAll}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy All"}
          </button>
        </div>
      </div>

      <div className="card-plate" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.95rem" }}>Count:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
              className="control-input"
              style={{ width: "80px" }}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
            Uppercase
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)} />
            No Hyphens
          </label>
        </div>
      </div>

      <div className="pane">
        <div className="pane-head">
          <span>GENERATED UUIDs ({uuids.length})</span>
        </div>
        <textarea
          className="code-textarea"
          value={uuids.join("\n")}
          readOnly
          rows={Math.max(8, Math.min(20, uuids.length + 2))}
          spellCheck={false}
          style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", lineHeight: "1.7" }}
        />
      </div>
    </div>
  );
}
