import { generateObject } from "ai";
import { getModel } from "@/lib/llm/provider";
import { z } from "zod";

const moodAnalysisSchema = z.object({
  label: z.string(),
  dominantEmotion: z.string(),
  suggestedSchool: z.string(),
  briefInsight: z.string(),
});

export async function POST(req: Request) {
  const { moodVector, userMessage } = await req.json();

  const { object } = await generateObject({
    model: getModel(),
    schema: moodAnalysisSchema,
    prompt: `Analyze this mood input. Mood position: x=${moodVector.x} (negative↔positive), y=${moodVector.y} (low↔high energy). ${userMessage ? `User also said: "${userMessage}"` : ""}

Return a label (e.g., "anxious but hopeful"), dominant emotion, the most relevant philosophical school, and a brief 1-sentence insight.`,
  });

  return Response.json(object);
}
