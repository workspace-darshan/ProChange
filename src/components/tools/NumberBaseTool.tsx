"use client";
import { useState } from "react";
import { Copy, Check, Binary } from "lucide-react";

export default function NumberBaseTool() {
  const [dec, setDec] = useState<string>("255");
  const [copiedKey, setCopiedKey] = useState<string>("");

  const num = parseInt(dec, 10);
  const isValid = !isNaN(num);

  const bin = isValid ? num.toString(2) : "";
  const hex = isValid ? num.toString(16).toUpperCase() : "";
  const oct = isValid ? num.toString(8) : "";
  const ascii = isValid && num >= 32 && num <= 126 ? String.fromCharCode(num) : "N/A (Control or non-printable)";

  const copyVal = async (val: string, key: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1400);
  };

  const setFromBin = (val: string) => {
    const clean = val.replace(/[^01]/g, "");
    if (!clean) {
      setDec("");
      return;
    }
    const n = parseInt(clean, 2);
    setDec(isNaN(n) ? "" : n.toString(10));
  };

  const setFromHex = (val: string) => {
    const clean = val.replace(/[^0-9a-fA-F]/g, "");
    if (!clean) {
      setDec("");
      return;
    }
    const n = parseInt(clean, 16);
    setDec(isNaN(n) ? "" : n.toString(10));
  };

  const setFromOct = (val: string) => {
    const clean = val.replace(/[^0-7]/g, "");
    if (!clean) {
      setDec("");
      return;
    }
    const n = parseInt(clean, 8);
    setDec(isNaN(n) ? "" : n.toString(10));
  };

  const bases = [
    { key: "dec", name: "Decimal (Base 10)", val: dec, onChg: (v: string) => setDec(v.replace(/[^0-9]/g, "")) },
    { key: "hex", name: "Hexadecimal (Base 16)", val: hex, onChg: setFromHex },
    { key: "bin", name: "Binary (Base 2)", val: bin, onChg: setFromBin },
    { key: "oct", name: "Octal (Base 8)", val: oct, onChg: setFromOct },
  ];

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>Live Number Base Converter</h2>
          <p>Instant 5-way synchronized conversion between Decimal, Binary, Hexadecimal, Octal, and ASCII characters</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {bases.map((b) => (
          <div key={b.key} className="card-plate" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <strong style={{ fontSize: "0.95rem" }}>{b.name}</strong>
              <button
                className="subtle-btn"
                onClick={() => copyVal(b.val, b.key)}
                style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
              >
                {copiedKey === b.key ? <Check size={12} /> : <Copy size={12} />} {copiedKey === b.key ? "Copied" : "Copy"}
              </button>
            </div>
            <input
              type="text"
              className="control-input"
              value={b.val}
              onChange={(e) => b.onChg(e.target.value)}
              placeholder={`Enter ${b.name}...`}
              style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", width: "100%" }}
            />
          </div>
        ))}
      </div>

      <div className="card-plate" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <strong style={{ fontSize: "0.95rem" }}>ASCII Character Equivalent</strong>
          <button
            className="subtle-btn"
            onClick={() => copyVal(ascii, "ascii")}
            style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
          >
            {copiedKey === "ascii" ? <Check size={12} /> : <Copy size={12} />} {copiedKey === "ascii" ? "Copied" : "Copy"}
          </button>
        </div>
        <div style={{ fontSize: "1.2rem", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
          {ascii}
        </div>
      </div>
    </div>
  );
}
