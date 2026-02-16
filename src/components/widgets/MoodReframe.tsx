"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collapseReveal, tapScale, fadeUp, editorial } from "@/lib/motion";
import { WidgetActionBar } from "./WidgetActionBar";

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
  onSave?: (data: Record<string, unknown>) => Promise<boolean>;
  onSendToChat?: (prompt: string) => void;
}

export function MoodReframe({
  title,
  description,
  content,
  philosopher,
  onSave,
  onSendToChat,
}: MoodReframeProps) {
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (onSave) {
      setSaving(true);
      const success = await onSave({
        originalThought: content.original_thought || "",
        reframedThought: content.reframe || "",
        technique: content.technique || "",
      });
      setSaving(false);
      if (success) setSaved(true);
    }
  }

  function handleSendToChat() {
    if (onSendToChat && content.original_thought) {
      const prompt = `I've been working through a reframe exercise. My original thought was: "${content.original_thought}". ${content.reframe ? `The reframed perspective is: "${content.reframe}". ` : ""}I'd like to discuss this further.`;
      onSendToChat(prompt);
    }
  }

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
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.button
                key="reveal-btn"
                onClick={() => setRevealed(true)}
                whileTap={tapScale}
                exit={{ opacity: 0, scale: 0.95, transition: editorial.fast }}
                className="w-full rounded-md border-2 border-ink p-4 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
              >
                Reveal the Reframe
              </motion.button>
            ) : (
              <motion.div
                key="reframe-content"
                variants={collapseReveal}
                initial="collapsed"
                animate="expanded"
              >
                <div className="rounded-md border border-sage/30 bg-sage/5 p-4">
                  <p className="text-label text-sage mb-1">Reframed</p>
                  <p className="text-body text-ink">&ldquo;{content.reframe}&rdquo;</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {content.reflection_prompt && revealed && (
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="text-body-sm mt-4 italic text-muted"
          >
            {content.reflection_prompt}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (onSave || onSendToChat) && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            <WidgetActionBar
              onSave={onSave ? handleSave : undefined}
              saveLabel="Save Reframe"
              saving={saving}
              saved={saved}
              onSendToChat={onSendToChat ? handleSendToChat : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
