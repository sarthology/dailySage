"use client";

import { useState } from "react";

interface ThoughtExperimentProps {
  title: string;
  description: string;
  content: {
    scenario?: string;
    questions?: string[];
    insight?: string;
    further_reading?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
}

export function ThoughtExperiment({
  title,
  description,
  content,
  philosopher,
}: ThoughtExperimentProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        Thought Experiment
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 mb-6 text-muted">{description}</p>

      {content.scenario && (
        <div className="rounded-md bg-paper p-4 mb-4">
          <p className="text-body text-ink leading-relaxed">{content.scenario}</p>
        </div>
      )}

      {content.questions && content.questions.length > 0 && (
        <div className="mb-4">
          <p className="text-label text-muted mb-2">Consider:</p>
          <ul className="space-y-2">
            {content.questions.map((q, i) => (
              <li key={i} className="text-body-sm text-ink flex gap-2">
                <span className="font-mono text-xs text-slate mt-0.5 shrink-0">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.insight && (
        <div>
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-md border-2 border-ink p-4 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              Reveal the Insight
            </button>
          ) : (
            <div className="rounded-md border border-sage/30 bg-sage/5 p-4">
              <p className="text-label text-sage mb-1">Insight</p>
              <p className="text-body-sm text-ink leading-relaxed">{content.insight}</p>
              {content.further_reading && (
                <p className="text-caption mt-3 text-muted">
                  Further reading: {content.further_reading}
                </p>
              )}
            </div>
          )}
        </div>
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
