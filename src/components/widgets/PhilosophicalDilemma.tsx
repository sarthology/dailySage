"use client";

import { useState } from "react";

interface PhilosophicalDilemmaProps {
  title: string;
  description: string;
  content: {
    scenario?: string;
    choice_a?: { label: string; description: string; philosopher?: string; perspective?: string };
    choice_b?: { label: string; description: string; philosopher?: string; perspective?: string };
    insight?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
}

export function PhilosophicalDilemma({
  title,
  description,
  content,
  philosopher,
}: PhilosophicalDilemmaProps) {
  const [selected, setSelected] = useState<"a" | "b" | null>(null);

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        Philosophical Dilemma
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 mb-6 text-muted">{description}</p>

      {content.scenario && (
        <p className="text-body text-ink leading-relaxed mb-6">
          {content.scenario}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {content.choice_a && (
          <button
            onClick={() => setSelected("a")}
            className={`rounded-lg border-2 p-4 text-left transition-all duration-150 ${
              selected === "a"
                ? "border-accent bg-accent/5"
                : "border-muted-light hover:border-ink"
            }`}
          >
            <p className="text-label font-semibold text-ink">{content.choice_a.label}</p>
            <p className="text-body-sm mt-1 text-muted">{content.choice_a.description}</p>
          </button>
        )}
        {content.choice_b && (
          <button
            onClick={() => setSelected("b")}
            className={`rounded-lg border-2 p-4 text-left transition-all duration-150 ${
              selected === "b"
                ? "border-accent bg-accent/5"
                : "border-muted-light hover:border-ink"
            }`}
          >
            <p className="text-label font-semibold text-ink">{content.choice_b.label}</p>
            <p className="text-body-sm mt-1 text-muted">{content.choice_b.description}</p>
          </button>
        )}
      </div>

      {selected && (
        <div className="mt-6 space-y-4">
          {/* Show perspectives for both choices */}
          {content.choice_a?.perspective && (
            <div className="rounded-md border border-slate/20 bg-slate/5 p-4">
              <p className="text-label text-slate mb-1">
                {content.choice_a.philosopher || "Perspective A"}
              </p>
              <p className="text-body-sm text-ink">{content.choice_a.perspective}</p>
            </div>
          )}
          {content.choice_b?.perspective && (
            <div className="rounded-md border border-slate/20 bg-slate/5 p-4">
              <p className="text-label text-slate mb-1">
                {content.choice_b.philosopher || "Perspective B"}
              </p>
              <p className="text-body-sm text-ink">{content.choice_b.perspective}</p>
            </div>
          )}

          {content.insight && (
            <div className="rounded-md border border-sage/30 bg-sage/5 p-4">
              <p className="text-label text-sage mb-1">Insight</p>
              <p className="text-body-sm text-ink italic">{content.insight}</p>
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
