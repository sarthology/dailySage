// Generated types will go here once Supabase CLI is connected.
// For now, define the expected row types manually.

import type { DashboardLayout } from "@/types/dashboard";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean;
  philosophical_profile: Record<string, unknown>;
  preferences: { theme: string; notifications: boolean };
  dashboard_layout: DashboardLayout | null;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  title: string | null;
  status: "active" | "completed" | "archived";
  initial_mood: Record<string, unknown> | null;
  final_mood: Record<string, unknown> | null;
  messages: Record<string, unknown>[];
  widgets_generated: Record<string, unknown>[];
  philosophers_referenced: string[];
  token_count: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  session_id: string | null;
  content: string;
  prompt: string | null;
  mood_before: Record<string, unknown> | null;
  mood_after: Record<string, unknown> | null;
  philosophical_tags: string[];
  ai_reflection: string | null;
  tags: string[];
  created_at: string;
}

export interface MoodLogRow {
  id: string;
  user_id: string;
  session_id: string | null;
  mood_vector: { x: number; y: number };
  mood_label: string | null;
  intensity: number;
  context: string | null;
  tags: string[];
  created_at: string;
}

export interface WidgetDataRow {
  id: string;
  user_id: string;
  session_id: string | null;
  widget_instance_id: string | null;
  data_subtype: "gratitude" | "assessment" | "reframe";
  content: Record<string, unknown>;
  tags: string[];
  created_at: string;
}

export interface PhilosophicalPathRow {
  id: string;
  user_id: string;
  school: string;
  philosopher: string | null;
  concept: string;
  mastery_level: number;
  exercises_completed: number;
  notes: string | null;
  unlocked_at: string;
  updated_at: string;
}

export interface WidgetTemplateRow {
  id: string;
  type: string;
  mood_tags: string[];
  content: Record<string, unknown>;
  usage_count: number;
  created_at: string;
}
