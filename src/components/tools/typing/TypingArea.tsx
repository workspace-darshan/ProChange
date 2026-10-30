"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  CaretStyle,
  FontSize,
  TypingLang,
  WordModel,
} from "@/lib/typing/types";
import Word from "./Word";
import { MousePointerClick } from "lucide-react";

interface TypingAreaProps {
  words: WordModel[];
  currentWordIndex: number;
  fontSize: FontSize;
  caretStyle: CaretStyle;
  lang: TypingLang;
  isStarted: boolean;
  isFinished: boolean;
  onCharacter: (char: string) => void;
  onSpace: () => void;
  onBackspace: () => void;
  onCtrlBackspace: () => void;
  onRestart: () => void;
  onNewText: () => void;
}

export default function TypingArea({
  words,
  currentWordIndex,
  fontSize,
  caretStyle,
  lang,
  isStarted,
  isFinished,
  onCharacter,
  onSpace,
  onBackspace,
  onCtrlBackspace,
  onRestart,
  onNewText,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState<boolean>(true);
  const isComposingRef = useRef<boolean>(false);

  // Focus input automatically on mount and keep focused
  useEffect(() => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFinished]);

  // Click anywhere on typing box refocuses hidden input
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  // Scroll active line into middle of view
  useEffect(() => {
    if (!wordsWrapperRef.current) return;
    const activeWordEl = wordsWrapperRef.current.querySelector(".typing-word.active") as HTMLElement | null;
    if (activeWordEl && containerRef.current) {
      const activeTop = activeWordEl.offsetTop;
      const containerH = containerRef.current.clientHeight;
      // Keep active line roughly in center
      const targetScroll = Math.max(0, activeTop - containerH / 2 + 30);
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  }, [currentWordIndex]);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Monkeytype standard shortcuts
      if (e.key === "Tab") {
        e.preventDefault();
        onRestart();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onRestart();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onNewText();
        return;
      }

      if (isFinished || isComposingRef.current) return;

      // Backspace handling
      if (e.key === "Backspace") {
        e.preventDefault();
        if (e.ctrlKey || e.altKey) {
          onCtrlBackspace();
        } else {
          onBackspace();
        }
        return;
      }

      // Space handling
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        onSpace();
        return;
      }
    },
    [isFinished, onBackspace, onCtrlBackspace, onSpace, onRestart, onNewText]
  );

  // Input event: reads actual typed characters (handles virtual keyboards & IME)
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isFinished || isComposingRef.current) return;
      const val = e.target.value;
      if (!val) return;

      // Clear input value immediately
      e.target.value = "";

      // Space entered via IME/mobile
      if (val === " ") {
        onSpace();
        return;
      }

      // Process typed characters
      for (const ch of val) {
        if (ch === " ") {
          onSpace();
        } else {
          onCharacter(ch);
        }
      }
    },
    [isFinished, onCharacter, onSpace]
  );

  return (
    <div
      ref={containerRef}
      className={`typing-box font-${fontSize} lang-${lang} ${!isFocused && !isFinished ? "unfocused" : ""}`}
      onClick={handleContainerClick}
      role="region"
      aria-label="Typing test area"
    >
      {/* Hidden input to capture physical and virtual keystrokes */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-typing-input"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        aria-label="Type here to start the typing test"
        onKeyDown={handleKeyDown}
        onChange={handleInput}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={(e: React.CompositionEvent<HTMLInputElement>) => {
          isComposingRef.current = false;
          const data = e.data || "";
          for (const ch of data) {
            if (ch === " ") onSpace();
            else onCharacter(ch);
          }
          if (inputRef.current) inputRef.current.value = "";
        }}
        onPaste={(e) => e.preventDefault()}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Words Display */}
      <div ref={wordsWrapperRef} className="typing-words-container">
        {words.map((word, idx) => (
          <React.Fragment key={word.id}>
            <Word
              word={word}
              isActive={idx === currentWordIndex}
              caretStyle={caretStyle}
            />
            {idx < words.length - 1 && <span className="word-space"> </span>}
          </React.Fragment>
        ))}
      </div>

      {/* Start Hint */}
      {!isStarted && (
        <div className="typing-start-hint">
          <span>Start typing to begin</span>
        </div>
      )}

      {/* Unfocused Blur Overlay */}
      {!isFocused && !isFinished && (
        <div className="focus-blur-overlay">
          <MousePointerClick size={22} className="pulse-icon" />
          <span>Click here or press any key to focus</span>
        </div>
      )}
    </div>
  );
}
