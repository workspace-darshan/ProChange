"use client";
import { useState, useEffect, useRef } from "react";
import { Copy, Check, Palette, Pipette } from "lucide-react";
import { executeTool, parseColor } from "@/lib/tools/execute";

const presetColors = [
  { name: "Pro Emerald", hex: "#10B981" },
  { name: "Dev Violet", hex: "#7C5CFC" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Electric Blue", hex: "#3B82F6" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Rose Red", hex: "#F43F5E" },
  { name: "Dark Slate", hex: "#1E293B" },
  { name: "Pure White", hex: "#FFFFFF" },
];

export default function ColorConverterTool() {
  const [colorInput, setColorInput] = useState<string>("#10B981");
  const [colorHex, setColorHex] = useState<string>("#10B981");
  const [extraData, setExtraData] = useState<Record<string, any>>({});
  const [rawOutput, setRawOutput] = useState<string>("");
  const [copied, setCopied] = useState<string>("");
  const colorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const parsed = parseColor(colorInput);
      setColorHex(parsed.hex);
    } catch {
      // ignore
    }

    void executeTool("color-converter", colorInput, "", {}).then((res) => {
      setRawOutput(res.output);
      if (res.extra) {
        setExtraData(res.extra);
      }
    });
  }, [colorInput]);

  const copyVal = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-heading">
        <div className="heading-icon">🎨</div>
        <div className="heading-copy">
          <div className="eyebrow">TESTERS & TEXT</div>
          <h1>Color Converter & Swatch</h1>
          <p>
            Interactive color picker and bidirectional converter for HEX, RGB, HSL, and CMYK color spaces.
          </p>
        </div>
      </div>

      <div className="color-preview-card" style={{ marginBottom: 18 }}>
        <div className="color-preview-header">
          <div className="color-preview-label">
            <Palette size={16} />
            <span>Live Color Preview & Picker</span>
          </div>
          <div className="color-format-chips">
            <span className="format-badge">HEX</span>
            <span className="format-badge">RGB</span>
            <span className="format-badge">HSL</span>
            <span className="format-badge">CMYK</span>
          </div>
        </div>

        <div className="color-preview-body">
          <div
            className="color-swatch-box"
            style={{ backgroundColor: colorHex }}
            onClick={() => colorPickerRef.current?.click()}
            title="Click to open color picker"
          >
            <span className="swatch-text-preview" style={{ color: colorHex === "#FFFFFF" ? "#000" : "#fff" }}>
              Aa
            </span>
            <input
              ref={colorPickerRef}
              type="color"
              className="color-picker-input-hidden"
              value={colorHex}
              onChange={(e) => {
                setColorHex(e.target.value);
                setColorInput(e.target.value);
              }}
            />
          </div>

          <div className="color-meta-col">
            <div className="color-hex-tag-row">
              <span className="color-hex-display">{colorHex.toUpperCase()}</span>
              <button
                className="picker-button"
                onClick={() => colorPickerRef.current?.click()}
              >
                <Pipette size={14} /> Pick Color
              </button>

              <button
                className="quick-copy-pill"
                onClick={() => copyVal(colorHex, "hex")}
              >
                {copied === "hex" ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied === "hex" ? "Copied!" : "Copy HEX"}</span>
              </button>

              {extraData.rgb && (
                <button
                  className="quick-copy-pill"
                  onClick={() => copyVal(extraData.rgb, "rgb")}
                >
                  {copied === "rgb" ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied === "rgb" ? "Copied!" : "Copy RGB"}</span>
                </button>
              )}

              {extraData.hsl && (
                <button
                  className="quick-copy-pill"
                  onClick={() => copyVal(extraData.hsl, "hsl")}
                >
                  {copied === "hsl" ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied === "hsl" ? "Copied!" : "Copy HSL"}</span>
                </button>
              )}
            </div>

            <div className="preset-colors-row">
              <span className="palette-label">Preset Colors:</span>
              {presetColors.map((p) => (
                <button
                  key={p.hex}
                  className="palette-swatch-chip"
                  style={{ backgroundColor: p.hex }}
                  title={`${p.name} (${p.hex})`}
                  onClick={() => {
                    setColorHex(p.hex);
                    setColorInput(p.hex);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="card-plate" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: "12px", fontWeight: 800, color: "var(--muted)" }}>
          <span className="pane-dot input-dot" /> ENTER COLOR (HEX, RGB, OR HSL)
        </div>
        <input
          type="text"
          className="control-input"
          value={colorInput}
          onChange={(e) => setColorInput(e.target.value)}
          placeholder="#10B981, rgb(16, 185, 129), or hsl(160, 84%, 39%)"
          style={{ width: "100%", fontSize: "1.15rem", fontFamily: "var(--font-mono)", padding: "10px 14px" }}
        />
      </div>

      {/* Output JSON */}
      <div className="card-plate">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", fontWeight: 800, color: "var(--muted)" }}>
            <span className="pane-dot output-dot" /> CONVERTED COLOR VALUES (JSON)
          </div>
          <button className="copy-btn" onClick={() => copyVal(rawOutput, "output")}>
            {copied === "output" ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied === "output" ? "Copied Output!" : "Copy Output"}</span>
          </button>
        </div>
        <textarea
          className="code-textarea"
          value={rawOutput}
          readOnly
          rows={9}
          style={{ background: "var(--surface-2)", borderRadius: "8px", border: "1px solid var(--line)", padding: "12px 14px" }}
        />
      </div>
    </div>
  );
}
