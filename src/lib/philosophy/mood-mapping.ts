import type { MoodVector, MoodQuadrant } from "@/types/mood";
import type { WidgetType } from "@/types/widget";
import { getMoodQuadrant } from "@/types/mood";

interface QuadrantMapping {
  widgets: WidgetType[];
  tone: string;
}

const quadrantMappings: Record<MoodQuadrant, QuadrantMapping> = {
  calm_content: {
    widgets: ["gratitude_list", "reflection_prompt", "daily_maxim"],
    tone: "appreciative",
  },
  energized_happy: {
    widgets: ["thought_experiment", "philosophical_dilemma", "quote_challenge"],
    tone: "exploratory",
  },
  low_struggling: {
    widgets: ["mood_reframe", "stoic_meditation", "breathing_exercise"],
    tone: "compassionate",
  },
  tense_overwhelmed: {
    widgets: ["breathing_exercise", "obstacle_reframe", "argument_mapper"],
    tone: "grounding",
  },
};

export function getWidgetsForMood(vector: MoodVector): WidgetType[] {
  const quadrant = getMoodQuadrant(vector);
  return quadrantMappings[quadrant].widgets;
}

export function getToneForMood(vector: MoodVector): string {
  const quadrant = getMoodQuadrant(vector);
  return quadrantMappings[quadrant].tone;
}

export function getMoodMapping(vector: MoodVector): QuadrantMapping {
  const quadrant = getMoodQuadrant(vector);
  return quadrantMappings[quadrant];
}
