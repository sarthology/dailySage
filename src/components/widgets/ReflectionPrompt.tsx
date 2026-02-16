"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { tapScale } from "@/lib/motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WidgetHistory } from "./WidgetHistory";

interface ReflectionPromptProps {
  title: string;
  description: string;
  content: {
    prompt?: string;
    guiding_questions?: string[];
    placeholder?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
  onSave?: (data: Record<string, unknown>) => Promise<boolean>;
  onSendToChat?: (prompt: string) => void;
  widgetInstanceId?: string;
}

export function ReflectionPrompt({
  title,
  description,
  content,
  philosopher,
  onSave,
  onSendToChat,
  widgetInstanceId,
}: ReflectionPromptProps) {
  const [response, setResponse] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  async function handleSave() {
    if (!response.trim()) return;

    if (onSave) {
      setSaving(true);
      const success = await onSave({ text: response, prompt: content.prompt || title });
      setSaving(false);
      if (success) setSaved(true);
    } else {
      setSaved(true);
    }
  }

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        Reflection
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 text-muted">{description}</p>

      {content.prompt && (
        <p className="font-display text-base italic text-ink mt-4 leading-relaxed">
          &ldquo;{content.prompt}&rdquo;
        </p>
      )}

      {content.guiding_questions && content.guiding_questions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {content.guiding_questions.map((q, i) => (
            <li key={i} className="text-body-sm text-muted flex gap-2">
              <span className="font-mono text-xs text-accent mt-0.5">{i + 1}.</span>
              {q}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        {!saved ? (
          <>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={content.placeholder || "Write your reflection..."}
              rows={4}
              className="border-muted-light bg-paper text-ink placeholder:text-muted focus:border-accent resize-none"
            />
            <div className="mt-3 flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={!response.trim() || saving}
                className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Reflection"}
              </Button>
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
          </>
        ) : (
          <>
            <div className="rounded-md border border-sage/30 bg-sage/5 p-4">
              <p className="text-body-sm text-ink">{response}</p>
              <p className="text-caption mt-2 text-sage">Saved to your journal.</p>
            </div>
            {onSendToChat && (
              <motion.button
                whileTap={tapScale}
                onClick={() => onSendToChat(`I just wrote a reflection: "${response.slice(0, 150)}${response.length > 150 ? "..." : ""}". I'd like to discuss this further.`)}
                className="mt-3 rounded-md border border-slate/30 bg-slate/5 px-4 py-2 text-sm font-medium text-slate hover:bg-slate/10 transition-colors"
              >
                Discuss with Coach
              </motion.button>
            )}
          </>
        )}
      </div>

      {showHistory && widgetInstanceId && (
        <WidgetHistory dataSubtype="journal" widgetInstanceId={widgetInstanceId} />
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
