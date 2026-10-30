"use client";

import React from "react";
import { TypingLang, TypingMode } from "@/lib/typing/types";

interface LiveStatsProps {
  mode: TypingMode;
  lang: TypingLang;
  timeLeft: number;
  completedWords: number;
  totalWords: number;
  liveWpm: number;
  liveAccuracy: number;
  isStarted: boolean;
}

export default function LiveStats({
  mode,
  lang,
  timeLeft,
  completedWords,
  totalWords,
  liveWpm,
  liveAccuracy,
  isStarted,
}: LiveStatsProps) {
  return (
    <div className="live-stats-bar" aria-live="off">
      <div className="live-stat-item primary">
        <span className="live-stat-label">
          {mode === "time" ? "TIME LEFT" : "PROGRESS"}
        </span>
        <span className="live-stat-val primary">
          {mode === "time" ? `${Math.max(0, timeLeft)}s` : `${completedWords}/${totalWords}`}
        </span>
      </div>

      <div className="live-stat-item">
        <span className="live-stat-label">LIVE WPM</span>
        <span className="live-stat-val">
          {isStarted ? Math.round(liveWpm) : "—"}
        </span>
      </div>

      <div className="live-stat-item">
        <span className="live-stat-label">ACCURACY</span>
        <span className="live-stat-val">
          {isStarted ? `${Math.round(liveAccuracy)}%` : "100%"}
        </span>
      </div>

      {lang !== "en" && (
        <div className="indic-disclaimer-pill" title="Indic script speed is based on 5 graphemes = 1 word approximation.">
          <span className="dot" />
          <span>Approximate speed ({lang.toUpperCase()})</span>
        </div>
      )}
    </div>
  );
}
