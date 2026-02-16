"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PhilosophicalPathRow } from "@/lib/supabase/types";
import { calculateMastery, aggregateSchoolProgress, type SchoolProgress } from "@/lib/philosophy/path-tracking";

export function usePaths() {
  const supabase = createClient();

  const getPaths = useCallback(async (): Promise<PhilosophicalPathRow[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("philosophical_paths")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) return [];
    return (data || []) as PhilosophicalPathRow[];
  }, [supabase]);

  const getPathsBySchool = useCallback(
    async (school: string): Promise<PhilosophicalPathRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("philosophical_paths")
        .select("*")
        .eq("user_id", user.id)
        .eq("school", school)
        .order("updated_at", { ascending: false });

      if (error) return [];
      return (data || []) as PhilosophicalPathRow[];
    },
    [supabase]
  );

  const unlockPath = useCallback(
    async (
      school: string,
      concept: string,
      philosopher?: string
    ): Promise<PhilosophicalPathRow | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check if path already exists
      const { data: existing } = await supabase
        .from("philosophical_paths")
        .select("id")
        .eq("user_id", user.id)
        .eq("school", school)
        .eq("concept", concept)
        .single();

      if (existing) return null; // Already unlocked

      const { data, error } = await supabase
        .from("philosophical_paths")
        .insert({
          user_id: user.id,
          school,
          concept,
          philosopher: philosopher || null,
          mastery_level: 0,
          exercises_completed: 0,
        })
        .select()
        .single();

      if (error) return null;
      return data as PhilosophicalPathRow;
    },
    [supabase]
  );

  const incrementExercise = useCallback(
    async (pathId: string): Promise<boolean> => {
      const { data: current, error: fetchError } = await supabase
        .from("philosophical_paths")
        .select("exercises_completed")
        .eq("id", pathId)
        .single();

      if (fetchError || !current) return false;

      const newCount = (current as { exercises_completed: number }).exercises_completed + 1;
      const newMastery = calculateMastery(newCount);

      const { error } = await supabase
        .from("philosophical_paths")
        .update({
          exercises_completed: newCount,
          mastery_level: newMastery,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pathId);

      return !error;
    },
    [supabase]
  );

  const getSchoolProgress = useCallback(async (): Promise<SchoolProgress[]> => {
    const paths = await getPaths();
    return aggregateSchoolProgress(paths);
  }, [getPaths]);

  return {
    getPaths,
    getPathsBySchool,
    unlockPath,
    incrementExercise,
    getSchoolProgress,
  };
}
