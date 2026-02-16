"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DataSubtype } from "@/types/widget-behaviors";
import type { WidgetDataRow, JournalEntry, MoodLogRow } from "@/lib/supabase/types";

/** Unified history entry across all data sources */
export interface HistoryEntry {
  id: string;
  dataSubtype: DataSubtype;
  content: Record<string, unknown>;
  tags: string[];
  createdAt: string;
  source: "journal_entries" | "mood_logs" | "widget_data";
}

interface SaveParams {
  dataSubtype: DataSubtype;
  content: Record<string, unknown>;
  tags?: string[];
  widgetInstanceId?: string;
  sessionId?: string;
}

export function useWidgetData() {
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const saveWidgetData = useCallback(
    async (params: SaveParams): Promise<boolean> => {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaving(false);
        return false;
      }

      let success = false;

      if (params.dataSubtype === "journal") {
        const { error } = await supabase.from("journal_entries").insert({
          user_id: user.id,
          content: (params.content.text as string) || "",
          prompt: (params.content.prompt as string) || null,
          session_id: params.sessionId || null,
          tags: params.tags || [],
        });
        success = !error;
      } else if (params.dataSubtype === "mood_log") {
        const vector = params.content.moodVector as {
          x: number;
          y: number;
        } | null;
        if (vector) {
          const intensity = Math.round(
            Math.sqrt(vector.x * vector.x + vector.y * vector.y) * 10
          );
          const { error } = await supabase.from("mood_logs").insert({
            user_id: user.id,
            mood_vector: vector,
            mood_label: (params.content.label as string) || null,
            intensity: Math.min(10, Math.max(1, intensity || 1)),
            context: (params.content.context as string) || null,
            session_id: params.sessionId || null,
            tags: params.tags || [],
          });
          success = !error;
        }
      } else {
        // gratitude, assessment, reframe → widget_data table
        const { error } = await supabase.from("widget_data").insert({
          user_id: user.id,
          widget_instance_id: params.widgetInstanceId || null,
          data_subtype: params.dataSubtype,
          content: params.content,
          tags: params.tags || [],
          session_id: params.sessionId || null,
        });
        success = !error;
      }

      setSaving(false);
      return success;
    },
    [supabase]
  );

  /** Fetch history across all tables, optionally filtered */
  const getHistory = useCallback(
    async (params?: {
      dataSubtype?: DataSubtype;
      tags?: string[];
      limit?: number;
    }): Promise<HistoryEntry[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const limit = params?.limit || 20;
      const entries: HistoryEntry[] = [];

      // Determine which tables to query
      const queryJournal =
        !params?.dataSubtype || params.dataSubtype === "journal";
      const queryMood =
        !params?.dataSubtype || params.dataSubtype === "mood_log";
      const queryWidgetData =
        !params?.dataSubtype ||
        ["gratitude", "assessment", "reframe"].includes(params.dataSubtype);

      const promises: Promise<void>[] = [];

      if (queryJournal) {
        promises.push(
          (async () => {
            let query = supabase
              .from("journal_entries")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(limit);

            if (params?.tags?.length) {
              query = query.overlaps("tags", params.tags);
            }

            const { data } = await query;
            if (data) {
              for (const row of data as JournalEntry[]) {
                entries.push({
                  id: row.id,
                  dataSubtype: "journal",
                  content: { text: row.content, prompt: row.prompt },
                  tags: row.tags || [],
                  createdAt: row.created_at,
                  source: "journal_entries",
                });
              }
            }
          })()
        );
      }

      if (queryMood) {
        promises.push(
          (async () => {
            let query = supabase
              .from("mood_logs")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(limit);

            if (params?.tags?.length) {
              query = query.overlaps("tags", params.tags);
            }

            const { data } = await query;
            if (data) {
              for (const row of data as MoodLogRow[]) {
                entries.push({
                  id: row.id,
                  dataSubtype: "mood_log",
                  content: {
                    moodVector: row.mood_vector,
                    label: row.mood_label,
                    intensity: row.intensity,
                  },
                  tags: (row as MoodLogRow & { tags?: string[] }).tags || [],
                  createdAt: row.created_at,
                  source: "mood_logs",
                });
              }
            }
          })()
        );
      }

      if (queryWidgetData) {
        promises.push(
          (async () => {
            let query = supabase
              .from("widget_data")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(limit);

            if (params?.dataSubtype && params.dataSubtype !== "mood_log" && params.dataSubtype !== "journal") {
              query = query.eq("data_subtype", params.dataSubtype);
            }

            if (params?.tags?.length) {
              query = query.overlaps("tags", params.tags);
            }

            const { data } = await query;
            if (data) {
              for (const row of data as WidgetDataRow[]) {
                entries.push({
                  id: row.id,
                  dataSubtype: row.data_subtype as DataSubtype,
                  content: row.content,
                  tags: row.tags || [],
                  createdAt: row.created_at,
                  source: "widget_data",
                });
              }
            }
          })()
        );
      }

      await Promise.all(promises);

      // Sort all entries by date descending
      entries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return entries.slice(0, limit);
    },
    [supabase]
  );

  /** Get history for a specific widget instance */
  const getWidgetHistory = useCallback(
    async (
      widgetInstanceId: string,
      limit = 5
    ): Promise<HistoryEntry[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("widget_data")
        .select("*")
        .eq("user_id", user.id)
        .eq("widget_instance_id", widgetInstanceId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!data) return [];

      return (data as WidgetDataRow[]).map((row) => ({
        id: row.id,
        dataSubtype: row.data_subtype as DataSubtype,
        content: row.content,
        tags: row.tags || [],
        createdAt: row.created_at,
        source: "widget_data" as const,
      }));
    },
    [supabase]
  );

  return { saving, saveWidgetData, getHistory, getWidgetHistory };
}
