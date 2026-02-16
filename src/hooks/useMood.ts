"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MoodVector, MoodLabel } from "@/types/mood";
import type { MoodLogRow } from "@/lib/supabase/types";

export function useMood() {
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const logMood = useCallback(
    async (
      vector: MoodVector,
      label?: MoodLabel,
      context?: string,
      sessionId?: string
    ): Promise<MoodLogRow | null> => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return null;
      }

      const intensity = Math.round(
        Math.sqrt(vector.x * vector.x + vector.y * vector.y) * 10
      );

      const { data, error } = await supabase
        .from("mood_logs")
        .insert({
          user_id: user.id,
          mood_vector: vector,
          mood_label: label || null,
          intensity: Math.min(10, Math.max(1, intensity || 1)),
          context: context || null,
          session_id: sessionId || null,
        })
        .select()
        .single();

      setLoading(false);

      if (error) return null;
      return data as MoodLogRow;
    },
    [supabase]
  );

  const getMoodHistory = useCallback(
    async (limit = 30): Promise<MoodLogRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return [];
      return (data || []) as MoodLogRow[];
    },
    [supabase]
  );

  const getStreak = useCallback(async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get mood logs ordered by date
    const { data, error } = await supabase
      .from("mood_logs")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(90);

    if (error || !data || data.length === 0) return 0;

    // Count consecutive days with mood logs
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = new Set(
      data.map((row: { created_at: string }) => {
        const d = new Date(row.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      if (uniqueDays.has(checkDate.getTime())) {
        streak++;
      } else {
        // Allow skipping today (user hasn't logged yet)
        if (i === 0) continue;
        break;
      }
    }

    return Math.max(streak, 1);
  }, [supabase]);

  return {
    loading,
    logMood,
    getMoodHistory,
    getStreak,
  };
}
