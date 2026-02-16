"use client";

import { motion, AnimatePresence } from "framer-motion";
import { tapScale, scaleIn, editorial } from "@/lib/motion";
import { Button } from "@/components/ui/button";

interface WidgetActionBarProps {
  /** Data saving */
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
  saved?: boolean;
  saveDisabled?: boolean;
  /** Chat prompt */
  onSendToChat?: () => void;
  chatPromptLabel?: string;
  /** History */
  onToggleHistory?: () => void;
  historyOpen?: boolean;
  historyCount?: number;
}

export function WidgetActionBar({
  onSave,
  saveLabel = "Save",
  saving,
  saved,
  saveDisabled,
  onSendToChat,
  chatPromptLabel = "Discuss with Coach",
  onToggleHistory,
  historyOpen,
  historyCount,
}: WidgetActionBarProps) {
  const hasActions = onSave || onSendToChat || onToggleHistory;
  if (!hasActions) return null;

  return (
    <div className="mt-4 flex items-center gap-2 border-t border-muted-light pt-4">
      {onSave && (
        <motion.div whileTap={tapScale}>
          <Button
            onClick={onSave}
            disabled={saved || saving || saveDisabled}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={saving ? "saving" : saved ? "saved" : "default"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={editorial.fast}
              >
                {saving ? "Saving..." : saved ? "Saved" : saveLabel}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>
      )}

      {onSendToChat && (
        <motion.button
          onClick={onSendToChat}
          whileTap={tapScale}
          className="rounded-md border border-slate/30 bg-slate/5 px-4 py-2 text-sm font-medium text-slate hover:bg-slate/10 transition-colors"
        >
          {chatPromptLabel}
        </motion.button>
      )}

      <div className="flex-1" />

      {onToggleHistory && (
        <motion.button
          onClick={onToggleHistory}
          whileTap={tapScale}
          className="font-mono text-xs text-muted hover:text-ink transition-colors"
        >
          {historyOpen ? "Hide history" : `History${historyCount ? ` (${historyCount})` : ""}`}
        </motion.button>
      )}
    </div>
  );
}
