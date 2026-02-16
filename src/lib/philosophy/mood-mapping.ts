import type { MoodVector, MoodQuadrant } from "@/types/mood";
import type { PhilosophicalSchool } from "@/types/philosophy";
import type { WidgetType } from "@/types/widget";
import { getMoodQuadrant } from "@/types/mood";

interface QuadrantMapping {
  schools: PhilosophicalSchool[];
  widgets: WidgetType[];
  tone: string;
}

const quadrantMappings: Record<MoodQuadrant, QuadrantMapping> = {
  calm_content: {
    schools: ["epicureanism", "taoism", "buddhism"],
    widgets: ["gratitude_list", "reflection_prompt", "daily_maxim"],
    tone: "appreciative",
  },
  energized_happy: {
    schools: ["existentialism", "pragmatism", "stoicism"],
    widgets: ["thought_experiment", "philosophical_dilemma", "progress_visualization"],
    tone: "exploratory",
  },
  low_struggling: {
    schools: ["stoicism", "absurdism", "buddhism"],
    widgets: ["mood_reframe", "stoic_meditation", "breathing_exercise"],
    tone: "compassionate",
  },
  tense_overwhelmed: {
    schools: ["stoicism", "buddhism", "taoism"],
    widgets: ["breathing_exercise", "stoic_meditation", "mood_reframe"],
    tone: "grounding",
  },
};

export function getSchoolsForMood(vector: MoodVector): PhilosophicalSchool[] {
  const quadrant = getMoodQuadrant(vector);
  return quadrantMappings[quadrant].schools;
}

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
