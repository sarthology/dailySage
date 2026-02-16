import { createClient } from "@/lib/supabase/server";
import type { MoodVector, MoodQuadrant } from "@/types/mood";
import type { WidgetType } from "@/types/widget";
import type { WidgetTemplateRow } from "@/lib/supabase/types";
import { getMoodQuadrant } from "@/types/mood";

/**
 * Select a cached widget template based on the user's mood and optional type filter.
 * Prefers less-used templates for variety (ordered by usage_count ASC).
 */
export async function selectTemplate(
  moodVector: MoodVector,
  type?: WidgetType
): Promise<(WidgetTemplateRow & { title?: string; description?: string; philosopher?: Record<string, unknown> }) | null> {
  const supabase = await createClient();
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

  // Pick randomly from the top 5 least-used to add variety
  const pick = data[Math.floor(Math.random() * data.length)] as WidgetTemplateRow;

  return pick;
}

/**
 * Increment usage_count for a template after it's served.
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  const supabase = await createClient();

  // Fetch current count then increment
  const { data } = await supabase
    .from("widget_templates")
    .select("usage_count")
    .eq("id", templateId)
    .single();

  if (data) {
    const current = (data as { usage_count: number }).usage_count;
    await supabase
      .from("widget_templates")
      .update({ usage_count: current + 1 })
      .eq("id", templateId);
  }
}
