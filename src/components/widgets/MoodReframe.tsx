"use client";

import { useState } from "react";

interface MoodReframeProps {
  title: string;
  description: string;
  content: {
    original_thought?: string;
    reframe?: string;
    technique?: string;
    steps?: string[];
    reflection_prompt?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
}

export function MoodReframe({
  title,
  description,
  content,
  philosopher,
}: MoodReframeProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-accent uppercase tracking-wider">
        Reframe
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 text-muted">{description}</p>

      {content.original_thought && (
        <div className="mt-4 rounded-md bg-muted/5 border border-muted-light p-4">
          <p className="text-label text-muted mb-1">The thought</p>
          <p className="text-body text-ink italic">&ldquo;{content.original_thought}&rdquo;</p>
        </div>
      )}

      {content.steps && content.steps.length > 0 && (
        <ol className="mt-4 space-y-3">
          {content.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-xs font-medium text-accent mt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-body-sm text-ink">{step}</p>
            </li>
          ))}
        </ol>
      )}

      {content.reframe && (
        <div className="mt-4">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-md border-2 border-ink p-4 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              Reveal the Reframe
            </button>
          ) : (
            <div className="rounded-md border border-sage/30 bg-sage/5 p-4">
              <p className="text-label text-sage mb-1">Reframed</p>
              <p className="text-body text-ink">&ldquo;{content.reframe}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {content.reflection_prompt && revealed && (
        <p className="text-body-sm mt-4 italic text-muted">
          {content.reflection_prompt}
        </p>
      )}

      {philosopher && (
        <div className="mt-4 border-t border-muted-light pt-4">
          <p className="text-caption text-muted">
            <span className="font-semibold">{philosopher.name}</span> &middot; {philosopher.school}
          </p>
          <p className="text-body-sm mt-1 italic text-muted">{philosopher.relevance}</p>
        </div>
      )}
    </div>
  );
}
