"use client";
import { useState } from "react";
import { Copy, Check, Eye } from "lucide-react";

export default function MarkdownPreviewTool() {
  const [input, setInput] = useState<string>(
    `# Welcome to proChange

Your **all-in-one developer & productivity suite**.

### Key Highlights:
- **Modular Routes**: Every tool has its own dedicated debuggable route
- **100% Client-Side Privacy**: Fast WebCrypto execution with zero data storage
- **Salary & LPA Calculator**: Instant in-hand breakdown with taxes & PF
- **Disposable Temp Mail**: Real live incoming mail verification

### Code Sample:
\`\`\`typescript
interface DeveloperTool {
  id: string;
  name: string;
  isFast: boolean;
}

const proChange: DeveloperTool = {
  id: "prochange",
  name: "proChange Suite",
  isFast: true,
};
\`\`\`

> "Simplicity is the prerequisite for reliability." — Edsger W. Dijkstra
`
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Simple markdown to HTML parser for instant zero-dependency rendering
  const renderMarkdown = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3 style="margin: 0.75rem 0 0.5rem; font-size: 1.25rem;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="margin: 1rem 0 0.5rem; font-size: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="margin: 1.25rem 0 0.75rem; font-size: 1.85rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem;">$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--text-secondary); margin: 0.75rem 0;">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code style="background: var(--bg-hover); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9em;">$1</code>')
      .replace(/^- (.*$)/gim, '<li style="margin-left: 1.5rem; list-style-type: disc;">$1</li>')
      .replace(/\n\n/gim, '<p style="margin: 0.6rem 0;"></p>');

    // Handle code blocks
    html = html.replace(/```([\s\S]*?)```/gm, (_match, code) => {
      return `<pre style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; overflow-x: auto; font-family: var(--font-mono); font-size: 0.9rem; margin: 0.75rem 0;"><code>${code.trim()}</code></pre>`;
    });

    return html;
  };

  const copy = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="tool-view">
      <div className="tool-header">
        <div>
          <h2>Live Markdown Previewer</h2>
          <p>Real-time split-screen Markdown editor with instant live HTML rendering and syntax styling</p>
        </div>
        <div className="tool-actions">
          <button className="copy-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied Markdown" : "Copy Raw Markdown"}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="pane">
          <div className="pane-head">
            <span>MARKDOWN EDITOR</span>
            <button className="subtle-btn" onClick={() => setInput("")}>Clear</button>
          </div>
          <textarea
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your markdown here..."
            rows={18}
            spellCheck={false}
          />
        </div>

        <div className="pane">
          <div className="pane-head">
            <span>LIVE RENDERED PREVIEW</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Eye size={13} /> Visual Output
            </span>
          </div>
          <div
            className="code-textarea"
            style={{ overflowY: "auto", minHeight: "400px", padding: "1.25rem", lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(input) }}
          />
        </div>
      </div>
    </div>
  );
}
