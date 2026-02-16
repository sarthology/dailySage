import { generateText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { journalReflectionPrompt } from "@/lib/llm/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { entryId, content, recentMoods } = await req.json();

  const { text } = await generateText({
    model: getModel(),
    prompt: journalReflectionPrompt(content, recentMoods),
  });

  // Write the AI reflection back to the journal entry
  if (entryId) {
    const supabase = await createClient();
    await supabase
      .from("journal_entries")
      .update({ ai_reflection: text })
      .eq("id", entryId);
  }

  return Response.json({ reflection: text });
}
