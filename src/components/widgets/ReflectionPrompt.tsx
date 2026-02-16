"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReflectionPromptProps {
  title: string;
  description: string;
  content: {
    prompt?: string;
    guiding_questions?: string[];
    placeholder?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
}

export function ReflectionPrompt({
  title,
  description,
  content,
  philosopher,
}: ReflectionPromptProps) {
  const [response, setResponse] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (response.trim()) {
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
            <Button
              onClick={handleSave}
              disabled={!response.trim()}
              className="mt-3 rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
            >
              Save Reflection
            </Button>
          </>
        ) : (
          <div className="rounded-md border border-sage/30 bg-sage/5 p-4">
            <p className="text-body-sm text-ink">{response}</p>
            <p className="text-caption mt-2 text-sage">Saved to your journal.</p>
          </div>
        )}
      </div>

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
