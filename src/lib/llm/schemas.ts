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

export const philosophicalProfileSchema = z.object({
  primarySchool: z.string(),
  secondarySchool: z.string().optional(),
  description: z.string(),
  recommendedExercises: z.array(z.string()),
  welcomeQuote: z.object({
    text: z.string(),
    source: z.string().optional(),
    philosopher: z.string(),
  }),
});
