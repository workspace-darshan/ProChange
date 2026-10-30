"use client";
import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, ShieldCheck, KeyRound } from "lucide-react";

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState<number>(20);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const generate = () => {
    let chars = "";
    if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) chars += "0123456789";
    if (useSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    let res = "";
    for (let i = 0; i < length; i++) {
      res += chars[array[i] % chars.length];
    }
    setPassword(res);
  };

  useEffect(() => {
    generate();
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const entropy = Math.round(length * Math.log2(
    (useUpper ? 26 : 0) + (useLower ? 26 : 0) + (useNumbers ? 10 : 0) + (useSymbols ? 30 : 0) || 1
  ));

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>Cryptographic Password & Passphrase Generator</h2>
          <p>Generate high-entropy random passwords using browser WebCrypto API with zero server logging</p>
        </div>
      </div>

      <div className="card-plate" style={{ padding: "1.5rem", marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <input
            type="text"
            className="control-input"
            value={password}
            readOnly
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              padding: "0.85rem 1rem",
              letterSpacing: "1px",
              flex: 1,
            }}
          />
          <button className="primary-button" onClick={generate} title="Generate new password">
            <RefreshCw size={16} /> New
          </button>
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Length: {length}</span>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ fontSize: "0.9rem", color: entropy > 70 ? "var(--success)" : "var(--accent)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <ShieldCheck size={16} /> {entropy} bits entropy ({entropy > 70 ? "Very Strong" : "Moderate"})
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} />
            Uppercase (A-Z)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} />
            Lowercase (a-z)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
            Numbers (0-9)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
            Symbols (!@#$%)
          </label>
        </div>
      </div>
    </div>
  );
}
