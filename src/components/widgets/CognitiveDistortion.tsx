"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collapseReveal, scaleIn, tapScale, fadeUp, editorial } from "@/lib/motion";
import { WidgetActionBar } from "./WidgetActionBar";

interface CognitiveDistortionProps {
  title: string;
  userThought: string;
  distortionType: string;
  explanation: string;
  philosophicalCounter: string;
  reframedPerspective: string;
  onSave?: (data: Record<string, unknown>) => Promise<boolean>;
  onSendToChat?: (prompt: string) => void;
}

export function CognitiveDistortion({
  title,
  userThought,
  distortionType,
  explanation,
  philosophicalCounter,
  reframedPerspective,
  onSave,
  onSendToChat,
}: CognitiveDistortionProps) {
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (onSave) {
      setSaving(true);
      const success = await onSave({
        originalThought: userThought,
        reframedThought: reframedPerspective,
        technique: distortionType,
      });
      setSaving(false);
      if (success) setSaved(true);
    }
  }

  function handleSendToChat() {
    if (onSendToChat) {
      const prompt = `I've identified a cognitive distortion (${distortionType}) in my thinking: "${userThought}". The reframed perspective is: "${reframedPerspective}". Can we explore this pattern further?`;
      onSendToChat(prompt);
    }
  }

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
      <motion.div
        className="mt-4"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >
        <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          {distortionType}
        </span>
      </motion.div>

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
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.button
            key="reveal-btn"
            onClick={() => setRevealed(true)}
            whileTap={tapScale}
            exit={{ opacity: 0, scale: 0.95, transition: editorial.fast }}
            className="mt-4 rounded-md border-2 border-sage px-4 py-2 text-sm font-semibold text-sage transition-colors hover:bg-sage/5"
          >
            Reveal Reframed Perspective
          </motion.button>
        ) : (
          <motion.div
            key="revealed-content"
            variants={collapseReveal}
            initial="collapsed"
            animate="expanded"
          >
            <div className="mt-4 rounded-md border border-sage/30 bg-sage/5 p-4">
              <p className="text-label text-sage mb-1">Reframed Perspective</p>
              <p className="text-body-sm text-ink">{reframedPerspective}</p>
            </div>

            {(onSave || onSendToChat) && (
              <WidgetActionBar
                onSave={onSave ? handleSave : undefined}
                saveLabel="Save Insight"
                saving={saving}
                saved={saved}
                onSendToChat={onSendToChat ? handleSendToChat : undefined}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
