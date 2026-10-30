"use client";

import React, { useState } from "react";
import { TestResult } from "@/lib/typing/types";
import SpeedChart from "./SpeedChart";
import { shareOrDownloadCard, copyShareText } from "./ShareCard";
import {
  RotateCcw,
  Sparkles,
  Share2,
  Copy,
  Check,
  Trophy,
  AlertTriangle,
} from "lucide-react";

interface ResultsViewProps {
  result: TestResult;
  personalBest: number;
  isNewBest: boolean;
  onRestart: () => void;
  onNewText: () => void;
}

export default function ResultsView({
  result,
  personalBest,
  isNewBest,
  onRestart,
  onNewText,
}: ResultsViewProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const handleCopyText = async () => {
    const success = await copyShareText(result);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareImage = async () => {
    setIsSharing(true);
    try {
      await shareOrDownloadCard(result);
    } finally {
      setIsSharing(false);
    }
  };

  const diffFromBest = result.wpm - personalBest;

  return (
    <div className="typing-results-card" aria-live="polite">
      {/* Screen Reader Announcement */}
      <div className="sr-only">
        Typing test completed. Your net speed is {Math.round(result.wpm)} words per minute with {Math.round(result.accuracy)} percent accuracy.
      </div>

      {/* Top Banner: Personal Best or Score Status */}
      <div className="results-hero-banner">
        {isNewBest ? (
          <div className="pb-banner new-best">
            <Trophy size={18} className="trophy-gold" />
            <span>🎉 New Personal Best! You beat your record by {Math.abs(Math.round(diffFromBest))} WPM!</span>
          </div>
        ) : personalBest > 0 ? (
          <div className="pb-banner current-best">
            <Trophy size={16} />
            <span>
              Personal Best: <strong>{Math.round(personalBest)} WPM</strong> ({Math.abs(Math.round(diffFromBest))} WPM below best)
            </span>
          </div>
        ) : null}
      </div>

      {/* Primary Big Metrics Row */}
      <div className="results-hero-grid">
        <div className="metric-card primary">
          <span className="metric-tag">NET WPM</span>
          <span className="metric-hero">{Math.round(result.wpm)}</span>
          <span className="metric-sub">{result.wpm.toFixed(1)} exact</span>
        </div>

        <div className="metric-card">
          <span className="metric-tag">ACCURACY</span>
          <span className="metric-hero accent-green">
            {Math.round(result.accuracy)}%
          </span>
          <span className="metric-sub">{result.accuracy.toFixed(1)}% exact</span>
        </div>

        <div className="metric-card">
          <span className="metric-tag">RAW WPM</span>
          <span className="metric-hero accent-amber">
            {Math.round(result.rawWpm)}
          </span>
          <span className="metric-sub">{result.rawWpm.toFixed(1)} raw</span>
        </div>

        <div className="metric-card">
          <span className="metric-tag">CONSISTENCY</span>
          <span className="metric-hero accent-purple">
            {Math.round(result.consistency)}%
          </span>
          <span className="metric-sub">{result.consistency.toFixed(1)}%</span>
        </div>
      </div>

      {/* Detailed Diagnostics: Characters Breakdown & Test Info */}
      <div className="results-details-row">
        <div className="details-chip">
          <span className="chip-label">Test Mode:</span>
          <strong>{result.mode} • {result.duration}s</strong>
        </div>
        <div className="details-chip">
          <span className="chip-label">Language:</span>
          <strong>{result.lang.toUpperCase()}</strong>
        </div>
        <div className="details-chip">
          <span className="chip-label">Characters:</span>
          <span className="chars-stat correct" title="Correct">
            {result.chars.correct}
          </span>
          /
          <span className="chars-stat incorrect" title="Incorrect">
            {result.chars.incorrect}
          </span>
          /
          <span className="chars-stat extra" title="Extra">
            {result.chars.extra}
          </span>
          /
          <span className="chars-stat missed" title="Missed">
            {result.chars.missed}
          </span>
        </div>
      </div>

      {/* Interactive Per-Second WPM Chart */}
      <div className="results-chart-section">
        <h4 className="section-title">Speed Progression (WPM / sec)</h4>
        <SpeedChart data={result.perSecond} />
      </div>

      {/* Problem Keys Section */}
      {result.problemKeys && result.problemKeys.length > 0 && (
        <div className="problem-keys-section">
          <div className="problem-keys-header">
            <AlertTriangle size={15} color="#f59e0b" />
            <span>Problem Keys (keys with highest error rate)</span>
          </div>
          <div className="problem-keys-list">
            {result.problemKeys.map((pk) => (
              <div key={pk.key} className="problem-key-pill">
                <kbd className="problem-key-badge">{pk.key}</kbd>
                <span className="problem-key-rate">
                  {Math.round(pk.errorRate)}% error ({pk.errors}/{pk.total})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="results-actions-bar">
        <button
          type="button"
          className="result-btn primary"
          onClick={onRestart}
          title="Restart same test (Tab + Enter or Esc)"
        >
          <RotateCcw size={16} />
          <span>Restart</span>
          <kbd className="btn-kbd">Tab</kbd>
        </button>

        <button
          type="button"
          className="result-btn"
          onClick={onNewText}
          title="Generate fresh new text (Ctrl + Enter)"
        >
          <Sparkles size={16} />
          <span>New Text</span>
          <kbd className="btn-kbd">Ctrl+↵</kbd>
        </button>

        <button
          type="button"
          className="result-btn accent"
          onClick={handleShareImage}
          disabled={isSharing}
          title="Export 1080x1350 HD PNG Certificate"
        >
          <Share2 size={16} />
          <span>{isSharing ? "Generating..." : "Share Certificate"}</span>
        </button>

        <button
          type="button"
          className="result-btn subtle"
          onClick={handleCopyText}
          title="Copy result text to clipboard"
        >
          {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
          <span>{copied ? "Copied!" : "Copy Result"}</span>
        </button>
      </div>
    </div>
  );
}
