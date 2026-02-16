import { streamText, jsonSchema } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/llm/provider";
import { coachSystemPrompt } from "@/lib/llm/prompts";

// Wrapper: converts Zod v4 schemas to JSON Schema since AI SDK v6's Tool interface
// uses `inputSchema` (not `parameters`) and its internal zodToJsonSchema only supports Zod v3.
// We manually convert via Zod v4's native z.toJSONSchema() and wrap with the AI SDK's jsonSchema().
const tool = (config: { description: string; parameters: z.ZodType }) => {
  const raw = z.toJSONSchema(config.parameters) as Record<string, unknown>;
  delete raw["$schema"]; // Anthropic API doesn't expect the $schema meta-property
  return {
    description: config.description,
    inputSchema: jsonSchema(raw),
  };
};
import { createClient } from "@/lib/supabase/server";
import { philosophicalSchools } from "@/lib/philosophy/schools";
import type { PhilosophicalSchool } from "@/types/philosophy";

const schoolNames = Object.keys(philosophicalSchools) as PhilosophicalSchool[];

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // Transform messages from useChat format to streamText format
  const transformedMessages = messages.map((msg: any) => ({
    role: msg.role,
    content: msg.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("") || msg.content || "",
  }));

  const result = streamText({
    model: getModel(),
    system: coachSystemPrompt(context || {}),
    messages: transformedMessages,
    tools: {
      show_breathing_exercise: tool({
        description: "Show an interactive breathing exercise when the user needs to calm down, reduce anxiety, or practice mindfulness",
        parameters: z.object({
          title: z.string().describe("Title for the exercise"),
          description: z.string().describe("Brief context for why this exercise helps"),
          inhaleSeconds: z.number().default(4),
          holdSeconds: z.number().default(7),
          exhaleSeconds: z.number().default(8),
          cycles: z.number().default(3),
        }),
      }),
      show_reflection_prompt: tool({
        description: "Show a guided reflection prompt when the user needs to think deeper about their situation",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          prompt: z.string().describe("The main reflection question"),
          guidingQuestions: z.array(z.string()).describe("2-4 follow-up questions to guide thinking"),
          philosopherName: z.string().optional(),
          philosopherQuote: z.string().optional(),
        }),
      }),
      show_mood_reframe: tool({
        description: "Show a cognitive reframing exercise when the user is stuck in a negative thought pattern",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          originalThought: z.string().describe("The negative thought to reframe"),
          technique: z.string().describe("The reframing technique being used"),
          steps: z.array(z.string()).describe("Step-by-step reframing process"),
          reframedThought: z.string().describe("The reframed perspective"),
        }),
      }),
      show_philosophical_dilemma: tool({
        description: "Present a philosophical thought experiment or dilemma relevant to the user's situation",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          scenario: z.string(),
          optionA: z.object({ label: z.string(), description: z.string() }),
          optionB: z.object({ label: z.string(), description: z.string() }),
          insight: z.string().describe("The philosophical insight this dilemma illustrates"),
        }),
      }),
      show_stoic_meditation: tool({
        description: "Guide the user through a Stoic meditation exercise (view from above, negative visualization, etc.)",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          steps: z.array(z.object({
            instruction: z.string(),
            durationSeconds: z.number(),
          })),
          reflectionPrompt: z.string(),
        }),
      }),
      show_daily_maxim: tool({
        description: "Present a philosophical maxim with explanation and practical application",
        parameters: z.object({
          quote: z.string(),
          philosopher: z.string(),
          school: z.string(),
          explanation: z.string(),
          practicalApplication: z.string(),
        }),
      }),
      show_gratitude_list: tool({
        description: "Guide the user through a gratitude exercise",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          prompt: z.string(),
          minItems: z.number().default(3),
          maxItems: z.number().default(5),
          reflectionOnComplete: z.string(),
        }),
      }),
      show_thought_experiment: tool({
        description: "Present a philosophical thought experiment with questions for the user to consider",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          scenario: z.string(),
          questions: z.array(z.string()),
          insight: z.string(),
          philosopher: z.string().optional(),
        }),
      }),
      show_obstacle_reframe: tool({
        description: "Help the user apply the Stoic dichotomy of control to a specific obstacle",
        parameters: z.object({
          title: z.string(),
          obstacle: z.string().describe("The obstacle the user described"),
          withinControl: z.array(z.string()),
          outsideControl: z.array(z.string()),
          actionPlan: z.string(),
          stoicQuote: z.string().optional(),
        }),
      }),
      show_values_wheel: tool({
        description: "Show an interactive values clarification exercise with life domains",
        parameters: z.object({
          title: z.string(),
          domains: z.array(z.object({
            name: z.string(),
            question: z.string(),
          })).describe("6-8 life domains to rate"),
          reflectionPrompt: z.string(),
        }),
      }),
      show_cognitive_distortion: tool({
        description: "Identify and explain a cognitive distortion in the user's thinking",
        parameters: z.object({
          title: z.string(),
          userThought: z.string(),
          distortionType: z.string(),
          explanation: z.string(),
          philosophicalCounter: z.string(),
          reframedPerspective: z.string(),
        }),
      }),
      show_quote_challenge: tool({
        description: "Present a philosophical quote guessing game to build familiarity",
        parameters: z.object({
          quote: z.string(),
          options: z.array(z.object({
            name: z.string(),
            school: z.string(),
          })).describe("3-4 philosopher options including the correct one"),
          correctIndex: z.number(),
          explanation: z.string(),
        }),
      }),
      show_weekly_review: tool({
        description: "Guide the user through a structured weekly philosophical review",
        parameters: z.object({
          title: z.string(),
          prompts: z.array(z.object({
            question: z.string(),
            placeholder: z.string(),
          })),
          closingReflection: z.string(),
        }),
      }),
      show_argument_mapper: tool({
        description: "Break down the user's worry into premises and conclusion for critical examination",
        parameters: z.object({
          title: z.string(),
          originalStatement: z.string(),
          premises: z.array(z.object({
            text: z.string(),
            challengeQuestion: z.string(),
          })),
          conclusion: z.string(),
          philosophicalAnalysis: z.string(),
        }),
      }),
    },
    async onFinish({ text }) {
      // Auto-unlock philosophical paths based on schools mentioned in the response
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const lowerText = text.toLowerCase();
        for (const school of schoolNames) {
          const schoolDef = philosophicalSchools[school];
          if (
            lowerText.includes(school) ||
            lowerText.includes(schoolDef.name.toLowerCase())
          ) {
            // Fire-and-forget: insert path if not exists
            const { data: existing } = await supabase
              .from("philosophical_paths")
              .select("id")
              .eq("user_id", user.id)
              .eq("school", school)
              .eq("concept", "general")
              .single();

            if (!existing) {
              await supabase.from("philosophical_paths").insert({
                user_id: user.id,
                school,
                concept: "general",
                philosopher: null,
                mastery_level: 0,
                exercises_completed: 0,
              });
            } else {
              // Increment exercise count for existing path
              const { data: path } = await supabase
                .from("philosophical_paths")
                .select("exercises_completed")
                .eq("id", existing.id)
                .single();

              if (path) {
                const newCount = (path as { exercises_completed: number }).exercises_completed + 1;
                const thresholds = [0, 2, 5, 10, 20, 35];
                let mastery = 0;
                for (let level = thresholds.length - 1; level >= 0; level--) {
                  if (newCount >= thresholds[level]) {
                    mastery = level;
                    break;
                  }
                }
                await supabase
                  .from("philosophical_paths")
                  .update({
                    exercises_completed: newCount,
                    mastery_level: mastery,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existing.id);
              }
            }
          }
        }
      } catch {
        // Non-critical — don't break the chat if path tracking fails
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
