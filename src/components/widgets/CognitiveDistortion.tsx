"use client";

import { useState } from "react";

interface CognitiveDistortionProps {
  title: string;
  userThought: string;
  distortionType: string;
  explanation: string;
  philosophicalCounter: string;
  reframedPerspective: string;
}

export function CognitiveDistortion({
  title,
  userThought,
  distortionType,
  explanation,
  philosophicalCounter,
  reframedPerspective,
}: CognitiveDistortionProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-accent uppercase tracking-wider">
        Cognitive Check
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>

      {/* User's thought */}
      <div className="mt-4 rounded-md bg-muted/5 p-4">
        <p className="text-caption mb-1 text-muted">Your Thought</p>
        <p className="text-body-sm text-ink italic">&ldquo;{userThought}&rdquo;</p>
      </div>

      {/* Distortion badge */}
      <div className="mt-4">
        <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          {distortionType}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-body-sm mt-3 text-muted">{explanation}</p>

      {/* Divider */}
      <div className="my-4 border-t border-muted-light" />

      {/* Philosophical Counter */}
      <div>
        <p className="text-label font-semibold text-slate mb-1">
          Philosophical Counter
        </p>
        <p className="text-body-sm text-ink">{philosophicalCounter}</p>
      </div>

      {/* Reveal reframed perspective */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-4 rounded-md border-2 border-sage px-4 py-2 text-sm font-semibold text-sage transition-colors hover:bg-sage/5"
        >
          Reveal Reframed Perspective
        </button>
      ) : (
        <div className="mt-4 rounded-md border border-sage/30 bg-sage/5 p-4">
          <p className="text-label text-sage mb-1">Reframed Perspective</p>
          <p className="text-body-sm text-ink">{reframedPerspective}</p>
        </div>
      )}
    </div>
  );
}
