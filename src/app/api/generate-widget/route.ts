import { generateObject, jsonSchema } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/llm/provider";
import { widgetSchema, customWidgetSchema } from "@/lib/llm/schemas";
import { createClient } from "@/lib/supabase/server";
import { hasEnoughCredits, CREDIT_COSTS } from "@/lib/utils/credits";
import { selectTemplate, incrementTemplateUsage } from "@/lib/philosophy/template-selection";

function zodToAiSchema(schema: z.ZodType) {
  const raw = z.toJSONSchema(schema) as Record<string, unknown>;
  delete raw["$schema"];
  return jsonSchema(raw);
}

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user.id)
    .single();

  const credits = (profile as { credits_remaining: number } | null)?.credits_remaining ?? 0;

  // --- Freeform prompt-based generation (from Add Widget modal) ---
  if (body.prompt) {
    if (!hasEnoughCredits(credits, "generate_widget")) {
      return Response.json(
        { error: "Not enough credits to generate a custom widget.", upgrade: true },
        { status: 402 }
      );
    }

    const { object } = await generateObject({
      model: getModel(),
      schema: zodToAiSchema(customWidgetSchema),
      prompt: `You are a Stoic philosophy coach. The user wants a custom dashboard widget. Based on their request, generate an appropriate interactive widget.

User request: "${body.prompt}"

IMPORTANT: The "args" field must contain ALL the configuration needed to render the chosen widget type. Here are the expected args for each widget type:

- breathing_exercise: { title, description, inhaleSeconds, holdSeconds, exhaleSeconds, cycles }
- reflection_prompt: { title, description, prompt, guidingQuestions: string[] }
- daily_maxim: { quote, philosopher, school: "Stoicism", explanation, practicalApplication }
- gratitude_list: { title, description, prompt, minItems, maxItems, reflectionOnComplete }
- mood_reframe: { title, description, originalThought, technique, steps: string[], reframedThought }
- stoic_meditation: { title, description, steps: [{instruction, durationSeconds}], reflectionPrompt }
- thought_experiment: { title, description, scenario, questions: string[], insight, philosopher? }
- obstacle_reframe: { title, obstacle, withinControl: string[], outsideControl: string[], actionPlan, stoicQuote? }
- values_wheel: { title, domains: [{name, question}], reflectionPrompt }
- philosophical_dilemma: { title, description, scenario, optionA: {label, description}, optionB: {label, description}, insight }
- quote_challenge: { quote, options: [{name, school}], correctIndex, explanation }
- weekly_review: { title, prompts: [{question, placeholder}], closingReflection }
- cognitive_distortion: { title, userThought, distortionType, explanation, philosophicalCounter, reframedPerspective }
- argument_mapper: { title, originalStatement, premises: [{text, challengeQuestion}], conclusion, philosophicalAnalysis }

Choose the widget type that best matches the user's request and populate args fully. Keep content Stoic-focused.`,
    });

    await supabase
      .from("profiles")
      .update({ credits_remaining: credits - CREDIT_COSTS.generate_widget })
      .eq("id", user.id);

    return Response.json(object);
  }

  // --- Original mood-based generation (legacy flow) ---
  const { mood, context, sessionHistory } = body;

  if (!hasEnoughCredits(credits, "generate_widget")) {
    const template = await selectTemplate(
      mood || { x: 0, y: 0 },
      undefined
    );

    if (template) {
      incrementTemplateUsage(template.id).catch(() => {});

      const content = template.content as Record<string, unknown>;
      return Response.json({
        type: template.type,
        title: content.title || template.type.replace(/_/g, " "),
        description: content.description || "A curated exercise for you.",
        content,
        cached: true,
      });
    }

    return Response.json(
      { error: "Not enough credits. Upgrade to generate custom exercises.", upgrade: true },
      { status: 402 }
    );
  }

  const { object } = await generateObject({
    model: getModel(),
    schema: zodToAiSchema(widgetSchema),
    prompt: `Based on the user's mood (${JSON.stringify(mood)}) and context (${context || "general check-in"}), generate an appropriate interactive widget that would help them right now. Session history: ${sessionHistory || "new session"}.`,
  });

  await supabase
    .from("profiles")
    .update({ credits_remaining: credits - CREDIT_COSTS.generate_widget })
    .eq("id", user.id);

  return Response.json(object);
}
