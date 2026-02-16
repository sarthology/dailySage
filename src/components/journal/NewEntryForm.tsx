"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoodCanvas } from "@/components/core/MoodCanvas";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useMood } from "@/hooks/useMood";
import type { MoodVector } from "@/types/mood";

const prompts = [
  "What would Marcus Aurelius say about your day today?",
  "What are you holding onto that you could let go of?",
  "If you could have a conversation with any philosopher about today, who and why?",
  "What felt most meaningful today, even if small?",
];

export function NewEntryForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [moodBefore, setMoodBefore] = useState<MoodVector>({ x: 0, y: 0 });
  const [showMood, setShowMood] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logMood } = useMood();

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setSaving(false);
        return;
      }

      // Insert journal entry
      const { data: entry, error: insertError } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          content: content.trim(),
          prompt: selectedPrompt,
          mood_before: showMood ? moodBefore : null,
          philosophical_tags: [],
        })
        .select()
        .single();

      if (insertError || !entry) {
        throw new Error(insertError?.message || "Failed to save entry");
      }

      // Log mood if selected
      if (showMood) {
        await logMood(moodBefore, undefined, "journal_entry");
      }

      // Fire AI reflection in the background (non-blocking)
      fetch("/api/journal-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: entry.id,
          content: content.trim(),
        }),
      }).catch(() => {
        // Non-critical — reflection will be missing but entry is saved
      });

      router.push(`/journal/${entry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-[800px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <Link href="/journal" className="text-body-sm text-muted hover:text-ink transition-colors">
          &larr; Back to Journal
        </Link>
        <h1 className="text-h1 mt-4 text-ink">New Entry</h1>
      </div>

      {/* Optional prompt selection */}
      <div className="mb-6">
        <p className="text-label text-muted mb-3">Start with a prompt (optional)</p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setSelectedPrompt(selectedPrompt === prompt ? null : prompt);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                selectedPrompt === prompt
                  ? "bg-accent text-paper-light"
                  : "border border-muted-light bg-paper-light text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt}
            </button>
          ))}
        </div>
        {selectedPrompt && (
          <p className="font-display text-base italic text-ink mt-4 leading-relaxed">
            &ldquo;{selectedPrompt}&rdquo;
          </p>
        )}
      </div>

      {/* Writing area */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write freely. There are no wrong thoughts here..."
        rows={12}
        className="min-h-[300px] border-muted-light bg-paper-light text-ink text-base leading-relaxed placeholder:text-muted focus:border-accent resize-none"
      />

      {/* Mood check-in (collapsible) */}
      <div className="mt-6">
        <button
          onClick={() => setShowMood(!showMood)}
          className="text-body-sm text-muted hover:text-ink transition-colors"
        >
          {showMood ? "Hide mood check-in" : "Add mood check-in"} {showMood ? "\u2212" : "+"}
        </button>
        {showMood && (
          <div className="mt-4 flex justify-center">
            <MoodCanvas value={moodBefore} onChange={setMoodBefore} compact />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-body-sm text-accent">{error}</p>
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="rounded-md bg-accent px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Entry"}
        </Button>
        <Button
          onClick={() => router.push("/journal")}
          variant="outline"
          className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
        >
          Discard
        </Button>
      </div>
    </main>
  );
}
