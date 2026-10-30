"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Download, QrCode } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function QrGeneratorTool() {
  const [input, setInput] = useState<string>("https://github.com/workspace-darshan/ProChange");
  const [rawSvg, setRawSvg] = useState<string>("");
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  useEffect(() => {
    void executeTool("qr-generator", input, "", {}).then((res) => {
      if (res.extra?.rawSvg) {
        setRawSvg(res.extra.rawSvg);
      }
    });
  }, [input]);

  const copySvg = async () => {
    try {
      await navigator.clipboard.writeText(rawSvg);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 1400);
    } catch {
      // ignore
    }
  };

  const downloadSvg = () => {
    try {
      const blob = new Blob([rawSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prochange-qrcode.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">▣</span>
          <div>
            <div className="tool-category-badge">ENCODERS & DECODERS</div>
            <h1 className="tool-title">QR Code Generator</h1>
            <p className="tool-desc">
              Generate crisp, vector SVG QR codes for URLs, WiFi credentials, plain text, or contact cards.
            </p>
          </div>
        </div>
      </div>

      <div className="custom-tool-card" style={{ marginBottom: 18 }}>
        <div className="custom-tool-header">
          <strong>Live QR Code Preview & Export</strong>
          <span>Scannable with any mobile phone camera or scanner app:</span>
        </div>
        <div className="qr-preview-box">
          <div className="qr-render-area" dangerouslySetInnerHTML={{ __html: rawSvg }} />
          <div className="qr-actions">
            <button className="download-pill-btn" onClick={downloadSvg} disabled={!rawSvg}>
              <Download size={14} /> Download SVG File
            </button>
            <button className="download-pill-btn" onClick={copySvg} disabled={!rawSvg}>
              {copiedSvg ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSvg ? "Copied SVG Code!" : "Copy SVG Code"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="editor-card">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <span className="pane-label">
              <span className="pane-dot input-dot" /> QR CODE CONTENT (TEXT OR URL)
            </span>
          </div>
        </div>
        <div className="panes-container">
          <div className="input-pane">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or URL to generate QR code..."
              style={{ minHeight: "100px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
