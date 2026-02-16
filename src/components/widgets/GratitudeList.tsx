"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, scaleIn, tapScale, editorial } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WidgetHistory } from "./WidgetHistory";

interface GratitudeListProps {
  title: string;
  description: string;
  content: {
    min_items?: number;
    max_items?: number;
    prompt?: string;
    reflection?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
  onSave?: (data: Record<string, unknown>) => Promise<boolean>;
  onSendToChat?: (prompt: string) => void;
  widgetInstanceId?: string;
}

export function GratitudeList({
  title,
  description,
  content,
  philosopher,
  onSave,
  onSendToChat,
  widgetInstanceId,
}: GratitudeListProps) {
  const minItems = content.min_items || 3;
  const maxItems = content.max_items || 5;

  const [items, setItems] = useState<string[]>(Array(minItems).fill(""));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addItem() {
    if (items.length < maxItems) {
      setItems((prev) => [...prev, ""]);
    }
  }

  async function handleSave() {
    const filled = items.filter((item) => item.trim());
    if (filled.length < minItems) return;

    if (onSave) {
      setSaving(true);
      const success = await onSave({ items: filled });
      setSaving(false);
      if (success) setSaved(true);
    } else {
      setSaved(true);
    }
  }

  const filledCount = items.filter((item) => item.trim()).length;

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-sage uppercase tracking-wider">
        Gratitude
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 mb-6 text-muted">{description}</p>

      {content.prompt && (
        <p className="font-display text-base italic text-ink mb-4 leading-relaxed">
          &ldquo;{content.prompt}&rdquo;
        </p>
      )}

      <AnimatePresence mode="wait">
        {!saved ? (
          <motion.div key="input-form" exit={{ opacity: 0, transition: editorial.fast }}>
            <div className="space-y-3">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial={i >= minItems ? "hidden" : false}
                    animate="visible"
                    exit={{ opacity: 0, y: -10, transition: editorial.fast }}
                    className="flex gap-3 items-start"
                  >
                    <span className="font-mono text-xs font-medium text-sage mt-3 shrink-0">
                      {i + 1}.
                    </span>
                    <Input
                      value={item}
                      onChange={(e) => updateItem(i, e.target.value)}
                      placeholder={`Something you're grateful for...`}
                      className="border-muted-light bg-paper text-ink placeholder:text-muted focus:border-sage"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {items.length < maxItems && (
                <motion.button
                  onClick={addItem}
                  whileTap={tapScale}
                  className="text-body-sm text-muted hover:text-ink transition-colors"
                >
                  + Add another
                </motion.button>
              )}
              <div className="flex-1" />
              {widgetInstanceId && (
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="font-mono text-xs text-muted hover:text-ink transition-colors mr-2"
                >
                  {showHistory ? "Hide history" : "History"}
                </button>
              )}
              <Button
                onClick={handleSave}
                disabled={filledCount < minItems || saving}
                className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : `Save (${filledCount}/${minItems} min)`}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="saved-state"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="rounded-md border border-sage/30 bg-sage/5 p-4">
              <ul className="space-y-2">
                {items
                  .filter((item) => item.trim())
                  .map((item, i) => (
                    <li key={i} className="text-body-sm text-ink flex gap-2">
                      <span className="font-mono text-xs text-sage mt-0.5">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {content.reflection && (
              <p className="text-body-sm italic text-muted">{content.reflection}</p>
            )}

            <div className="flex items-center gap-3">
              <motion.p
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="text-caption text-sage"
              >
                Gratitude list saved.
              </motion.p>
              {onSendToChat && (
                <motion.button
                  whileTap={tapScale}
                  onClick={() => {
                    const filled = items.filter((item) => item.trim());
                    onSendToChat(`I just completed a gratitude list: ${filled.map((item, i) => `${i + 1}. ${item}`).join(", ")}. I'd like to reflect on this.`);
                  }}
                  className="rounded-md border border-slate/30 bg-slate/5 px-3 py-1.5 text-xs font-medium text-slate hover:bg-slate/10 transition-colors"
                >
                  Discuss with Coach
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showHistory && widgetInstanceId && (
        <WidgetHistory dataSubtype="gratitude" widgetInstanceId={widgetInstanceId} />
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
