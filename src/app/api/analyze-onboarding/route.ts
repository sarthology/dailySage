import { generateObject } from "ai";
import { getModel } from "@/lib/llm/provider";
import { philosophicalProfileSchema } from "@/lib/llm/schemas";
import { onboardingAnalysisPrompt } from "@/lib/llm/prompts";

export async function POST(req: Request) {
  const { moodVector, concern, copingStyle, selectedQuotes, familiarityLevel } = await req.json();

  const { object } = await generateObject({
    model: getModel(),
    schema: philosophicalProfileSchema,
    prompt: onboardingAnalysisPrompt({
      moodVector,
      concern,
      copingStyle,
      selectedQuotes,
      familiarityLevel,
    }),
  });

  // Include familiarity level in the response
  return Response.json({ ...object, familiarityLevel: familiarityLevel || "beginner" });
}
