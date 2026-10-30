"use client";
import { useState, useEffect, useCallback } from "react";
import { Mail, Copy, Check, RefreshCw, RotateCcw, Inbox } from "lucide-react";

export default function TempMailTool() {
  const [address, setAddress] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMail, setSelectedMail] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedAddr, setCopiedAddr] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  const createAccount = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tempmail?action=create");
      const data = await res.json();
      if (data.success) {
        setAddress(data.address);
        setToken(data.token);
        setSelectedMail(null);
        setMessages([]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMessages = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/tempmail?action=messages&token=${token}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  const viewMessage = useCallback(async (msgId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/tempmail?action=message&id=${msgId}&token=${token}`);
      const data = await res.json();
      if (data.success) {
        setSelectedMail(data);
      }
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      void createAccount();
    }
  }, [token, createAccount]);

  // Polling every 10s
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      void refreshMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [token, refreshMessages]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 1400);
    } catch {
      // ignore
    }
  };

  const copyOtp = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <div className="workspace">
      {/* Title */}
      <div className="tool-header">
        <div className="tool-title-row">
          <span className="tool-icon-large">✉</span>
          <div>
            <div className="tool-category-badge">DAILY & FINANCE</div>
            <h1 className="tool-title">Disposable Temporary Mailbox</h1>
            <p className="tool-desc">
              Real working temporary email address with instant OTP verification extraction and live message feed.
            </p>
          </div>
        </div>
      </div>

      <div className="temp-mail-box-full">
        {/* Top Control Bar */}
        <div className="temp-mail-top-bar">
          <div className="temp-mail-addr-display">
            <div className="temp-mail-pill">
              <span className="live-pulse-dot" />
              <Mail size={16} />
              <span>{address || (loading ? "Generating live mailbox..." : "pro_user@tempbox.live")}</span>
            </div>
            <button
              className="download-pill-btn"
              onClick={copyAddress}
              disabled={!address}
            >
              {copiedAddr ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedAddr ? "Copied Address!" : "Copy Address"}</span>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="download-pill-btn"
              onClick={() => void refreshMessages()}
              disabled={refreshing || !token}
            >
              <RefreshCw size={14} className={refreshing ? "spin" : ""} />
              <span>{refreshing ? "Checking..." : "Check Inbox Now"}</span>
            </button>
            <button
              className="pill-choice"
              onClick={() => void createAccount()}
              disabled={loading}
            >
              <RotateCcw size={13} />
              <span>New Address</span>
            </button>
          </div>
        </div>

        {/* Two column Inbox layout */}
        <div className="temp-mail-inbox-layout">
          {/* Left: Message list */}
          <div className="inbox-list-col">
            <div className="inbox-list-header">
              <span>INBOX ({messages.length})</span>
              <span style={{ fontSize: "11px", color: "var(--subtle)", fontWeight: "600" }}>Auto-polling live</span>
            </div>

            {messages.length === 0 ? (
              <div className="mail-empty-state">
                <Inbox size={32} style={{ opacity: 0.4 }} />
                <strong style={{ color: "var(--text)", fontSize: "14px" }}>Inbox is Waiting for Mail</strong>
                <p style={{ fontSize: "12px", maxWidth: "260px" }}>
                  Send an email or verification code to <span style={{ fontFamily: "monospace", color: "var(--accent)" }}>{address || "your temp email"}</span>. New messages appear here automatically.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`inbox-msg-item ${selectedMail?.id === msg.id ? "active" : ""}`}
                  onClick={() => void viewMessage(msg.id)}
                >
                  <div className="msg-sender-row">
                    <span className="msg-sender">{msg.from}</span>
                    <span className="msg-time">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}</span>
                  </div>
                  <div className="msg-subj">{msg.subject}</div>
                  <div className="msg-preview">{msg.intro}</div>
                </div>
              ))
            )}
          </div>

          {/* Right: Message Reader */}
          <div className="mail-reader-col">
            {selectedMail ? (
              <>
                <div className="mail-reader-header">
                  <h3 className="mail-reader-subject">{selectedMail.subject}</h3>
                  <div className="mail-reader-meta">
                    <span><strong>From:</strong> {selectedMail.from}</span>
                    <span>{selectedMail.createdAt ? new Date(selectedMail.createdAt).toLocaleString() : ""}</span>
                  </div>
                </div>

                {selectedMail.otp && (
                  <div className="otp-reader-banner">
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "750", color: "#fbbf24", display: "block" }}>DETECTED VERIFICATION OTP</span>
                      <span className="otp-reader-code">{selectedMail.otp}</span>
                    </div>
                    <button
                      className="otp-pill-btn"
                      onClick={() => copyOtp(selectedMail.otp)}
                    >
                      {copiedOtp ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedOtp ? "Copied OTP!" : "Copy OTP"}</span>
                    </button>
                  </div>
                )}

                <div className="mail-body-content">
                  {selectedMail.html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedMail.html }} />
                  ) : (
                    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{selectedMail.text}</pre>
                  )}
                </div>
              </>
            ) : (
              <div className="mail-empty-state" style={{ height: "100%", justifyContent: "center" }}>
                <Mail size={36} style={{ opacity: 0.4 }} />
                <strong style={{ color: "var(--text)" }}>Select an email to view</strong>
                <p style={{ fontSize: "12px", maxWidth: "260px" }}>
                  Click any message on the left to read full email contents and copy extracted OTPs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
