"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoodCanvas } from "@/components/core/MoodCanvas";
import { createClient } from "@/lib/supabase/client";
import type { MoodVector } from "@/types/mood";

interface SessionSummaryProps {
  sessionId: string;
  initialMood: MoodVector | null;
  messageCount: number;
  onCancel: () => void;
}

function getMoodLabel(v: MoodVector): string {
  if (v.x >= 0 && v.y >= 0) return "Energized & Happy";
  if (v.x >= 0 && v.y < 0) return "Calm & Content";
  if (v.x < 0 && v.y >= 0) return "Tense & Overwhelmed";
  return "Low & Struggling";
}

function getMoodShift(
  initial: MoodVector | null,
  final: MoodVector
): "improved" | "same" | "declined" {
  if (!initial) return "same";
  const initialScore = initial.x; // valence is the primary indicator
  const finalScore = final.x;
  const diff = finalScore - initialScore;
  if (diff > 0.15) return "improved";
  if (diff < -0.15) return "declined";
  return "same";
}

export function SessionSummary({
  sessionId,
  initialMood,
  messageCount,
  onCancel,
}: SessionSummaryProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"final-mood" | "summary">("final-mood");
  const [finalMood, setFinalMood] = useState<MoodVector>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  async function handleConfirmMood() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Update session with final mood and completed status
      await supabase
        .from("sessions")
        .update({
          final_mood: finalMood,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      // Log the final mood
      if (user) {
        await supabase.from("mood_logs").insert({
          user_id: user.id,
          mood_vector: finalMood,
          mood_label: getMoodLabel(finalMood),
          intensity: Math.min(
            10,
            Math.max(
              1,
              Math.round(Math.sqrt(finalMood.x ** 2 + finalMood.y ** 2) * 10) || 1
            )
          ),
          context: "session_end",
        });
      }

      setPhase("summary");
    } catch {
      // Still show summary even if save fails
      setPhase("summary");
    } finally {
      setSaving(false);
    }
  }

  const shift = getMoodShift(initialMood, finalMood);
  const shiftColor =
    shift === "improved" ? "sage" : shift === "declined" ? "warm" : "slate";
  const shiftLabel =
    shift === "improved"
      ? "Feeling better"
      : shift === "declined"
        ? "Still processing"
        : "Steady";

  return (
    <div className="border-t border-muted-light bg-paper-light">
      <div className="mx-auto max-w-lg px-4 py-8">
        {phase === "final-mood" && (
          <div>
            <h3 className="text-h3 text-center text-ink mb-2">
              How Are You Feeling Now?
            </h3>
            <p className="text-body-sm text-center text-muted mb-6">
              Place the pin where you feel after this session.
            </p>
            <MoodCanvas value={finalMood} onChange={setFinalMood} compact />
            <div className="mt-6 flex justify-center gap-3">
              <Button
                onClick={onCancel}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2 text-sm font-semibold text-ink"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmMood}
                disabled={saving}
                className="rounded-md bg-accent px-8 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : "Complete Session"}
              </Button>
            </div>
          </div>
        )}

        {phase === "summary" && (
          <div className="text-center">
            <h3 className="text-h3 text-ink mb-6">Session Complete</h3>

            {/* Mood comparison */}
            {initialMood && (
              <div className="mb-6 rounded-lg border border-muted-light p-6">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-caption text-muted mb-1">Before</p>
                    <p className="text-body-sm font-semibold text-ink">
                      {getMoodLabel(initialMood)}
                    </p>
                  </div>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-${shiftColor}/10`}
                  >
                    <span className={`text-lg text-${shiftColor}`}>
                      {shift === "improved" ? "↑" : shift === "declined" ? "↓" : "→"}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-caption text-muted mb-1">After</p>
                    <p className="text-body-sm font-semibold text-ink">
                      {getMoodLabel(finalMood)}
                    </p>
                  </div>
                </div>
                <p className={`text-body-sm mt-3 text-${shiftColor} font-medium`}>
                  {shiftLabel}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="mb-6 flex justify-center gap-8">
              <div>
                <p className="font-mono text-2xl font-bold text-ink">
                  {messageCount}
                </p>
                <p className="text-caption text-muted">Messages</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => router.push("/session/new")}
                className="rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
              >
                New Session
              </Button>
              <Button
                onClick={() => router.push("/journal/new")}
                variant="outline"
                className="rounded-md border-2 border-ink px-8 py-3 text-sm font-semibold text-ink"
              >
                Write a Journal Entry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
