"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock3, Copy, Check } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function TimestampConverterTool() {
  const [input, setInput] = useState<string>("1700000000");
  const [datetimeLocal, setDatetimeLocal] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [meta, setMeta] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    void executeTool("timestamp", input, "", { mode: "auto" }).then((res) => {
      setOutput(res.output);
      setMeta(res.meta || "");
    });
  }, [input]);

  const handleDatetimeChange = (val: string) => {
    setDatetimeLocal(val);
    if (!val) return;
    const epochSec = Math.floor(new Date(val).getTime() / 1000);
    setInput(epochSec.toString());
  };

  const handlePreset = (type: "4pm" | "now" | "start" | "end") => {
    const d = new Date();
    if (type === "4pm") {
      d.setHours(16, 0, 0, 0);
    } else if (type === "now") {
      // current time
    } else if (type === "start") {
      d.setHours(0, 0, 0, 0);
    } else if (type === "end") {
      d.setHours(23, 59, 59, 999);
    }
    const epoch = Math.floor(d.getTime() / 1000);
    setInput(epoch.toString());
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">◷</span>
          <div>
            <div className="tool-category-badge">CONVERTERS</div>
            <h1 className="tool-title">Timestamp & Date Converter</h1>
            <p className="tool-desc">
              Convert Unix timestamps (seconds & milliseconds) and human time expressions (e.g. 4pm, ISO dates, today).
            </p>
          </div>
        </div>
      </div>

      {/* Preset Controls */}
      <div className="timestamp-tools-bar" style={{ marginBottom: 18 }}>
        <div className="timestamp-tools-row">
          <div className="timestamp-picker-field">
            <Calendar size={15} />
            <span>Select Date & Time:</span>
            <input
              type="datetime-local"
              className="datetime-input"
              value={datetimeLocal}
              onChange={(e) => handleDatetimeChange(e.target.value)}
            />
          </div>

          <div className="timestamp-presets-row">
            <span className="presets-label">Quick Timestamps:</span>
            <button className="preset-btn highlight" onClick={() => handlePreset("4pm")}>
              <Clock3 size={13} /> Today 4:00 PM
            </button>
            <button className="preset-btn" onClick={() => handlePreset("now")}>
              Now
            </button>
            <button className="preset-btn" onClick={() => handlePreset("start")}>
              Today 00:00
            </button>
            <button className="preset-btn" onClick={() => handlePreset("end")}>
              Today 23:59
            </button>
          </div>
        </div>
      </div>

      {/* Input / Output */}
      <div className="editor-card">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <span className="pane-label">
              <span className="pane-dot input-dot" /> INPUT TIMESTAMP OR DATE
            </span>
          </div>
        </div>
        <div className="panes-container">
          <div className="input-pane">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter epoch (1700000000) or 'today 4pm', '4:00 PM', or ISO date"
              style={{ minHeight: "90px" }}
            />
          </div>
        </div>

        <div className="output-toolbar">
          <div className="toolbar-left">
            <span className="pane-label">
              <span className="pane-dot output-dot" /> CONVERTED TIMESTAMP DETAILS
            </span>
            {meta && <span className="output-meta-tag">{meta}</span>}
          </div>
          <div className="toolbar-right">
            <button className="copy-button" onClick={copyOutput}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Output"}</span>
            </button>
          </div>
        </div>
        <div className="output-pane">
          <pre className="output-code">{output}</pre>
        </div>
      </div>
    </div>
  );
}
