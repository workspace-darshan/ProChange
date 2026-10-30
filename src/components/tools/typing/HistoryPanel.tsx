"use client";

import React, { useState } from "react";
import { TestResult } from "@/lib/typing/types";
import {
  History,
  Trash2,
  Download,
  Trophy,
  TrendingUp,
  X,
} from "lucide-react";

interface HistoryPanelProps {
  history: TestResult[];
  onClearHistory: () => void;
  onClose?: () => void;
}

export default function HistoryPanel({
  history,
  onClearHistory,
  onClose,
}: HistoryPanelProps) {
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  // Export results as JSON file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prochange-typing-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Compute best scores
  const bestWpm = history.reduce((max, r) => Math.max(max, r.wpm), 0);
  const avgWpm =
    history.length > 0
      ? Math.round(history.reduce((sum, r) => sum + r.wpm, 0) / history.length)
      : 0;
  const avgAccuracy =
    history.length > 0
      ? Math.round(history.reduce((sum, r) => sum + r.accuracy, 0) / history.length)
      : 0;

  // Last 20 tests for trend chart
  const recentTests = history.slice(0, 20).reverse();

  return (
    <div className="typing-history-panel">
      {/* Panel Header */}
      <div className="history-header">
        <div className="history-title-group">
          <History size={18} className="accent-icon" />
          <h3>Typing History & Personal Bests</h3>
          <span className="history-count-badge">{history.length} tests</span>
        </div>

        <div className="history-actions">
          {history.length > 0 && (
            <>
              <button
                type="button"
                className="icon-subtle-btn"
                onClick={handleExportJson}
                title="Export test history as JSON"
              >
                <Download size={15} />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                className="icon-subtle-btn danger"
                onClick={() => setShowConfirmClear(true)}
                title="Clear all test history"
              >
                <Trash2 size={15} />
                <span>Clear</span>
              </button>
            </>
          )}

          {onClose && (
            <button
              type="button"
              className="icon-subtle-btn"
              onClick={onClose}
              aria-label="Close history"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmClear && (
        <div className="modal-backdrop-mini">
          <div className="confirm-card">
            <h4>Clear Typing History?</h4>
            <p>This will permanently erase all saved test records and personal bests from this device.</p>
            <div className="confirm-btns">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onClearHistory();
                  setShowConfirmClear(false);
                }}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats Cards */}
      {history.length > 0 && (
        <div className="history-summary-grid">
          <div className="summary-card">
            <Trophy size={16} className="trophy-gold" />
            <div className="summary-info">
              <span className="summary-label">ALL-TIME BEST</span>
              <strong className="summary-val">{Math.round(bestWpm)} WPM</strong>
            </div>
          </div>

          <div className="summary-card">
            <TrendingUp size={16} color="#38bdf8" />
            <div className="summary-info">
              <span className="summary-label">AVERAGE SPEED</span>
              <strong className="summary-val">{avgWpm} WPM</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-info">
              <span className="summary-label">AVG ACCURACY</span>
              <strong className="summary-val accent-green">{avgAccuracy}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* Mini Trend Line Chart for last 20 tests */}
      {recentTests.length >= 2 && (
        <div className="trend-chart-wrapper">
          <div className="trend-chart-label">WPM Trend (Last {recentTests.length} tests)</div>
          <svg viewBox="0 0 400 70" className="trend-svg" preserveAspectRatio="none">
            {(() => {
              const max = Math.max(...recentTests.map((t) => t.wpm), 50);
              const min = Math.max(0, Math.min(...recentTests.map((t) => t.wpm)) - 10);
              const range = max - min || 1;
              const points = recentTests
                .map((t, idx) => {
                  const x = (idx / (recentTests.length - 1)) * 390 + 5;
                  const y = 60 - ((t.wpm - min) / range) * 50;
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <>
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {recentTests.map((t, idx) => {
                    const x = (idx / (recentTests.length - 1)) * 390 + 5;
                    const y = 60 - ((t.wpm - min) / range) * 50;
                    return (
                      <circle
                        key={t.id}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#38bdf8"
                        stroke="#0f172a"
                        strokeWidth="1"
                      >
                        <title>{`${Math.round(t.wpm)} WPM (${new Date(t.date).toLocaleDateString()})`}</title>
                      </circle>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* History Table */}
      {history.length > 0 ? (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Lang</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Consistency</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="date-cell">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <span className="mode-tag">{item.mode} ({item.duration}s)</span>
                  </td>
                  <td>
                    <span className="lang-tag">{item.lang.toUpperCase()}</span>
                  </td>
                  <td className="wpm-cell">
                    <strong>{Math.round(item.wpm)}</strong>
                  </td>
                  <td className="accuracy-cell">{Math.round(item.accuracy)}%</td>
                  <td>{Math.round(item.consistency)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-history-message">
          <p>No typing tests completed yet.</p>
          <small>Take your first test above to start tracking your typing speed and consistency.</small>
        </div>
      )}
    </div>
  );
}
