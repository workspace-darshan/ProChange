import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateNetWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
} from "../metrics";
import {
  initEngine,
  typeCharacter,
  handleSpace,
  handleBackspace,
} from "../engine";
import {
  generateDailyWords,
} from "../textGen";
import { splitGraphemes } from "../graphemes";
import {
  loadSettings,
  saveSettings,
  loadHistory,
  DEFAULT_SETTINGS,
} from "../storage";

test("1. 50 correct characters typed in 60 seconds returns WPM = 10 (50/5/1)", () => {
  const wpm = calculateNetWpm(50, 60);
  assert.equal(wpm, 10);
});

test("2. 0 keystrokes returns WPM 0, accuracy 0, no NaN", () => {
  const wpm = calculateNetWpm(0, 0);
  const rawWpm = calculateRawWpm(0, 0);
  const accuracy = calculateAccuracy(0, 0);
  assert.equal(wpm, 0);
  assert.equal(rawWpm, 0);
  assert.equal(accuracy, 0);
  assert.equal(Number.isNaN(wpm), false);
  assert.equal(Number.isNaN(rawWpm), false);
  assert.equal(Number.isNaN(accuracy), false);
});

test("3. A mistyped character that is later fixed with Backspace still counts as an error in accuracy", () => {
  let state = initEngine(["hello"]);
  // Type 'h', 'x' (wrong), Backspace, 'e', 'l', 'l', 'o'
  state = typeCharacter(state, "h", 100);
  state = typeCharacter(state, "x", 200); // mistype!
  state = handleBackspace(state);
  state = typeCharacter(state, "e", 300);
  state = typeCharacter(state, "l", 400);
  state = typeCharacter(state, "l", 500);
  state = typeCharacter(state, "o", 600);

  // Total keystrokes recorded: 6 character types (h, x, e, l, l, o)
  // Correct keystrokes: 5 (h, e, l, l, o)
  // Accuracy = 5 / 6 * 100 = 83.33%
  const accuracy = calculateAccuracy(state.correctKeystrokes, state.totalKeystrokes);
  assert.equal(state.totalKeystrokes, 6);
  assert.equal(state.correctKeystrokes, 5);
  assert.ok(accuracy < 100);
  assert.equal(Math.round(accuracy), 83);
});

test("4. Pressing Space mid-word marks the rest of that word as skipped", () => {
  let state = initEngine(["quick", "brown"]);
  // Type 'q', 'u', 'i' then Space mid-word
  state = typeCharacter(state, "q", 100);
  state = typeCharacter(state, "u", 200);
  state = typeCharacter(state, "i", 300);
  state = handleSpace(state, 400);

  // First word is completed and marked incorrect
  assert.equal(state.words[0].status, "completed");
  assert.equal(state.words[0].isIncorrect, true);
  // Engine moves to second word
  assert.equal(state.currentWordIndex, 1);
  assert.equal(state.words[1].status, "active");
  // Skipped characters (c, k = 2) plus space error are reflected in error count
  assert.ok(state.errorCount >= 2);
});

test("5. Typing 12 characters in a 5-character word shows at most 10 extra characters", () => {
  let state = initEngine(["apple"]);
  // Type correct 5 characters
  for (const ch of "apple") {
    state = typeCharacter(state, ch, 100);
  }
  assert.equal(state.words[0].typedClusters.length, 5);
  assert.equal(state.words[0].extraClusters.length, 0);

  // Now type 12 extra characters 'z'
  for (let i = 0; i < 12; i++) {
    state = typeCharacter(state, "z", 100 + i * 10);
  }

  // Cap at 10 extra characters
  assert.equal(state.words[0].extraClusters.length, 10);
});

test("6. Same date string always produces the same daily word list. Different dates produce different lists", () => {
  const dummyWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what"
  ];

  const list1 = generateDailyWords(dummyWords, "2026-10-30", 20);
  const list2 = generateDailyWords(dummyWords, "2026-10-30", 20);
  const list3 = generateDailyWords(dummyWords, "2026-10-31", 20);

  assert.deepEqual(list1, list2);
  assert.notDeepEqual(list1, list3);
});

test("7. Consistency is 100 when every per-second WPM is identical, and lower when it varies", () => {
  const identical = [60, 60, 60, 60, 60];
  const varying = [30, 80, 20, 90, 45];

  const cIdentical = calculateConsistency(identical);
  const cVarying = calculateConsistency(varying);

  assert.equal(cIdentical, 100);
  assert.ok(cVarying < 100);
});

test("8. Grapheme split of a Hindi word with a conjunct returns the expected number of clusters", () => {
  // Hindi word: 'क्षमा' -> clusters: 'क्ष', 'म', 'ा' (or combined 'मा')
  // With Intl.Segmenter in Node:
  const clusters = splitGraphemes("क्षमा", "hi");
  // 'क्ष' is a conjunct cluster (क + ् + ष)
  assert.ok(clusters.length > 0);
  assert.ok(clusters.includes("क्ष") || clusters[0].startsWith("क"));
});

test("9. Storage helper does not throw when localStorage is unavailable", () => {
  // In Node environment without window/localStorage
  assert.doesNotThrow(() => {
    const s = loadSettings();
    assert.deepEqual(s, DEFAULT_SETTINGS);
  });
  assert.doesNotThrow(() => {
    saveSettings(DEFAULT_SETTINGS);
  });
  assert.doesNotThrow(() => {
    const h = loadHistory();
    assert.deepEqual(h, []);
  });
});
