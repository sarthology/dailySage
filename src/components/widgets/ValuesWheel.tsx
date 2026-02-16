"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collapseReveal, tapScale, fadeUp } from "@/lib/motion";
import { WidgetHistory } from "./WidgetHistory";

interface ValuesWheelProps {
  title: string;
  domains: { name: string; question: string }[];
  reflectionPrompt: string;
  onSave?: (data: Record<string, unknown>) => Promise<boolean>;
  onSendToChat?: (prompt: string) => void;
  widgetInstanceId?: string;
}

export function ValuesWheel({
  title,
  domains,
  reflectionPrompt,
  onSave,
  onSendToChat,
  widgetInstanceId,
}: ValuesWheelProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const allRated = domains.every((d) => ratings[d.name] !== undefined);

  function setRating(domain: string, value: number) {
    setRatings((prev) => ({ ...prev, [domain]: value }));
  }

  async function handleSave() {
    if (!allRated) return;

    if (onSave) {
      setSaving(true);
      const success = await onSave({
        ratings,
        domains: domains.map((d) => d.name),
      });
      setSaving(false);
      if (success) setSaved(true);
    } else {
      setSaved(true);
    }
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
                <motion.button
                  key={n}
                  onClick={() => setRating(domain.name, n)}
                  whileTap={tapScale}
                  className={`h-8 w-8 rounded text-xs font-semibold transition-colors duration-150 ${
                    ratings[domain.name] === n
                      ? "bg-accent text-paper-light"
                      : "border border-muted-light text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {allRated && (
          <motion.div
            variants={collapseReveal}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="mt-6 rounded-md border border-muted-light p-4"
          >
            <p className="text-label font-semibold text-ink mb-3">Gap Analysis</p>
            <div className="space-y-2">
              {sorted.map((domain) => {
                const value = ratings[domain.name];
                const color = value >= 7 ? "sage" : value <= 4 ? "warm" : "slate";
                return (
                  <motion.div
                    key={domain.name}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-3"
                  >
                    <span className="text-body-sm w-28 text-ink">{domain.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted-light overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 10}%` }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
                      />
                    </div>
                    <span className={`text-caption font-semibold text-${color}`}>
                      {value}/10
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-body-sm mt-4 italic text-muted">{reflectionPrompt}</p>

            <div className="mt-4 flex items-center gap-2">
              <motion.button
                onClick={handleSave}
                disabled={saved || saving}
                whileTap={tapScale}
                className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : saved ? "Assessment Saved" : "Save Assessment"}
              </motion.button>
              {onSendToChat && saved && (
                <motion.button
                  whileTap={tapScale}
                  onClick={() => {
                    const summary = domains.map((d) => `${d.name}: ${ratings[d.name]}/10`).join(", ");
                    onSendToChat(`I just completed a values assessment. My ratings: ${summary}. I'd like to discuss areas where I can grow.`);
                  }}
                  className="rounded-md border border-slate/30 bg-slate/5 px-4 py-2 text-sm font-medium text-slate hover:bg-slate/10 transition-colors"
                >
                  Discuss with Coach
                </motion.button>
              )}
              <div className="flex-1" />
              {widgetInstanceId && (
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="font-mono text-xs text-muted hover:text-ink transition-colors"
                >
                  {showHistory ? "Hide history" : "History"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showHistory && widgetInstanceId && (
        <WidgetHistory dataSubtype="assessment" widgetInstanceId={widgetInstanceId} />
      )}
    </div>
  );
}
