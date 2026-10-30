import { Keystroke, ProblemKey, WordModel } from "./types";

/**
 * Compute Net WPM: (correctChars / 5) / elapsedMinutes
 */
export function calculateNetWpm(correctChars: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  const minutes = durationSeconds / 60;
  if (minutes <= 0) return 0;
  const wpm = (correctChars / 5) / minutes;
  return Math.max(0, isFinite(wpm) ? wpm : 0);
}

/**
 * Compute Raw WPM: (allTypedChars / 5) / elapsedMinutes
 */
export function calculateRawWpm(allTypedChars: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  const minutes = durationSeconds / 60;
  if (minutes <= 0) return 0;
  const raw = (allTypedChars / 5) / minutes;
  return Math.max(0, isFinite(raw) ? raw : 0);
}

/**
 * Compute Accuracy: (correctKeystrokes / totalKeystrokes) * 100
 * Backspaced mistakes still count towards totalKeystrokes and reduce accuracy.
 */
export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 0;
  const acc = (correctKeystrokes / totalKeystrokes) * 100;
  return Math.min(100, Math.max(0, isFinite(acc) ? acc : 0));
}

/**
 * Consistency: 100 - coefficientOfVariation(perSecondRawWpm) * 100
 * Clamped to 0..100.
 * If all values are identical, variance is 0, consistency is 100.
 */
export function calculateConsistency(perSecondRawWpm: number[]): number {
  if (!perSecondRawWpm || perSecondRawWpm.length < 2) return 100;

  const n = perSecondRawWpm.length;
  const mean = perSecondRawWpm.reduce((sum, v) => sum + v, 0) / n;
  if (mean <= 0) return 100;

  const variance = perSecondRawWpm.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // coefficient of variation

  const consistency = 100 - (cv * 100);
  return Math.min(100, Math.max(0, isFinite(consistency) ? consistency : 100));
}

/**
 * Count correct, incorrect, extra, missed characters across completed / active words.
 */
export function countCharacters(words: WordModel[]): {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  totalCorrectCharsForWpm: number;
  totalTypedCharsForRaw: number;
} {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;
  let totalCorrectCharsForWpm = 0;
  let totalTypedCharsForRaw = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.status === "pending") continue;

    let wordIsCompletelyCorrect = true;
    const targetLen = w.targetClusters.length;
    const typedLen = w.typedClusters.length;

    // Check each character position
    for (let c = 0; c < targetLen; c++) {
      if (c < typedLen) {
        if (w.typedClusters[c] === w.targetClusters[c]) {
          correct++;
        } else {
          incorrect++;
          wordIsCompletelyCorrect = false;
        }
      } else {
        // Not typed
        if (w.status === "completed") {
          missed++; // skipped
          wordIsCompletelyCorrect = false;
        }
      }
    }

    // Extra characters
    if (w.extraClusters.length > 0) {
      extra += w.extraClusters.length;
      wordIsCompletelyCorrect = false;
    }

    totalTypedCharsForRaw += typedLen + w.extraClusters.length;

    // Correct characters for WPM:
    // Characters in correctly typed words, plus 1 space after the word (if completed)
    if (wordIsCompletelyCorrect && typedLen === targetLen) {
      totalCorrectCharsForWpm += targetLen;
      if (w.status === "completed") {
        totalCorrectCharsForWpm += 1; // Count trailing space
        totalTypedCharsForRaw += 1;   // Space typed
      }
    } else {
      // In partially correct active word, count correct characters
      let correctInWord = 0;
      for (let c = 0; c < Math.min(targetLen, typedLen); c++) {
        if (w.typedClusters[c] === w.targetClusters[c]) {
          correctInWord++;
        }
      }
      totalCorrectCharsForWpm += correctInWord;
    }
  }

  return {
    correct,
    incorrect,
    extra,
    missed,
    totalCorrectCharsForWpm,
    totalTypedCharsForRaw,
  };
}

/**
 * Aggregate problem keys from keystroke log:
 * Top 5 expected graphemes with highest error rate (min 2 occurrences).
 */
export function extractProblemKeys(keystrokes: Keystroke[]): ProblemKey[] {
  const map: Record<string, { errors: number; total: number }> = {};

  for (const k of keystrokes) {
    // Only analyze readable graphemes (exclude spaces or control)
    const key = k.expected.trim() || "space";
    if (!map[key]) {
      map[key] = { errors: 0, total: 0 };
    }
    map[key].total++;
    if (!k.correct) {
      map[key].errors++;
    }
  }

  const results: ProblemKey[] = [];
  for (const key of Object.keys(map)) {
    const item = map[key];
    if (item.errors > 0) {
      results.push({
        key,
        errors: item.errors,
        total: item.total,
        errorRate: (item.errors / item.total) * 100,
      });
    }
  }

  // Sort by errors descending, then errorRate descending
  results.sort((a, b) => b.errors - a.errors || b.errorRate - a.errorRate);
  return results.slice(0, 5);
}
