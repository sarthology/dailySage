"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stagger, fadeUp, scaleIn, tapScale, editorial } from "@/lib/motion";
import type { MoodLabel } from "@/types/mood";

interface Feeling {
  label: MoodLabel;
  emoji: string;
  vector: { x: number; y: number };
}

const DEFAULT_FEELINGS: Feeling[] = [
  { label: "calm", emoji: "😌", vector: { x: 0.3, y: -0.4 } },
  { label: "peaceful", emoji: "🧘", vector: { x: 0.5, y: -0.3 } },
  { label: "happy", emoji: "😊", vector: { x: 0.7, y: 0.3 } },
  { label: "energized", emoji: "⚡", vector: { x: 0.5, y: 0.8 } },
  { label: "anxious", emoji: "😰", vector: { x: -0.5, y: 0.6 } },
  { label: "tense", emoji: "😤", vector: { x: -0.4, y: 0.4 } },
  { label: "sad", emoji: "😢", vector: { x: -0.6, y: -0.3 } },
  { label: "low", emoji: "😔", vector: { x: -0.3, y: -0.6 } },
  { label: "angry", emoji: "😠", vector: { x: -0.7, y: 0.7 } },
  { label: "intense", emoji: "🔥", vector: { x: 0.1, y: 0.9 } },
];

interface FeelingPickerProps {
  feelings?: Feeling[];
  onSave?: (data: Record<string, unknown>) => Promise<boolean>;
  onSendToChat?: (prompt: string) => void;
}

export function FeelingPicker({
  feelings,
  onSave,
  onSendToChat,
}: FeelingPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const items = feelings || DEFAULT_FEELINGS;

  async function handleSelect(feeling: Feeling) {
    setSelected(feeling.label);

    // Save mood log
    if (onSave) {
      await onSave({
        moodVector: feeling.vector,
        label: feeling.label,
        context: "feeling_picker",
      });
    }

    // Send to chat
    if (onSendToChat) {
      onSendToChat(`I'm feeling ${feeling.label} right now.`);
      setSent(true);
    }
  }

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-accent uppercase tracking-wider">
        How are you feeling?
      </span>
      <p className="text-body-sm mt-2 mb-4 text-muted">
        Tap to share with your coach
      </p>

      <motion.div
        className="grid grid-cols-5 gap-2"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {items.map((feeling) => (
          <motion.button
            key={feeling.label}
            variants={fadeUp}
            onClick={() => handleSelect(feeling)}
            disabled={sent}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${
              selected === feeling.label
                ? "bg-accent/10 border-2 border-accent"
                : "border border-muted-light/50 hover:border-ink/30 hover:bg-paper"
            } ${sent && selected !== feeling.label ? "opacity-40" : ""}`}
          >
            <span className="text-2xl">{feeling.emoji}</span>
            <span className="text-[0.65rem] font-mono text-muted capitalize">
              {feeling.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {sent && (
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="text-caption mt-3 text-sage"
          >
            Shared with coach — check the chat!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
