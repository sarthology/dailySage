import { generateText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { journalReflectionPrompt } from "@/lib/llm/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { entryId, content, recentMoods } = await req.json();

  // Generate reflection
  const { text } = await generateText({
    model: getModel(),
    prompt: journalReflectionPrompt(content, recentMoods),
  });

  // Generate philosophical tags
  let tags: string[] = [];
  try {
    const { text: tagText } = await generateText({
      model: getModel(),
      prompt: `Based on this journal entry, return 2-4 philosophical tags as a JSON array of strings. Tags should be short (1-3 words) and reference philosophical concepts, schools, or themes. Return ONLY the JSON array, nothing else.\n\nEntry: "${content}"`,
    });

    const parsed = JSON.parse(tagText.trim());
    if (Array.isArray(parsed)) {
      tags = parsed.slice(0, 4).map((t: any) => String(t));
    }
  } catch {
    // Tag generation is non-critical
  }

  // Write the AI reflection and tags back to the journal entry
  if (entryId) {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = { ai_reflection: text };
    if (tags.length > 0) {
      updateData.philosophical_tags = tags;
    }
    await supabase
      .from("journal_entries")
      .update(updateData)
      .eq("id", entryId);
  }

  return Response.json({ reflection: text, tags });
}
