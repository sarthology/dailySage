"use client";

import { useState } from "react";

interface ArgumentMapperProps {
  title: string;
  originalStatement: string;
  premises: { text: string; challengeQuestion: string }[];
  conclusion: string;
  philosophicalAnalysis: string;
}

export function ArgumentMapper({
  title,
  originalStatement,
  premises,
  conclusion,
  philosophicalAnalysis,
}: ArgumentMapperProps) {
  const [evaluations, setEvaluations] = useState<
    Record<number, "solid" | "questionable">
  >({});

  function evaluate(index: number, value: "solid" | "questionable") {
    setEvaluations((prev) => ({ ...prev, [index]: value }));
  }

  const allEvaluated = premises.every((_, i) => evaluations[i] !== undefined);
  const questionableCount = Object.values(evaluations).filter(
    (v) => v === "questionable"
  ).length;

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        Argument Map
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>

      {/* Original statement */}
      <div className="mt-4 rounded-md border-l-2 border-accent bg-accent/5 p-4">
        <p className="text-caption text-muted mb-1">Original Statement</p>
        <p className="text-body text-ink">&ldquo;{originalStatement}&rdquo;</p>
      </div>

      {/* Premises */}
      <div className="mt-6 space-y-4">
        {premises.map((premise, i) => (
          <div
            key={i}
            className={`rounded-md border p-4 transition-colors ${
              evaluations[i] === "solid"
                ? "border-sage/30 bg-sage/5"
                : evaluations[i] === "questionable"
                  ? "border-warm/30 bg-warm/5"
                  : "border-muted-light"
            }`}
          >
            <p className="text-body-sm text-ink">
              <span className="font-semibold">Premise {i + 1}:</span>{" "}
              {premise.text}
            </p>
            <p className="text-body-sm mt-1 italic text-muted">
              {premise.challengeQuestion}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => evaluate(i, "solid")}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                  evaluations[i] === "solid"
                    ? "bg-sage text-paper-light"
                    : "border border-sage text-sage hover:bg-sage/10"
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => evaluate(i, "questionable")}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                  evaluations[i] === "questionable"
                    ? "bg-warm text-paper-light"
                    : "border border-warm text-warm hover:bg-warm/10"
                }`}
              >
                Questionable
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion + Analysis */}
      {allEvaluated && (
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-muted-light p-4">
            <p className="text-label font-semibold text-ink mb-1">Conclusion</p>
            <p className="text-body-sm text-ink">{conclusion}</p>
          </div>

          <div className="rounded-md border border-slate/30 bg-slate/5 p-4">
            <p className="text-body-sm text-ink">{philosophicalAnalysis}</p>
          </div>

          {questionableCount > 0 && (
            <p className="text-body-sm text-muted italic">
              You found {questionableCount} of {premises.length} premises
              questionable — perhaps the conclusion deserves re-examination.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
