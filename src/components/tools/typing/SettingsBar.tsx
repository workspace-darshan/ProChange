"use client";

import React from "react";
import {
  TypingSettings,
  TypingMode,
  TypingLang,
  CaretStyle,
  FontSize,
} from "@/lib/typing/types";
import {
  Clock,
  FileText,
  Edit3,
  Calendar,
  Volume2,
  VolumeX,
  Type,
  ShieldAlert,
  Flame,
} from "lucide-react";

interface SettingsBarProps {
  settings: TypingSettings;
  onUpdate: (updates: Partial<TypingSettings>) => void;
  disabled?: boolean;
  onOpenCustomTextModal: () => void;
  dailyStreak: number;
  dailyBest: number;
}

export default function SettingsBar({
  settings,
  onUpdate,
  disabled = false,
  onOpenCustomTextModal,
  dailyStreak,
  dailyBest,
}: SettingsBarProps) {
  const modes: { id: TypingMode; label: string; icon: React.ReactNode }[] = [
    { id: "time", label: "Time", icon: <Clock size={13} /> },
    { id: "words", label: "Words", icon: <FileText size={13} /> },
    { id: "custom", label: "Custom", icon: <Edit3 size={13} /> },
    { id: "daily", label: "Daily Challenge", icon: <Calendar size={13} /> },
  ];

  const times: (15 | 30 | 60 | 120)[] = [15, 30, 60, 120];
  const wordsCounts: (10 | 25 | 50 | 100)[] = [10, 25, 50, 100];
  const languages: { id: TypingLang; label: string }[] = [
    { id: "en", label: "English" },
    { id: "hi", label: "हिन्दी (Hindi)" },
    { id: "gu", label: "ગુજરાતી (Gujarati)" },
  ];
  const fontSizes: { id: FontSize; label: string }[] = [
    { id: "s", label: "S" },
    { id: "m", label: "M" },
    { id: "l", label: "L" },
    { id: "xl", label: "XL" },
  ];
  const carets: { id: CaretStyle; label: string }[] = [
    { id: "line", label: "|" },
    { id: "block", label: "█" },
    { id: "underline", label: "_" },
  ];

  return (
    <div className="typing-settings-bar">
      {/* Primary Mode Selector */}
      <div className="settings-group">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`pill-btn ${settings.mode === m.id ? "active" : ""}`}
            onClick={() => {
              if (m.id === "custom") {
                onOpenCustomTextModal();
              }
              onUpdate({ mode: m.id });
            }}
            disabled={disabled}
            title={m.label}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-separator" />

      {/* Mode Specific Sub-options */}
      {settings.mode === "time" && (
        <div className="settings-group">
          {times.map((t) => (
            <button
              key={t}
              type="button"
              className={`pill-btn sub ${settings.time === t ? "active" : ""}`}
              onClick={() => onUpdate({ time: t })}
              disabled={disabled}
            >
              {t}s
            </button>
          ))}
        </div>
      )}

      {settings.mode === "words" && (
        <div className="settings-group">
          {wordsCounts.map((w) => (
            <button
              key={w}
              type="button"
              className={`pill-btn sub ${settings.words === w ? "active" : ""}`}
              onClick={() => onUpdate({ words: w })}
              disabled={disabled}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {settings.mode === "custom" && (
        <div className="settings-group">
          <button
            type="button"
            className="pill-btn sub active"
            onClick={onOpenCustomTextModal}
            disabled={disabled}
          >
            Edit Custom Text
          </button>
        </div>
      )}

      {settings.mode === "daily" && (
        <div className="daily-stats-pill">
          <span className="streak-badge" title="Daily challenge streak">
            <Flame size={12} color="#f97316" /> {dailyStreak} Day Streak
          </span>
          {dailyBest > 0 && (
            <span className="daily-best-tag">
              Today&apos;s Best: <strong>{Math.round(dailyBest)} WPM</strong>
            </span>
          )}
        </div>
      )}

      <div className="settings-separator" />

      {/* Language Selector */}
      <div className="settings-group">
        {languages.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`pill-btn ${settings.lang === l.id ? "active" : ""}`}
            onClick={() => onUpdate({ lang: l.id })}
            disabled={disabled}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="settings-separator" />

      {/* English Specific Options: Punctuation & Numbers */}
      {settings.lang === "en" && settings.mode !== "custom" && (
        <>
          <div className="settings-group">
            <button
              type="button"
              className={`pill-btn icon-only ${settings.punctuation ? "active" : ""}`}
              onClick={() => onUpdate({ punctuation: !settings.punctuation })}
              disabled={disabled}
              title="Toggle Punctuation"
            >
              @ punc
            </button>
            <button
              type="button"
              className={`pill-btn icon-only ${settings.numbers ? "active" : ""}`}
              onClick={() => onUpdate({ numbers: !settings.numbers })}
              disabled={disabled}
              title="Toggle Numbers"
            >
              # 123
            </button>
          </div>
          <div className="settings-separator" />
        </>
      )}

      {/* Font Size & Caret Style */}
      <div className="settings-group">
        <span className="setting-label" title="Font size">
          <Type size={12} />
        </span>
        {fontSizes.map((fs) => (
          <button
            key={fs.id}
            type="button"
            className={`pill-btn mini ${settings.fontSize === fs.id ? "active" : ""}`}
            onClick={() => onUpdate({ fontSize: fs.id })}
            title={`Font size ${fs.label}`}
          >
            {fs.label}
          </button>
        ))}
      </div>

      <div className="settings-group">
        {carets.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`pill-btn mini ${settings.caret === c.id ? "active" : ""}`}
            onClick={() => onUpdate({ caret: c.id })}
            title={`Caret: ${c.id}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="settings-separator" />

      {/* Stop on error & Sound */}
      <div className="settings-group">
        <button
          type="button"
          className={`pill-btn icon-only ${settings.stopOnError ? "active" : ""}`}
          onClick={() => onUpdate({ stopOnError: !settings.stopOnError })}
          title={settings.stopOnError ? "Stop on error: Active" : "Stop on error: Off"}
        >
          <ShieldAlert size={12} />
          <span>Stop</span>
        </button>

        <button
          type="button"
          className={`pill-btn icon-only ${settings.sound ? "active" : ""}`}
          onClick={() => onUpdate({ sound: !settings.sound })}
          title={settings.sound ? "Sound: On" : "Sound: Muted"}
        >
          {settings.sound ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>
    </div>
  );
}
