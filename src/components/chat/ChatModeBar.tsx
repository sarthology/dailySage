"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { editorial } from "@/lib/motion";
import { CHAT_MODES, type ChatMode } from "@/types/chat";

interface ChatModeBarProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  credits: number | null;
  creditsLoading: boolean;
  compact?: boolean;
}

export function ChatModeBar({
  mode,
  onModeChange,
  credits,
  creditsLoading,
}: ChatModeBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = CHAT_MODES.find((m) => m.key === mode) ?? CHAT_MODES[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="flex items-center gap-2 mb-2">
      {/* Mode selector */}
      <div ref={ref} className="relative flex-1 min-w-0">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md border border-muted-light/60 bg-paper px-3 py-1.5 transition-colors hover:border-ink/30 w-full"
        >
          <span className="font-mono text-[0.65rem] font-medium uppercase tracking-wider text-accent">
            {current.label}
          </span>
          <span className="text-[0.6rem] text-muted truncate">
            {current.shortDescription}
          </span>
          <svg
            className={`ml-auto h-3 w-3 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 4.5L6 7.5L9 4.5" />
          </svg>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={editorial.fast}
              className="absolute bottom-full left-0 right-0 mb-1 z-50 rounded-lg border border-muted-light bg-paper-light shadow-lg overflow-hidden"
            >
              {CHAT_MODES.map((m) => {
                const isActive = mode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => {
                      onModeChange(m.key);
                      setOpen(false);
                    }}
                    className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-accent/8"
                        : "hover:bg-paper"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[0.65rem] font-medium uppercase tracking-wider ${
                          isActive ? "text-accent" : "text-ink"
                        }`}
                      >
                        {m.label}
                      </span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                    </div>
                    <span className="text-[0.6rem] leading-snug text-muted">
                      {m.description}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Credit counter */}
      <div className="shrink-0 flex items-center gap-1 font-mono text-[0.6rem] tracking-wider">
        <span className="text-accent">&#x25C6;</span>
        {creditsLoading ? (
          <span className="text-muted">--</span>
        ) : (
          <span
            className={
              credits === null
                ? "text-muted"
                : credits <= 0
                  ? "text-accent font-medium"
                  : credits <= 5
                    ? "text-warm font-medium"
                    : "text-ink font-medium"
            }
          >
            {credits ?? 0}
          </span>
        )}
      </div>
    </div>
  );
}
