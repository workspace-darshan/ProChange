"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Heart, Cake, Briefcase, Sparkles } from "lucide-react";
import { executeTool } from "@/lib/tools/execute";

export default function WishesTemplatesTool() {
  const [recipient, setRecipient] = useState<string>("Priya");
  const [category, setCategory] = useState<string>("birthday");
  const [extraData, setExtraData] = useState<Record<string, any>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    void executeTool("wishes-templates", recipient, "", {
      recipientName: recipient,
      category,
    }).then((res) => {
      if (res.extra) {
        setExtraData(res.extra);
      }
    });
  }, [recipient, category]);

  const copyTemplate = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1400);
    } catch {
      // ignore
    }
  };

  const templates: { title: string; text: string }[] = extraData.templates || [];

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">💌</span>
          <div>
            <div className="tool-category-badge">DAILY & FINANCE</div>
            <h1 className="tool-title">Pre-typed Wishes & Events Message Hub</h1>
            <p className="tool-desc">
              Ready-to-use formatted messages for birthdays, festivals, leave requests, resignations, and celebrations.
            </p>
          </div>
        </div>
      </div>

      <div className="custom-tool-card" style={{ marginBottom: 18 }}>
        <div className="custom-tool-header">
          <strong>Category & Recipient Configuration</strong>
          <span>Pick template theme and personalize:</span>
        </div>
        <div className="custom-tool-row">
          <div className="config-group">
            <span className="config-label">Category:</span>
            {[
              { id: "birthday", label: "🎂 Birthday Wishes" },
              { id: "workplace", label: "💼 Leave & Workplace" },
              { id: "festival", label: "🎆 Celebrations & New Year" },
            ].map((item) => (
              <button
                key={item.id}
                className={`pill-choice ${category === item.id ? "active" : ""}`}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="name-input-group">
            <span>Recipient Name:</span>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter name (e.g. Priya)"
            />
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {templates.map((tpl, i) => (
          <div key={i} className="custom-tool-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <strong style={{ fontSize: "14px", color: "var(--text)" }}>{tpl.title}</strong>
              <button
                className="download-pill-btn"
                onClick={() => copyTemplate(tpl.text, i)}
              >
                {copiedIdx === i ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedIdx === i ? "Copied to Clipboard!" : "Copy Template"}</span>
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--muted)", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {tpl.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
