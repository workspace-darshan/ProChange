import { TestResult, TypingSettings } from "./types";

export const SETTINGS_KEY = "prochange_typing_settings";
export const HISTORY_KEY = "prochange_typing_history";
export const BEST_KEY = "prochange_typing_best";
export const STREAK_KEY = "prochange_typing_streak";

export const DEFAULT_SETTINGS: TypingSettings = {
  mode: "time",
  time: 30,
  words: 25,
  lang: "en",
  punctuation: false,
  numbers: false,
  fontSize: "m",
  caret: "line",
  stopOnError: false,
  sound: false,
};

export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const testKey = "__prochange_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadSettings(): TypingSettings {
  try {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: TypingSettings): boolean {
  try {
    if (typeof window === "undefined") return false;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function loadHistory(): TestResult[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveResultToHistory(result: TestResult): { history: TestResult[]; isNewBest: boolean } {
  try {
    if (typeof window === "undefined") return { history: [result], isNewBest: false };

    const currentHistory = loadHistory();
    // Prepend new result, trim to 50
    const updatedHistory = [result, ...currentHistory].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    // Update Personal Best
    const bestKey = `${result.mode}|${result.lang}|${result.duration}`;
    const bestsRaw = localStorage.getItem(BEST_KEY);
    const bests: Record<string, number> = bestsRaw ? JSON.parse(bestsRaw) : {};
    const previousBest = bests[bestKey] || 0;
    const isNewBest = result.wpm > previousBest;

    if (isNewBest) {
      bests[bestKey] = result.wpm;
      localStorage.setItem(BEST_KEY, JSON.stringify(bests));
    }

    return { history: updatedHistory, isNewBest };
  } catch {
    return { history: [result], isNewBest: false };
  }
}

export function getPersonalBest(mode: string, lang: string, duration: number): number {
  try {
    if (typeof window === "undefined") return 0;
    const bestKey = `${mode}|${lang}|${duration}`;
    const bestsRaw = localStorage.getItem(BEST_KEY);
    if (!bestsRaw) return 0;
    const bests = JSON.parse(bestsRaw);
    return typeof bests[bestKey] === "number" ? bests[bestKey] : 0;
  } catch {
    return 0;
  }
}

export type StreakData = {
  lastDate: string;
  count: number;
};

export function updateDailyStreak(todayDateStr: string): StreakData {
  try {
    if (typeof window === "undefined") return { lastDate: todayDateStr, count: 1 };
    const raw = localStorage.getItem(STREAK_KEY);
    const streak: StreakData = raw ? JSON.parse(raw) : { lastDate: "", count: 0 };

    if (streak.lastDate === todayDateStr) {
      return streak; // Already played today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (streak.lastDate === yStr) {
      streak.count += 1;
    } else {
      streak.count = 1;
    }
    streak.lastDate = todayDateStr;
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    return streak;
  } catch {
    return { lastDate: todayDateStr, count: 1 };
  }
}

export function clearHistory(): boolean {
  try {
    if (typeof window === "undefined") return false;
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(BEST_KEY);
    return true;
  } catch {
    return false;
  }
}
