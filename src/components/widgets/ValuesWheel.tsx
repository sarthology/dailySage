"use client";

import { useState } from "react";

interface ValuesWheelProps {
  title: string;
  domains: { name: string; question: string }[];
  reflectionPrompt: string;
}

export function ValuesWheel({
  title,
  domains,
  reflectionPrompt,
}: ValuesWheelProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const allRated = domains.every((d) => ratings[d.name] !== undefined);

  function setRating(domain: string, value: number) {
    setRatings((prev) => ({ ...prev, [domain]: value }));
  }

  const sorted = allRated
    ? [...domains].sort((a, b) => (ratings[b.name] ?? 0) - (ratings[a.name] ?? 0))
    : [];

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        Values
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 mb-6 text-muted">
        Rate your alignment in each area (1 = low, 10 = high)
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {domains.map((domain) => (
          <div
            key={domain.name}
            className="rounded-md border border-muted-light p-4"
          >
            <p className="text-label font-semibold text-ink">{domain.name}</p>
            <p className="text-body-sm mt-1 mb-3 text-muted">{domain.question}</p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(domain.name, n)}
                  className={`h-8 w-8 rounded text-xs font-semibold transition-all duration-150 ${
                    ratings[domain.name] === n
                      ? "bg-accent text-paper-light"
                      : "border border-muted-light text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allRated && (
        <div className="mt-6 rounded-md border border-muted-light p-4">
          <p className="text-label font-semibold text-ink mb-3">Gap Analysis</p>
          <div className="space-y-2">
            {sorted.map((domain) => {
              const value = ratings[domain.name];
              const color = value >= 7 ? "sage" : value <= 4 ? "warm" : "slate";
              return (
                <div key={domain.name} className="flex items-center gap-3">
                  <span className="text-body-sm w-28 text-ink">{domain.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted-light overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-${color} transition-all duration-500`}
                      style={{ width: `${value * 10}%` }}
                    />
                  </div>
                  <span className={`text-caption font-semibold text-${color}`}>
                    {value}/10
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-body-sm mt-4 italic text-muted">{reflectionPrompt}</p>
        </div>
      )}
    </div>
  );
}
