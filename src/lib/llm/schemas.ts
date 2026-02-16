import { z } from "zod";

export const widgetSchema = z.object({
  type: z.enum([
    "breathing_exercise",
    "reflection_prompt",
    "philosophical_dilemma",
    "gratitude_list",
    "mood_reframe",
    "stoic_meditation",
    "thought_experiment",
    "daily_maxim",
    "progress_visualization",
    "obstacle_reframe",
    "values_wheel",
    "cognitive_distortion",
    "quote_challenge",
    "weekly_review",
    "argument_mapper",
    "feeling_picker",
    "quick_prompt",
  ]),
  title: z.string(),
  description: z.string(),
  content: z.record(z.string(), z.unknown()),
  philosopher: z
    .object({
      name: z.string(),
      school: z.string(),
      relevance: z.string(),
    })
    .optional(),
  followUp: z.string().optional(),
});

export const coachResponseSchema = z.object({
  message: z.string(),
  suggestedWidgets: z.array(widgetSchema).max(3),
  moodAssessment: z.object({
    detected: z.string(),
    confidence: z.number().min(0).max(1),
    shift: z.enum(["improving", "stable", "declining"]).optional(),
  }),
  philosophicalContext: z
    .object({
      school: z.string(),
      concept: z.string(),
      practicalApplication: z.string(),
    })
    .optional(),
});

export const widgetTypeEnum = z.enum([
  "breathing_exercise",
  "reflection_prompt",
  "philosophical_dilemma",
  "gratitude_list",
  "mood_reframe",
  "stoic_meditation",
  "thought_experiment",
  "daily_maxim",
  "progress_visualization",
  "obstacle_reframe",
  "values_wheel",
  "cognitive_distortion",
  "quote_challenge",
  "weekly_review",
  "argument_mapper",
  "feeling_picker",
  "quick_prompt",
]);

export const customWidgetSchema = z.object({
  widgetType: widgetTypeEnum,
  title: z.string().describe("A clear, engaging title for the widget"),
  description: z.string().describe("A brief description of what this widget does"),
  args: z.record(z.string(), z.unknown()).describe("The full widget configuration args matching the chosen widget type's tool schema"),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  tags: z.array(z.string()).optional().describe("Contextual tags like 'anxiety', 'work', 'morning routine' for filtering history"),
});

export const philosophicalProfileSchema = z.object({
  primarySchool: z.literal("stoicism"),
  description: z.string().describe("A warm 2-sentence description of the user's Stoic profile"),
  stoicConcepts: z
    .array(z.string())
    .describe("3-5 key Stoic concepts to focus on (e.g. dichotomy of control, negative visualization, memento mori, amor fati, premeditatio malorum)"),
  recommendedExercises: z.array(z.string()),
  welcomeQuote: z.object({
    text: z.string(),
    source: z.string().optional(),
    philosopher: z.string(),
  }),
  initialDashboardWidgets: z
    .array(
      z.object({
        widgetType: widgetTypeEnum,
        title: z.string(),
        description: z.string().optional(),
        args: z.record(z.string(), z.unknown()).describe("The full widget configuration/content args matching the widget type"),
        size: z.enum(["small", "medium", "large"]),
        tags: z.array(z.string()).optional().describe("Contextual tags for history filtering, e.g. ['anxiety', 'morning'], ['work', 'daily']"),
      })
    )
    .min(3)
    .max(5)
    .describe("3-5 widgets with a MIX of all 3 types: at least 1 display (Type 1), 1 interactive/data-saving (Type 2), and 1 prompt-to-chat (Type 3)"),
});
