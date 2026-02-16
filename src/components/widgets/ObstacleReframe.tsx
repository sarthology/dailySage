"use client";

import { useState } from "react";

interface ObstacleReframeProps {
  title: string;
  obstacle: string;
  withinControl: string[];
  outsideControl: string[];
  actionPlan: string;
  stoicQuote?: string;
}

export function ObstacleReframe({
  title,
  obstacle,
  withinControl,
  outsideControl,
  actionPlan,
  stoicQuote,
}: ObstacleReframeProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        Stoic Reframe
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>

      <div className="mt-4 rounded-md bg-muted/5 p-4">
        <p className="text-body-sm text-muted italic">&ldquo;{obstacle}&rdquo;</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Within control */}
        <div>
          <h4 className="text-label mb-3 font-semibold text-sage">
            Within Your Control
          </h4>
          <div className="space-y-2">
            {withinControl.map((item, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-start gap-2 rounded-md border-l-2 border-sage p-3 bg-sage/5 transition-colors hover:bg-sage/10"
              >
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={() => toggle(i)}
                  className="mt-0.5 accent-sage"
                />
                <span className="text-body-sm text-ink">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Outside control */}
        <div>
          <h4 className="text-label mb-3 font-semibold text-slate">
            Outside Your Control
          </h4>
          <div className="space-y-2">
            {outsideControl.map((item, i) => (
              <div
                key={i}
                className="rounded-md border-l-2 border-slate p-3 bg-slate/5"
              >
                <span className="text-body-sm text-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {checked.size > 0 && (
        <div className="mt-6 rounded-md border border-sage/30 bg-sage/5 p-4">
          <p className="text-label text-sage mb-1">Your Action Plan</p>
          <p className="text-body-sm text-ink">{actionPlan}</p>
        </div>
      )}

      {stoicQuote && (
        <div className="mt-6 border-t border-muted-light pt-4">
          <p className="font-display text-base italic text-muted leading-relaxed">
            &ldquo;{stoicQuote}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
