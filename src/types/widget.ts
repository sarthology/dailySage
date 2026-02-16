export type WidgetType =
  | "breathing_exercise"
  | "reflection_prompt"
  | "philosophical_dilemma"
  | "gratitude_list"
  | "mood_reframe"
  | "stoic_meditation"
  | "thought_experiment"
  | "daily_maxim"
  | "progress_visualization"
  | "obstacle_reframe"
  | "values_wheel"
  | "cognitive_distortion"
  | "quote_challenge"
  | "weekly_review"
  | "argument_mapper";

export interface WidgetConfig {
  type: WidgetType;
  title: string;
  description: string;
  content: Record<string, unknown>;
  philosopher?: {
    name: string;
    school: string;
    relevance: string;
  };
  followUp?: string;
}
