"use client";

import React, { memo } from "react";
import { CaretStyle, WordModel } from "@/lib/typing/types";

interface WordProps {
  word: WordModel;
  isActive: boolean;
  caretStyle: CaretStyle;
}

const Word = memo(function Word({ word, isActive, caretStyle }: WordProps) {
  const { targetClusters, typedClusters, extraClusters, status } = word;
  const isCompleted = status === "completed";
  const caretIndex = typedClusters.length;

  return (
    <span
      className={`typing-word ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${
        word.isIncorrect ? "word-error" : ""
      }`}
    >
      {/* Target Grapheme Clusters */}
      {targetClusters.map((cluster, i) => {
        let charClass = "char-pending";

        if (i < typedClusters.length) {
          charClass = typedClusters[i] === cluster ? "char-correct" : "char-incorrect";
        } else if (isCompleted) {
          // Missed / skipped character
          charClass = "char-skipped";
        }

        const showCaretHere = isActive && i === caretIndex && extraClusters.length === 0;

        return (
          <span key={i} className={`typing-char ${charClass} ${showCaretHere ? `caret-${caretStyle}` : ""}`}>
            {cluster}
          </span>
        );
      })}

      {/* Extra Characters Typed Past Word End */}
      {extraClusters.map((extraChar, j) => {
        const isLastExtra = j === extraClusters.length - 1;
        const showCaretHere = isActive && isLastExtra;

        return (
          <span
            key={`extra-${j}`}
            className={`typing-char char-extra ${showCaretHere ? `caret-${caretStyle}` : ""}`}
          >
            {extraChar}
          </span>
        );
      })}

      {/* Trailing Caret if at end of typed word */}
      {isActive && caretIndex === targetClusters.length && extraClusters.length === 0 && (
        <span className={`caret-spacer caret-${caretStyle}`}>&nbsp;</span>
      )}
    </span>
  );
});

export default Word;
