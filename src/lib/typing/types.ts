export type CharState = "pending" | "correct" | "incorrect" | "extra" | "skipped";

export type TypingMode = "time" | "words" | "custom" | "daily";
export type TypingLang = "en" | "hi" | "gu";
export type CaretStyle = "line" | "block" | "underline";
export type FontSize = "s" | "m" | "l" | "xl";

export type TypingSettings = {
  mode: TypingMode;
  time: 15 | 30 | 60 | 120;
  words: 10 | 25 | 50 | 100;
  lang: TypingLang;
  punctuation: boolean;
  numbers: boolean;
  fontSize: FontSize;
  caret: CaretStyle;
  stopOnError: boolean;
  sound: boolean;
};

export type Keystroke = {
  t: number;        // ms since test start, from performance.now()
  expected: string; // expected grapheme
  typed: string;    // typed grapheme
  correct: boolean;
};

export type PerSecondStat = {
  sec: number;
  wpm: number;
  raw: number;
  errors: number;
};

export type ProblemKey = {
  key: string;
  errors: number;
  total: number;
  errorRate: number;
};

export type TestResult = {
  id: string;
  date: string;           // ISO string
  mode: string;
  lang: string;
  duration: number;       // seconds actually typed
  wpm: number;
  rawWpm: number;
  accuracy: number;       // 0 to 100
  consistency: number;    // 0 to 100
  chars: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  perSecond: PerSecondStat[];
  problemKeys: ProblemKey[];
};

export type WordModel = {
  id: number;
  target: string;
  targetClusters: string[];
  typed: string;
  typedClusters: string[];
  extraClusters: string[];
  status: "pending" | "active" | "completed";
  isIncorrect?: boolean;
};

export type EngineState = {
  words: WordModel[];
  currentWordIndex: number;
  isStarted: boolean;
  isFinished: boolean;
  startTime: number | null;
  keystrokes: Keystroke[];
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
};
