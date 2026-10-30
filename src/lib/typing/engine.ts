import { EngineState, TypingLang, WordModel } from "./types";
import { splitGraphemes } from "./graphemes";

/**
 * Initialize engine state with word list.
 */
export function initEngine(wordsList: string[], lang: TypingLang = "en"): EngineState {
  const words: WordModel[] = wordsList.map((target, idx) => ({
    id: idx,
    target,
    targetClusters: splitGraphemes(target, lang),
    typed: "",
    typedClusters: [],
    extraClusters: [],
    status: idx === 0 ? "active" : "pending",
  }));

  return {
    words,
    currentWordIndex: 0,
    isStarted: false,
    isFinished: false,
    startTime: null,
    keystrokes: [],
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    errorCount: 0,
  };
}

/**
 * Type a single character / grapheme cluster into the engine.
 */
export function typeCharacter(
  state: EngineState,
  char: string,
  timestamp: number,
  stopOnError: boolean = false
): EngineState {
  if (state.isFinished || state.currentWordIndex >= state.words.length) {
    return state;
  }

  const newState: EngineState = {
    ...state,
    words: [...state.words],
    keystrokes: [...state.keystrokes],
  };

  // Start timer on first keystroke
  if (!newState.isStarted) {
    newState.isStarted = true;
    newState.startTime = timestamp;
  }

  const wordIndex = newState.currentWordIndex;
  const currentWord = { ...newState.words[wordIndex] };
  const targetClusters = currentWord.targetClusters;
  const typedClusters = [...currentWord.typedClusters];
  const extraClusters = [...currentWord.extraClusters];

  const currentTypedCount = typedClusters.length;
  const expectedGrapheme = currentTypedCount < targetClusters.length ? targetClusters[currentTypedCount] : "";
  const isMatch = char === expectedGrapheme;

  // Rule: Stop on error blocks wrong keys from being typed
  if (stopOnError && !isMatch && currentTypedCount < targetClusters.length) {
    newState.totalKeystrokes++;
    newState.errorCount++;
    newState.keystrokes.push({
      t: timestamp - (newState.startTime || timestamp),
      expected: expectedGrapheme,
      typed: char,
      correct: false,
    });
    return newState;
  }

  // Normal typing logic
  if (currentTypedCount < targetClusters.length) {
    typedClusters.push(char);
    newState.totalKeystrokes++;
    if (isMatch) {
      newState.correctKeystrokes++;
    } else {
      newState.errorCount++;
    }

    newState.keystrokes.push({
      t: timestamp - (newState.startTime || timestamp),
      expected: expectedGrapheme,
      typed: char,
      correct: isMatch,
    });
  } else {
    // Typing more than word has: show up to 10 extra characters
    if (extraClusters.length < 10) {
      extraClusters.push(char);
      newState.totalKeystrokes++;
      newState.errorCount++;
      newState.keystrokes.push({
        t: timestamp - (newState.startTime || timestamp),
        expected: "",
        typed: char,
        correct: false,
      });
    }
  }

  currentWord.typedClusters = typedClusters;
  currentWord.extraClusters = extraClusters;
  currentWord.typed = typedClusters.join("") + extraClusters.join("");
  newState.words[wordIndex] = currentWord;

  return newState;
}

/**
 * Handle Space key: advance to next word.
 * If in middle of word, remaining characters are marked skipped (counted as errors).
 */
export function handleSpace(state: EngineState, timestamp: number): EngineState {
  if (state.isFinished || state.currentWordIndex >= state.words.length) {
    return state;
  }

  const wordIndex = state.currentWordIndex;
  const currentWord = { ...state.words[wordIndex] };

  // If nothing has been typed yet for this word, ignore pressing Space
  if (currentWord.typedClusters.length === 0 && currentWord.extraClusters.length === 0) {
    return state;
  }

  const newState: EngineState = {
    ...state,
    words: [...state.words],
    keystrokes: [...state.keystrokes],
  };

  // Start timer if not already started
  if (!newState.isStarted) {
    newState.isStarted = true;
    newState.startTime = timestamp;
  }

  // Check if word was correct
  const targetClusters = currentWord.targetClusters;
  const typedClusters = currentWord.typedClusters;
  const extraClusters = currentWord.extraClusters;

  let wordCorrect = true;
  if (typedClusters.length !== targetClusters.length || extraClusters.length > 0) {
    wordCorrect = false;
  } else {
    for (let i = 0; i < targetClusters.length; i++) {
      if (typedClusters[i] !== targetClusters[i]) {
        wordCorrect = false;
        break;
      }
    }
  }

  // Count skipped characters if user hit space mid-word
  if (typedClusters.length < targetClusters.length) {
    const skippedCount = targetClusters.length - typedClusters.length;
    newState.errorCount += skippedCount;
  }

  currentWord.status = "completed";
  currentWord.isIncorrect = !wordCorrect;
  newState.words[wordIndex] = currentWord;

  // Space keystroke
  newState.totalKeystrokes++;
  if (wordCorrect) {
    newState.correctKeystrokes++;
  } else {
    newState.errorCount++;
  }
  newState.keystrokes.push({
    t: timestamp - (newState.startTime || timestamp),
    expected: " ",
    typed: " ",
    correct: wordCorrect,
  });

  // Advance to next word
  const nextIndex = wordIndex + 1;
  if (nextIndex < newState.words.length) {
    newState.currentWordIndex = nextIndex;
    const nextWord = { ...newState.words[nextIndex], status: "active" as const };
    newState.words[nextIndex] = nextWord;
  } else {
    // All words completed
    newState.isFinished = true;
  }

  return newState;
}

/**
 * Handle Backspace key:
 * - If current word has extra characters, remove the last extra character.
 * - Else if current word has typed characters, remove the last typed character.
 * - Else if at the start of a word: return to previous word only if previous word was incorrect.
 */
export function handleBackspace(state: EngineState): EngineState {
  if (state.isFinished) return state;

  const wordIndex = state.currentWordIndex;
  const currentWord = { ...state.words[wordIndex] };
  const newState: EngineState = {
    ...state,
    words: [...state.words],
  };

  if (currentWord.extraClusters.length > 0) {
    const extraClusters = [...currentWord.extraClusters];
    extraClusters.pop();
    currentWord.extraClusters = extraClusters;
    currentWord.typed = currentWord.typedClusters.join("") + extraClusters.join("");
    newState.words[wordIndex] = currentWord;
    return newState;
  }

  if (currentWord.typedClusters.length > 0) {
    const typedClusters = [...currentWord.typedClusters];
    typedClusters.pop();
    currentWord.typedClusters = typedClusters;
    currentWord.typed = typedClusters.join("");
    newState.words[wordIndex] = currentWord;
    return newState;
  }

  // At start of word: can return to previous word ONLY if it was incorrect
  if (wordIndex > 0) {
    const prevWord = { ...newState.words[wordIndex - 1] };
    if (prevWord.isIncorrect) {
      // Revert previous word to active, current word to pending
      currentWord.status = "pending";
      newState.words[wordIndex] = currentWord;

      prevWord.status = "active";
      newState.words[wordIndex - 1] = prevWord;
      newState.currentWordIndex = wordIndex - 1;
      return newState;
    }
  }

  return state;
}

/**
 * Handle Ctrl+Backspace (or Alt+Backspace on Mac):
 * Deletes the entire input of the current word.
 */
export function handleCtrlBackspace(state: EngineState): EngineState {
  if (state.isFinished) return state;

  const wordIndex = state.currentWordIndex;
  const currentWord = { ...state.words[wordIndex] };

  if (currentWord.typedClusters.length === 0 && currentWord.extraClusters.length === 0) {
    return state;
  }

  const newState: EngineState = {
    ...state,
    words: [...state.words],
  };

  currentWord.typedClusters = [];
  currentWord.extraClusters = [];
  currentWord.typed = "";
  newState.words[wordIndex] = currentWord;

  return newState;
}
