import { generateObject } from "ai";
import { getModel } from "@/lib/llm/provider";
import { widgetSchema } from "@/lib/llm/schemas";
import { createClient } from "@/lib/supabase/server";
import { hasEnoughCredits, CREDIT_COSTS } from "@/lib/utils/credits";
import { selectTemplate, incrementTemplateUsage } from "@/lib/philosophy/template-selection";

export async function POST(req: Request) {
  const { mood, context, sessionHistory } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Check user credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user.id)
    .single();

  const credits = (profile as { credits_remaining: number } | null)?.credits_remaining ?? 0;

  // If user doesn't have enough credits, try cached template
  if (!hasEnoughCredits(credits, "generate_widget")) {
    const template = await selectTemplate(
      mood || { x: 0, y: 0 },
      undefined
    );

    if (template) {
      // Increment usage count (fire-and-forget)
      incrementTemplateUsage(template.id).catch(() => {});

      // Return the cached template as a widget config
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

  // User has credits — generate with LLM
  const { object } = await generateObject({
    model: getModel(),
    schema: widgetSchema,
    prompt: `Based on the user's mood (${JSON.stringify(mood)}) and context (${context || "general check-in"}), generate an appropriate interactive widget that would help them right now. Session history: ${sessionHistory || "new session"}.`,
  });

  // Deduct credits
  await supabase
    .from("profiles")
    .update({ credits_remaining: credits - CREDIT_COSTS.generate_widget })
    .eq("id", user.id);

  return Response.json(object);
}
