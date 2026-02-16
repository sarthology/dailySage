import { generateText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { sessionId, firstMessage } = await req.json();

    if (!sessionId || !firstMessage) {
      return Response.json({ error: "Missing sessionId or firstMessage" }, { status: 400 });
    }

    const { text } = await generateText({
      model: getModel(),
      prompt: `Generate a short title (3-6 words) for a philosophical coaching session that starts with the user saying: "${firstMessage}". Return ONLY the title, nothing else. No quotes, no punctuation at the end.`,
    });

    const title = text.trim().replace(/^["']|["']$/g, "").replace(/\.$/, "");

    const supabase = await createClient();
    await supabase
      .from("sessions")
      .update({ title })
      .eq("id", sessionId);

    return Response.json({ title });
  } catch {
    return Response.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
