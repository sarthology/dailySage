import { streamText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { coachSystemPrompt } from "@/lib/llm/prompts";
import { createClient } from "@/lib/supabase/server";
import { philosophicalSchools } from "@/lib/philosophy/schools";
import type { PhilosophicalSchool } from "@/types/philosophy";

const schoolNames = Object.keys(philosophicalSchools) as PhilosophicalSchool[];

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: getModel(),
    system: coachSystemPrompt(context || {}),
    messages,
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
