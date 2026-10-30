"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TypingSettings,
  EngineState,
  TestResult,
  PerSecondStat,
} from "@/lib/typing/types";
import {
  initEngine,
  typeCharacter,
  handleSpace,
  handleBackspace,
  handleCtrlBackspace,
} from "@/lib/typing/engine";
import {
  calculateNetWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
  countCharacters,
  extractProblemKeys,
} from "@/lib/typing/metrics";
import {
  generateWordList,
  generateDailyWords,
  sanitizeCustomText,
  getLocalDateString,
} from "@/lib/typing/textGen";
import { loadWordsForLanguage } from "@/lib/typing/textLoader";
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveResultToHistory,
  getPersonalBest,
  updateDailyStreak,
  clearHistory,
  isLocalStorageAvailable,
} from "@/lib/typing/storage";
import { playKeySound } from "@/lib/typing/audio";

import SettingsBar from "./typing/SettingsBar";
import LiveStats from "./typing/LiveStats";
import TypingArea from "./typing/TypingArea";
import ResultsView from "./typing/ResultsView";
import HistoryPanel from "./typing/HistoryPanel";

import {
  Keyboard,
  History,
  AlertCircle,
  X,
  RotateCcw,
} from "lucide-react";

export default function TypingTestTool() {
  const [settings, setSettings] = useState<TypingSettings>(() => loadSettings());
  const [engineState, setEngineState] = useState<EngineState | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>(() => loadHistory());
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [tabInvalidated, setTabInvalidated] = useState<boolean>(false);
  const [storageWarning] = useState<boolean>(() => !isLocalStorageAvailable());

  // Custom text modal state
  const [customModalOpen, setCustomModalOpen] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>("");
  const [customError, setCustomError] = useState<string>("");

  // Live timer & WPM ticker state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);

  // Daily challenge streak
  const [dailyStreak] = useState<number>(() => {
    const today = getLocalDateString();
    return updateDailyStreak(today).count;
  });
  const [dailyBest, setDailyBest] = useState<number>(() => getPersonalBest("daily", "en", 40));

  // Per-second speed progression tracking
  const perSecondStatsRef = useRef<PerSecondStat[]>([]);
  const lastRecordedSecRef = useRef<number>(0);
  const rawWpmHistoryRef = useRef<number[]>([]);
  const timerFrameRef = useRef<number | null>(null);

  // Cache source words per language
  const wordsCacheRef = useRef<Record<string, string[]>>({});

  // 2. Setup text and initialize test engine
  const setupNewTest = useCallback(
    async (currentSettings: TypingSettings) => {
      setResult(null);
      setTabInvalidated(false);
      perSecondStatsRef.current = [];
      lastRecordedSecRef.current = 0;
      rawWpmHistoryRef.current = [];
      setTimeLeft(currentSettings.time);
      setLiveWpm(0);
      setLiveAccuracy(100);

      let words: string[] = [];

      if (currentSettings.mode === "daily") {
        // Daily challenge uses English words seeded by today's date
        let enList = wordsCacheRef.current["en"];
        if (!enList) {
          enList = await loadWordsForLanguage("en");
          wordsCacheRef.current["en"] = enList;
        }
        words = generateDailyWords(enList, getLocalDateString(), 40);
      } else if (currentSettings.mode === "custom") {
        const cleaned = sanitizeCustomText(customInputText);
        if (cleaned.length === 0) {
          words = ["Type", "your", "custom", "words", "here", "to", "practice", "speed."];
        } else {
          words = cleaned;
        }
      } else {
        // Standard mode: Time or Words
        const lang = currentSettings.lang;
        let sourceList = wordsCacheRef.current[lang];
        if (!sourceList) {
          sourceList = await loadWordsForLanguage(lang);
          wordsCacheRef.current[lang] = sourceList;
        }

        // Section 4: Time mode generates long buffer (200 words)
        const count = currentSettings.mode === "time" ? 200 : currentSettings.words;
        words = generateWordList(sourceList, count, Math.random, {
          punctuation: currentSettings.punctuation,
          numbers: currentSettings.numbers,
        });
      }

      const initialEngine = initEngine(words, currentSettings.lang);
      setEngineState(initialEngine);
    },
    [customInputText]
  );

  // Initialize test whenever settings mode/lang changes
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        setupNewTest(settings);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [settings, setupNewTest]);

  // Save settings when updated
  const handleUpdateSettings = (updates: Partial<TypingSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  };

  // 3. Tab visibility check (Section 5.5: invalidate test if user switches tabs mid-test)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && engineState?.isStarted && !engineState?.isFinished) {
        setTabInvalidated(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [engineState?.isStarted, engineState?.isFinished]);

  // 4. Conclude test & compute results
  const finalizeTest = useCallback(
    (finalEngine: EngineState, durationSec: number) => {
      const charCounts = countCharacters(finalEngine.words);
      const netWpm = calculateNetWpm(charCounts.totalCorrectCharsForWpm, durationSec);
      const rawWpm = calculateRawWpm(charCounts.totalTypedCharsForRaw, durationSec);
      const accuracy = calculateAccuracy(finalEngine.correctKeystrokes, finalEngine.totalKeystrokes);
      const consistency = calculateConsistency(rawWpmHistoryRef.current);
      const problemKeys = extractProblemKeys(finalEngine.keystrokes);

      const testRes: TestResult = {
        id: `test-${Date.now()}`,
        date: new Date().toISOString(),
        mode: settings.mode,
        lang: settings.lang,
        duration: durationSec,
        wpm: netWpm,
        rawWpm,
        accuracy,
        consistency,
        chars: {
          correct: charCounts.correct,
          incorrect: charCounts.incorrect,
          extra: charCounts.extra,
          missed: charCounts.missed,
        },
        perSecond: [...perSecondStatsRef.current],
        problemKeys,
      };

      const { history: newHistory, isNewBest: newPb } = saveResultToHistory(testRes);
      setHistory(newHistory);
      setIsNewBest(newPb);
      setResult(testRes);
      setEngineState((prev) => (prev ? { ...prev, isFinished: true } : null));

      if (settings.mode === "daily") {
        setDailyBest((prev) => Math.max(prev, netWpm));
      }
    },
    [settings.mode, settings.lang]
  );

  // 5. Timer loop using performance.now()
  useEffect(() => {
    if (!engineState?.isStarted || engineState?.isFinished || tabInvalidated) {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
      }
      return;
    }

    const startTime = engineState.startTime || performance.now();
    const targetDuration = settings.time;

    const tick = () => {
      const now = performance.now();
      const elapsedMs = now - startTime;
      const elapsedSec = Math.floor(elapsedMs / 1000);

      // Section 5.5: In time mode, end exactly at target duration
      if (settings.mode === "time") {
        const remaining = Math.max(0, targetDuration - elapsedSec);
        setTimeLeft(remaining);

        if (elapsedSec >= targetDuration) {
          finalizeTest(engineState, targetDuration);
          return;
        }
      }

      // Record per-second stats at each full second boundary
      if (elapsedSec > lastRecordedSecRef.current && elapsedSec > 0) {
        lastRecordedSecRef.current = elapsedSec;
        const charCounts = countCharacters(engineState.words);
        const curNet = calculateNetWpm(charCounts.totalCorrectCharsForWpm, elapsedSec);
        const curRaw = calculateRawWpm(charCounts.totalTypedCharsForRaw, elapsedSec);

        rawWpmHistoryRef.current.push(curRaw);
        perSecondStatsRef.current.push({
          sec: elapsedSec,
          wpm: curNet,
          raw: curRaw,
          errors: engineState.errorCount,
        });

        // Smooth live display after 2 seconds
        if (elapsedSec >= 2) {
          setLiveWpm(curNet);
          setLiveAccuracy(
            calculateAccuracy(engineState.correctKeystrokes, engineState.totalKeystrokes)
          );
        }
      }

      timerFrameRef.current = requestAnimationFrame(tick);
    };

    timerFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);
    };
  }, [
    engineState,
    settings.mode,
    settings.time,
    tabInvalidated,
    finalizeTest,
  ]);

  // 6. Check if word mode completed
  useEffect(() => {
    if (
      engineState?.isFinished &&
      !result &&
      engineState?.startTime &&
      settings.mode !== "time"
    ) {
      const elapsedSec = Math.max(
        1,
        Math.round((performance.now() - engineState.startTime) / 1000)
      );
      finalizeTest(engineState, elapsedSec);
    }
  }, [engineState, result, settings.mode, finalizeTest]);

  // Append more words in time mode when nearing the end
  useEffect(() => {
    if (
      settings.mode === "time" &&
      engineState &&
      engineState.words.length - engineState.currentWordIndex < 30
    ) {
      const lang = settings.lang;
      const sourceList = wordsCacheRef.current[lang];
      if (sourceList && sourceList.length > 0) {
        const moreWords = generateWordList(sourceList, 50, Math.random, {
          punctuation: settings.punctuation,
          numbers: settings.numbers,
        });
        const moreEngineWords = initEngine(moreWords, lang).words.map((w, i) => ({
          ...w,
          id: engineState.words.length + i,
          status: "pending" as const,
        }));
        setEngineState((prev) =>
          prev ? { ...prev, words: [...prev.words, ...moreEngineWords] } : null
        );
      }
    }
  }, [engineState, settings.mode, settings.lang, settings.punctuation, settings.numbers]);

  // 7. Keystroke actions
  const handleCharacter = (char: string) => {
    if (!engineState || engineState.isFinished || tabInvalidated) return;
    const now = performance.now();
    const updated = typeCharacter(engineState, char, now, settings.stopOnError);
    setEngineState(updated);

    if (settings.sound) {
      const currentWord = updated.words[updated.currentWordIndex];
      const isMismatch =
        currentWord &&
        currentWord.typedClusters.length > 0 &&
        currentWord.typedClusters[currentWord.typedClusters.length - 1] !==
          currentWord.targetClusters[currentWord.typedClusters.length - 1];
      playKeySound(Boolean(isMismatch));
    }
  };

  const handleSpaceAction = () => {
    if (!engineState || engineState.isFinished || tabInvalidated) return;
    const now = performance.now();
    const updated = handleSpace(engineState, now);
    setEngineState(updated);

    if (settings.sound) {
      playKeySound(false);
    }
  };

  const handleBackspaceAction = () => {
    if (!engineState || engineState.isFinished || tabInvalidated) return;
    const updated = handleBackspace(engineState);
    setEngineState(updated);

    if (settings.sound) {
      playKeySound(false);
    }
  };

  const handleCtrlBackspaceAction = () => {
    if (!engineState || engineState.isFinished || tabInvalidated) return;
    const updated = handleCtrlBackspace(engineState);
    setEngineState(updated);
  };

  const pbForCurrentMode = getPersonalBest(
    settings.mode,
    settings.lang,
    settings.mode === "time" ? settings.time : settings.words
  );

  return (
    <div className="typing-test-container">
      {/* Top Banner Notice: Private Storage */}
      {storageWarning && (
        <div className="storage-warning-bar">
          <AlertCircle size={15} />
          <span>Local storage is unavailable. Your test results will not be saved after page reload.</span>
        </div>
      )}

      {/* Main Header Row */}
      <div className="typing-header-row">
        <div className="title-group">
          <div className="title-icon-badge">
            <Keyboard size={20} />
          </div>
          <div>
            <h1 className="typing-title">Typing Speed Test</h1>
            <p className="typing-subtitle">
              Distraction-free typing test with accurate live WPM, consistency, and English, Hindi & Gujarati scripts.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className={`tool-action-btn ${showHistory ? "active" : ""}`}
            onClick={() => setShowHistory((v) => !v)}
            title="View personal typing history & bests"
          >
            <History size={16} />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <SettingsBar
        settings={settings}
        onUpdate={handleUpdateSettings}
        disabled={Boolean(engineState?.isStarted && !engineState?.isFinished && !result)}
        onOpenCustomTextModal={() => setCustomModalOpen(true)}
        dailyStreak={dailyStreak}
        dailyBest={dailyBest}
      />

      {/* Main Workspace Area: Test or Results */}
      <div className="typing-workspace-card">
        {/* Invalidation Banner if user switched tabs mid-test */}
        {tabInvalidated && (
          <div className="tab-invalidated-overlay">
            <AlertCircle size={32} color="#f59e0b" />
            <h3>Test Invalidated</h3>
            <p>You navigated away or switched tabs while typing. To keep results fair and accurate, tests are reset on tab change.</p>
            <button
              type="button"
              className="result-btn primary"
              onClick={() => setupNewTest(settings)}
            >
              <RotateCcw size={16} />
              <span>Restart Test</span>
            </button>
          </div>
        )}

        {result ? (
          /* Results Screen */
          <ResultsView
            result={result}
            personalBest={pbForCurrentMode}
            isNewBest={isNewBest}
            onRestart={() => setupNewTest(settings)}
            onNewText={() => setupNewTest(settings)}
          />
        ) : engineState ? (
          /* Live Test Area */
          <div className="live-typing-section">
            <LiveStats
              mode={settings.mode}
              lang={settings.lang}
              timeLeft={timeLeft}
              completedWords={engineState.currentWordIndex}
              totalWords={engineState.words.length}
              liveWpm={liveWpm}
              liveAccuracy={liveAccuracy}
              isStarted={engineState.isStarted}
            />

            <TypingArea
              words={engineState.words}
              currentWordIndex={engineState.currentWordIndex}
              fontSize={settings.fontSize}
              caretStyle={settings.caret}
              lang={settings.lang}
              isStarted={engineState.isStarted}
              isFinished={engineState.isFinished}
              onCharacter={handleCharacter}
              onSpace={handleSpaceAction}
              onBackspace={handleBackspaceAction}
              onCtrlBackspace={handleCtrlBackspaceAction}
              onRestart={() => setupNewTest(settings)}
              onNewText={() => setupNewTest(settings)}
            />

            {/* Quick Keyboard Shortcuts Footer */}
            <div className="typing-shortcuts-hint">
              <span><kbd>Tab</kbd> or <kbd>Esc</kbd> to restart</span>
              <span>•</span>
              <span><kbd>Ctrl</kbd> + <kbd>↵</kbd> for new text</span>
              <span>•</span>
              <span><kbd>Ctrl</kbd> + <kbd>Backspace</kbd> to delete word</span>
            </div>
          </div>
        ) : (
          <div className="loading-typing-box">
            <span>Loading typing dictionary...</span>
          </div>
        )}
      </div>

      {/* History Slide-down Drawer / Modal */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onClearHistory={() => {
            clearHistory();
            setHistory([]);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Custom Text Modal */}
      {customModalOpen && (
        <div className="modal-backdrop" onClick={() => setCustomModalOpen(false)}>
          <div className="search-modal custom-text-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Custom Typing Text</h3>
              <button
                type="button"
                className="subtle-icon"
                onClick={() => setCustomModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <p className="modal-subtext">
              Paste your own text to practice (up to 2,000 characters). Whitespace will be normalized.
            </p>

            <textarea
              className="custom-text-area"
              value={customInputText}
              onChange={(e) => {
                setCustomInputText(e.target.value);
                setCustomError("");
              }}
              placeholder="Paste or type any paragraph here to practice..."
              rows={6}
              maxLength={2000}
            />

            <div className="custom-text-footer">
              <span className="char-count">{customInputText.length}/2000 chars</span>
              {customError && <span className="modal-error">{customError}</span>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setCustomModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const cleaned = sanitizeCustomText(customInputText);
                    if (cleaned.length === 0) {
                      setCustomError("Please enter valid text (at least one word).");
                      return;
                    }
                    setCustomModalOpen(false);
                    handleUpdateSettings({ mode: "custom" });
                    setupNewTest({ ...settings, mode: "custom" });
                  }}
                >
                  Apply & Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
