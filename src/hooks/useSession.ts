"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SessionRow } from "@/lib/supabase/types";
import type { MoodVector } from "@/types/mood";

export function useSession() {
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const createSession = useCallback(
    async (initialMood?: MoodVector): Promise<SessionRow | null> => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          status: "active",
          initial_mood: initialMood || null,
          messages: [],
          widgets_generated: [],
          philosophers_referenced: [],
          token_count: 0,
        })
        .select()
        .single();

      setLoading(false);

      if (error) return null;
      return data as SessionRow;
    },
    [supabase]
  );

  const getSession = useCallback(
    async (id: string): Promise<SessionRow | null> => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return null;
      return data as SessionRow;
    },
    [supabase]
  );

  const endSession = useCallback(
    async (id: string, finalMood?: MoodVector): Promise<boolean> => {
      const { error } = await supabase
        .from("sessions")
        .update({
          status: "completed",
          final_mood: finalMood || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return !error;
    },
    [supabase]
  );

  const updateSessionMessages = useCallback(
    async (
      id: string,
      messages: Record<string, unknown>[]
    ): Promise<boolean> => {
      const { error } = await supabase
        .from("sessions")
        .update({
          messages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return !error;
    },
    [supabase]
  );

  const listSessions = useCallback(
    async (limit = 10): Promise<SessionRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return [];
      return (data || []) as SessionRow[];
    },
    [supabase]
  );

  return {
    loading,
    createSession,
    getSession,
    endSession,
    updateSessionMessages,
    listSessions,
  };
}
