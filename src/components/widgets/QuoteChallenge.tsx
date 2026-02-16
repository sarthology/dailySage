"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface QuoteChallengeProps {
  quote: string;
  options: { name: string; school: string }[];
  correctIndex: number;
  explanation: string;
}

export function QuoteChallenge({
  quote,
  options,
  correctIndex,
  explanation,
}: QuoteChallengeProps) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(index: number) {
    if (selected !== null) return; // already answered
    setSelected(index);
  }

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-warm uppercase tracking-wider">
        Quote Challenge
      </span>
      <h3 className="text-h3 mt-2 text-ink">Who Said This?</h3>

      {/* Quote */}
      <div className="my-6 border-l-2 border-warm pl-4">
        <p className="text-quote text-ink">&ldquo;{quote}&rdquo;</p>
      </div>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          let classes =
            "rounded-lg border-2 p-4 text-left transition-all duration-150 ";

          if (selected === null) {
            classes += "border-muted-light hover:border-ink cursor-pointer";
          } else if (i === correctIndex) {
            classes += "border-sage bg-sage/5";
          } else if (i === selected) {
            classes += "border-warm bg-warm/5";
          } else {
            classes += "border-muted-light opacity-50";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={classes}
              disabled={selected !== null}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label font-semibold text-ink">
                    {option.name}
                  </p>
                  <p className="text-caption text-muted">{option.school}</p>
                </div>
                {selected !== null && i === correctIndex && (
                  <Check size={18} className="text-sage" />
                )}
                {selected !== null && i === selected && i !== correctIndex && (
                  <X size={18} className="text-warm" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected !== null && (
        <div className="mt-4 rounded-md border border-muted-light p-4">
          <p className="text-label font-semibold text-ink mb-1">
            {selected === correctIndex ? "Correct!" : "Not quite"}
          </p>
          <p className="text-body-sm text-muted">{explanation}</p>
        </div>
      )}
    </div>
  );
}
