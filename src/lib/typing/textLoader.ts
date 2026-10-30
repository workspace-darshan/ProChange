import { TypingLang } from "./types";

/**
 * Lazy-load word datasets per language to keep initial bundle tiny.
 */
export async function loadWordsForLanguage(lang: TypingLang): Promise<string[]> {
  switch (lang) {
    case "hi": {
      const mod = await import("@/data/typing/hi-words");
      return mod.hindiWords;
    }
    case "gu": {
      const mod = await import("@/data/typing/gu-words");
      return mod.gujaratiWords;
    }
    case "en":
    default: {
      const mod = await import("@/data/typing/en-words");
      return mod.englishWords;
    }
  }
}

/**
 * Lazy-load English sentences for sentence mode.
 */
export async function loadSentences(): Promise<string[]> {
  const mod = await import("@/data/typing/en-sentences");
  return mod.englishSentences;
}
