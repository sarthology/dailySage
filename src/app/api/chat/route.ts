import { streamText, jsonSchema } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/llm/provider";
import { coachSystemPrompt } from "@/lib/llm/prompts";
import { createClient } from "@/lib/supabase/server";
import { widgetTypeEnum } from "@/lib/llm/schemas";

// Wrapper: converts Zod v4 schemas to JSON Schema since AI SDK v6's Tool interface
// uses `inputSchema` (not `parameters`) and its internal zodToJsonSchema only supports Zod v3.
const tool = (config: { description: string; parameters: z.ZodType }) => {
  const raw = z.toJSONSchema(config.parameters) as Record<string, unknown>;
  delete raw["$schema"];
  return {
    description: config.description,
    inputSchema: jsonSchema(raw),
  };
};

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const transformedMessages = messages
    .map((msg: { role: string; parts?: Array<{ type: string; text?: string }>; content?: string }) => ({
      role: msg.role,
      content: msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("") || msg.content || "",
    }))
    .filter((msg: { content: string }) => msg.content.length > 0);

  const mode = context?.mode || "dialogue";

  const allTools = {
      // ─── CHAT WIDGETS (inline, ephemeral) ───

      show_breathing_exercise: tool({
        description: "Show an interactive breathing exercise for anxiety, stress, or overwhelm",
        parameters: z.object({
          title: z.string().describe("Title for the exercise"),
          description: z.string().describe("Brief Stoic context for why this exercise helps"),
          inhaleSeconds: z.number().default(4),
          holdSeconds: z.number().default(7),
          exhaleSeconds: z.number().default(8),
          cycles: z.number().default(3),
        }),
      }),
      show_reflection_prompt: tool({
        description: "Show a guided Stoic reflection prompt for self-inquiry",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          prompt: z.string().describe("The main reflection question"),
          guidingQuestions: z.array(z.string()).describe("2-4 follow-up questions"),
          philosopherName: z.string().optional(),
          philosopherQuote: z.string().optional(),
        }),
      }),
      show_mood_reframe: tool({
        description: "Show a Stoic cognitive reframing exercise for negative thought patterns",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          originalThought: z.string(),
          technique: z.string(),
          steps: z.array(z.string()),
          reframedThought: z.string(),
        }),
      }),
      show_philosophical_dilemma: tool({
        description: "Present a Stoic thought experiment or ethical dilemma",
        parameters: z.object({
          title: z.string(),
          description: z.string(),
          scenario: z.string(),
          optionA: z.object({ label: z.string(), description: z.string() }),
          optionB: z.object({ label: z.string(), description: z.string() }),
          insight: z.string(),
        }),
      }),
      show_stoic_meditation: tool({
        description: "Guide the user through a Stoic meditation (view from above, negative visualization, etc.)",
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
        description: "Present a Stoic maxim with explanation and practical application",
        parameters: z.object({
          quote: z.string(),
          philosopher: z.string(),
          school: z.string().default("Stoicism"),
          explanation: z.string(),
          practicalApplication: z.string(),
        }),
      }),
      show_gratitude_list: tool({
        description: "Guide the user through a Stoic gratitude exercise",
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
        description: "Present a Stoic thought experiment for expanding perspective",
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
        description: "Help apply the Stoic dichotomy of control to a specific obstacle",
        parameters: z.object({
          title: z.string(),
          obstacle: z.string(),
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
          })).describe("6-8 life domains"),
          reflectionPrompt: z.string(),
        }),
      }),
      show_cognitive_distortion: tool({
        description: "Identify a cognitive distortion using Stoic reasoning",
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
        description: "A Stoic quote guessing game to build philosophical literacy",
        parameters: z.object({
          quote: z.string(),
          options: z.array(z.object({
            name: z.string(),
            school: z.string().default("Stoicism"),
          })).describe("3-4 Stoic philosopher options"),
          correctIndex: z.number(),
          explanation: z.string(),
        }),
      }),
      show_weekly_review: tool({
        description: "Guide a structured weekly Stoic review",
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
        description: "Break down a worry into premises for Stoic critical examination",
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

      // ─── PROMPT WIDGETS (direct chat triggers) ───

      show_feeling_picker: tool({
        description: "Show a mood feeling picker with icons. User taps a feeling to log mood and start a conversation about it.",
        parameters: z.object({
          feelings: z.array(z.object({
            label: z.string(),
            emoji: z.string(),
            vector: z.object({ x: z.number(), y: z.number() }),
          })).optional().describe("Custom feelings. Omit to use defaults (calm, peaceful, happy, energized, anxious, tense, sad, low, angry, intense)"),
        }),
      }),
      show_quick_prompt: tool({
        description: "Show predefined conversation starter buttons. User taps one to send it as a chat message.",
        parameters: z.object({
          title: z.string().default("Quick Start"),
          prompts: z.array(z.object({
            text: z.string().describe("The prompt text that will be sent to chat"),
            icon: z.string().optional().describe("An emoji icon"),
          })).describe("3-5 conversation starters relevant to the user's situation"),
        }),
      }),

      // ─── DASHBOARD TOOLS (persistent, agent-driven) ───

      add_dashboard_widget: tool({
        description: "Add a persistent widget to the user's dashboard. Use when the user would benefit from an exercise they can return to daily, or when they ask to add something to their dashboard.",
        parameters: z.object({
          widgetType: widgetTypeEnum,
          title: z.string(),
          description: z.string().optional(),
          args: z.record(z.string(), z.unknown()).describe("Full widget configuration/content args"),
          size: z.enum(["small", "medium", "large"]).default("medium"),
          tags: z.array(z.string()).optional().describe("Contextual tags for history filtering, e.g. ['anxiety', 'work', 'morning routine']"),
        }),
      }),
      remove_dashboard_widget: tool({
        description: "Remove a widget from the user's dashboard. Use when a widget has served its purpose or the user asks to remove it.",
        parameters: z.object({
          widgetId: z.string().describe("The ID of the widget to remove"),
          reason: z.string().describe("Brief explanation"),
        }),
      }),
      update_dashboard_widget: tool({
        description: "Update an existing dashboard widget's content. Use when the user's situation evolves.",
        parameters: z.object({
          widgetId: z.string().describe("The ID of the widget to update"),
          updates: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            args: z.record(z.string(), z.unknown()).optional(),
          }),
        }),
      }),
      log_mood: tool({
        description: "Log the user's mood. CRITICAL: You MUST always produce a text response alongside this tool call — never call this tool without also writing a message to the user acknowledging their feelings and asking a follow-up question.",
        parameters: z.object({
          valence: z.number().min(-1).max(1).describe("Negative to positive (-1 to 1)"),
          energy: z.number().min(-1).max(1).describe("Low to high energy (-1 to 1)"),
          label: z.string().describe("Human-readable mood label"),
          context: z.string().describe("What triggered this assessment"),
        }),
      }),
    };

  // Filter tools based on chat mode
  let tools: Record<string, ReturnType<typeof tool>> = allTools;
  if (mode === "discourse") {
    tools = {};
  } else if (mode === "elenchus") {
    tools = {
      show_reflection_prompt: allTools.show_reflection_prompt,
      show_philosophical_dilemma: allTools.show_philosophical_dilemma,
    };
  }

  const result = streamText({
    model: getModel(),
    system: coachSystemPrompt(context || {}),
    messages: transformedMessages,
    tools,
    async onFinish({ text, toolCalls }) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Track Stoic path progress
        const lowerText = text.toLowerCase();
        if (lowerText.includes("stoic") || lowerText.includes("stoicism")) {
          const { data: existing } = await supabase
            .from("philosophical_paths")
            .select("id, exercises_completed")
            .eq("user_id", user.id)
            .eq("school", "stoicism")
            .eq("concept", "general")
            .single();

          if (!existing) {
            await supabase.from("philosophical_paths").insert({
              user_id: user.id,
              school: "stoicism",
              concept: "general",
              philosopher: null,
              mastery_level: 0,
              exercises_completed: 1,
            });
          } else {
            const newCount = (existing as { exercises_completed: number }).exercises_completed + 1;
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
              .eq("id", (existing as { id: string }).id);
          }
        }

        // Handle log_mood tool call server-side
        if (toolCalls) {
          for (const tc of toolCalls) {
            if (tc.toolName === "log_mood") {
              const args = (tc as unknown as { input: Record<string, unknown> }).input as { valence: number; energy: number; label: string; context: string };
              const intensity = Math.round(
                Math.sqrt(args.valence * args.valence + args.energy * args.energy) * 10
              );
              await supabase.from("mood_logs").insert({
                user_id: user.id,
                mood_vector: { x: args.valence, y: args.energy },
                mood_label: args.label,
                intensity: Math.min(10, Math.max(1, intensity || 1)),
                context: args.context,
              });
            }
          }
        }
      } catch {
        // Non-critical
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
