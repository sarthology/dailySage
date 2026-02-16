"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MoodVector, MoodQuadrant } from "@/types/mood";
import type { WidgetType } from "@/types/widget";
import type { WidgetTemplateRow } from "@/lib/supabase/types";
import { getMoodQuadrant } from "@/types/mood";

export function useWidgetTemplate() {
  const supabase = createClient();

  /**
   * Get a cached widget template based on mood and optional type.
   * Prefers least-used templates for variety.
   */
  const getTemplate = useCallback(
    async (
      moodVector: MoodVector,
      type?: WidgetType
    ): Promise<WidgetTemplateRow | null> => {
      const quadrant: MoodQuadrant = getMoodQuadrant(moodVector);

      let query = supabase
        .from("widget_templates")
        .select("*")
        .contains("mood_tags", [quadrant])
        .order("usage_count", { ascending: true })
        .limit(5);

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return null;
      }

      // Pick randomly from least-used for variety
      const pick = data[Math.floor(Math.random() * data.length)] as WidgetTemplateRow;

      // Increment usage count (fire-and-forget)
      const current = (pick as { usage_count: number }).usage_count;
      supabase
        .from("widget_templates")
        .update({ usage_count: current + 1 })
        .eq("id", pick.id)
        .then(() => {});

      return pick;
    },
    [supabase]
  );

  /**
   * Seed templates into widget_templates table if it's empty.
   * Utility function for setup.
   */
  const seedTemplates = useCallback(
    async (
      templates: Array<{
        type: string;
        mood_tags: string[];
        content: Record<string, unknown>;
      }>
    ): Promise<{ inserted: number }> => {
      // Check if templates already exist
      const { count } = await supabase
        .from("widget_templates")
        .select("*", { count: "exact", head: true });

      if (count && count > 0) {
        return { inserted: 0 };
      }

      const { data, error } = await supabase
        .from("widget_templates")
        .insert(templates)
        .select();

      if (error) {
        throw new Error(`Failed to seed templates: ${error.message}`);
      }

      return { inserted: data?.length || 0 };
    },
    [supabase]
  );

  return { getTemplate, seedTemplates };
}
