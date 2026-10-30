/**
 * 32-bit hash function for strings
 */
export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 PRNG - fast, high quality 32-bit seeded PRNG
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Get date string in user's local timezone (YYYY-MM-DD)
 */
export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Sanitize custom text:
 * - Max 2,000 characters
 * - Strip leading/trailing whitespace
 * - Collapse repeated whitespace into single space
 * - Replace curly quotes and smart dashes with plain ASCII equivalents
 */
export function sanitizeCustomText(text: string): string[] {
  if (!text || typeof text !== "string") return [];

  const cleaned = text
    .slice(0, 2000)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];
  return cleaned.split(" ").filter((w) => w.length > 0);
}

/**
 * Pick words using a PRNG function.
 * Ensures no two consecutive identical words.
 */
export function generateWordList(
  sourceWords: string[],
  count: number,
  prng: () => number = Math.random,
  options?: { punctuation?: boolean; numbers?: boolean }
): string[] {
  if (!sourceWords || sourceWords.length === 0) return [];

  const result: string[] = [];
  let prevWord = "";

  for (let i = 0; i < count; i++) {
    // Pick word not matching prevWord
    let attempts = 0;
    let word = "";
    do {
      const idx = Math.floor(prng() * sourceWords.length);
      word = sourceWords[idx];
      attempts++;
    } while (word === prevWord && attempts < 10);

    // Optional numbers injection (English)
    if (options?.numbers && prng() < 0.1) {
      word = String(Math.floor(prng() * 900 + 10));
    }

    // Optional punctuation injection (English)
    if (options?.punctuation) {
      if (i === 0 || result[i - 1]?.endsWith(".")) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (prng() < 0.15) {
        const marks = [",", ".", "!", "?", ";"];
        const punc = marks[Math.floor(prng() * marks.length)];
        word += punc;
      }
    }

    result.push(word);
    prevWord = word;
  }

  return result;
}

/**
 * Generate the Daily Challenge word list for a given date string.
 * Consistently returns the exact same 40 words on the same date.
 */
export function generateDailyWords(
  englishWords: string[],
  dateStr: string = getLocalDateString(),
  count: number = 40
): string[] {
  const seed = hashString(`prochange-daily-${dateStr}`);
  const prng = mulberry32(seed);
  return generateWordList(englishWords, count, prng);
}
