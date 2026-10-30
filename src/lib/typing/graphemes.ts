import { TypingLang } from "./types";

/**
 * Split text into grapheme clusters across English, Hindi, and Gujarati.
 * Indic scripts combine base consonants, vowel matras, halant/virama, and bindu/anusvara
 * into single visual grapheme clusters (e.g. क् + ष = क्ष, न + म + स + ् + त + े = नमस्ते).
 * Intl.Segmenter handles this natively per locale.
 */
interface SegmentItem {
  segment: string;
}

interface SegmenterInstance {
  segment: (text: string) => Iterable<SegmentItem>;
}

interface IntlWithSegmenter {
  Segmenter?: new (locale: string, options: { granularity: string }) => SegmenterInstance;
}

export function splitGraphemes(text: string, lang: TypingLang = "en"): string[] {
  if (!text) return [];

  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-US";
  const intlWithSegmenter = Intl as unknown as IntlWithSegmenter;

  if (typeof Intl !== "undefined" && typeof intlWithSegmenter.Segmenter === "function") {
    try {
      const segmenter = new intlWithSegmenter.Segmenter(locale, { granularity: "grapheme" });
      const segments = segmenter.segment(text);
      const clusters: string[] = [];
      for (const segment of segments) {
        clusters.push(segment.segment);
      }
      return clusters;
    } catch {
      // Fallback below
    }
  }

  return Array.from(text);
}

export function isSegmenterSupported(): boolean {
  const intlWithSegmenter = Intl as unknown as IntlWithSegmenter;
  return typeof Intl !== "undefined" && typeof intlWithSegmenter.Segmenter === "function";
}
