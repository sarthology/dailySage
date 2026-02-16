"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, scaleIn, tapScale, editorial } from "@/lib/motion";

interface QuickPromptItem {
  text: string;
  icon?: string;
}

const DEFAULT_PROMPTS: QuickPromptItem[] = [
  { text: "I need help calming down", icon: "🧘" },
  { text: "Help me think through a decision", icon: "🤔" },
  { text: "I want to reflect on my day", icon: "📝" },
  { text: "I'm struggling with motivation", icon: "💪" },
];

interface QuickPromptProps {
  title?: string;
  prompts?: QuickPromptItem[];
  onSendToChat?: (prompt: string) => void;
}

export function QuickPrompt({
  title = "Quick Start",
  prompts,
  onSendToChat,
}: QuickPromptProps) {
  const [sentIndex, setSentIndex] = useState<number | null>(null);
  const items = prompts || DEFAULT_PROMPTS;

  function handleSelect(item: QuickPromptItem, index: number) {
    if (onSendToChat) {
      onSendToChat(item.text);
      setSentIndex(index);
    }
  }

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        {title}
      </span>
      <p className="text-body-sm mt-2 mb-4 text-muted">
        Tap to start a conversation
      </p>

      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.button
            key={i}
            onClick={() => handleSelect(item, i)}
            disabled={sentIndex !== null}
            whileTap={tapScale}
            animate={
              sentIndex !== null && sentIndex !== i
                ? { opacity: 0.4, transition: editorial.fast }
                : { opacity: 1 }
            }
            className={`w-full flex items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
              sentIndex === i
                ? "border-sage bg-sage/5 text-sage"
                : "border-muted-light hover:border-ink/30 hover:bg-paper"
            }`}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="text-body-sm text-ink">{item.text}</span>
            <AnimatePresence>
              {sentIndex === i && (
                <motion.span
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="ml-auto font-mono text-[0.65rem] text-sage"
                >
                  Sent
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
