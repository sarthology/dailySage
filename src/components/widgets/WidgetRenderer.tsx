"use client";

import type { WidgetConfig } from "@/types/widget";
import { BreathingExercise } from "./BreathingExercise";
import { ReflectionPrompt } from "./ReflectionPrompt";
import { DailyMaxim } from "./DailyMaxim";
import { MoodReframe } from "./MoodReframe";
import { PhilosophicalDilemma } from "./PhilosophicalDilemma";
import { GratitudeList } from "./GratitudeList";
import { StoicMeditation } from "./StoicMeditation";
import { ThoughtExperiment } from "./ThoughtExperiment";
import { ProgressVisualization } from "./ProgressVisualization";

interface WidgetRendererProps {
  config: WidgetConfig;
}

export function WidgetRenderer({ config }: WidgetRendererProps) {
  const props = {
    title: config.title,
    description: config.description,
    content: config.content as Record<string, unknown>,
    philosopher: config.philosopher,
  };

  switch (config.type) {
    case "breathing_exercise":
      return <BreathingExercise {...props} content={config.content as BreathingExerciseContent} />;
    case "reflection_prompt":
      return <ReflectionPrompt {...props} content={config.content as ReflectionPromptContent} />;
    case "daily_maxim":
      return <DailyMaxim {...props} content={config.content as DailyMaximContent} />;
    case "mood_reframe":
      return <MoodReframe {...props} content={config.content as MoodReframeContent} />;
    case "philosophical_dilemma":
      return <PhilosophicalDilemma {...props} content={config.content as PhilosophicalDilemmaContent} />;
    case "gratitude_list":
      return <GratitudeList {...props} content={config.content as GratitudeListContent} />;
    case "stoic_meditation":
      return <StoicMeditation {...props} content={config.content as StoicMeditationContent} />;
    case "thought_experiment":
      return <ThoughtExperiment {...props} content={config.content as ThoughtExperimentContent} />;
    case "progress_visualization":
      return <ProgressVisualization {...props} content={config.content as ProgressVisualizationContent} />;
    default: {
      const _exhaustive: never = config.type;
      return (
        <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
          <span className="font-mono text-xs font-medium text-muted uppercase tracking-wider">
            {String(_exhaustive)}
          </span>
          <h3 className="text-h3 mt-2 text-ink">{config.title}</h3>
          <p className="text-body-sm mt-1 text-muted">{config.description}</p>
        </div>
      );
    }
  }
}

// Content type interfaces for each widget
interface BreathingExerciseContent {
  inhale_seconds?: number;
  hold_seconds?: number;
  exhale_seconds?: number;
  cycles?: number;
  technique?: string;
}

interface ReflectionPromptContent {
  prompt?: string;
  guiding_questions?: string[];
  placeholder?: string;
}

interface DailyMaximContent {
  maxim?: string;
  explanation?: string;
  practical_application?: string;
}

interface MoodReframeContent {
  original_thought?: string;
  reframe?: string;
  technique?: string;
  steps?: string[];
  reflection_prompt?: string;
}

interface PhilosophicalDilemmaContent {
  scenario?: string;
  choice_a?: { label: string; description: string; philosopher?: string; perspective?: string };
  choice_b?: { label: string; description: string; philosopher?: string; perspective?: string };
  insight?: string;
}

interface GratitudeListContent {
  min_items?: number;
  max_items?: number;
  prompt?: string;
  reflection?: string;
}

interface StoicMeditationContent {
  steps?: { instruction: string; duration_seconds: number }[];
  technique?: string;
  total_duration_seconds?: number;
}

interface ThoughtExperimentContent {
  scenario?: string;
  questions?: string[];
  insight?: string;
  further_reading?: string;
}

interface ProgressVisualizationContent {
  stats?: { label: string; value: string | number; detail?: string }[];
  schools?: { name: string; progress: number; sessions: number }[];
  milestones?: { label: string; achieved: boolean; date?: string }[];
}
