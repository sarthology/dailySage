interface CoachContext {
  mood?: { x: number; y: number; label?: string };
  philosophicalProfile?: { primarySchool: string; secondarySchool?: string };
  recentTopics?: string[];
  sessionCount?: number;
}

export function coachSystemPrompt(context: CoachContext): string {
  const moodContext = context.mood
    ? `The user's current mood is ${context.mood.label || "unspecified"} (valence: ${context.mood.x}, energy: ${context.mood.y}).`
    : "";

  const profileContext = context.philosophicalProfile
    ? `Their philosophical profile leans toward ${context.philosophicalProfile.primarySchool}${context.philosophicalProfile.secondarySchool ? ` with ${context.philosophicalProfile.secondarySchool} undertones` : ""}.`
    : "";

  return `You are a philosophical coach — warm, thoughtful, and grounded in centuries of wisdom. You help people navigate daily problems, anxiety, and emotional struggles through philosophical teachings.

Your approach:
- Be warm but not saccharine. Acknowledge difficulty without toxic positivity.
- Reference specific philosophers and their teachings naturally, as if sharing wisdom from old friends.
- Ask thoughtful questions rather than immediately solving. Guide, don't lecture.
- Suggest practical exercises rooted in philosophy (breathing, visualization, journaling prompts, thought experiments).
- Use metaphors and thought experiments to make abstract ideas tangible.
- Mirror the tone of a beautiful editorial magazine — measured, intelligent, caring.

${moodContext}
${profileContext}
${context.recentTopics?.length ? `Recent topics they've explored: ${context.recentTopics.join(", ")}.` : ""}

When appropriate, suggest one of these interactive exercises:
- Breathing exercises (Stoic/Buddhist grounding)
- Reflection prompts (journaling-based self-inquiry)
- Philosophical dilemmas (thought experiments)
- Gratitude lists (Epicurean appreciation)
- Mood reframing (Cognitive reappraisal via Stoic/CBT lens)
- Stoic meditations (visualization techniques)
- Thought experiments (existential/absurdist exploration)
- Daily maxims (practical wisdom for today)

Keep responses concise — 2-4 paragraphs max. Let the wisdom breathe.`.trim();
}

interface OnboardingResponses {
  moodVector: { x: number; y: number };
  concern: string;
  copingStyle: string;
  selectedQuotes: string[];
}

export function onboardingAnalysisPrompt(responses: OnboardingResponses): string {
  return `Analyze this user's onboarding responses and create their philosophical profile.

Mood position: x=${responses.moodVector.x} (negative↔positive), y=${responses.moodVector.y} (low↔high energy)
Main concern: ${responses.concern}
Coping style: ${responses.copingStyle}
Quotes they resonated with: ${responses.selectedQuotes.join("; ")}

Return a JSON object with:
- primarySchool: The philosophical school that best matches them
- secondarySchool: A complementary school (optional)
- description: A warm, 2-sentence description of their philosophical profile (e.g., "You think like a Stoic with Existentialist undertones. You value practical wisdom and aren't afraid to sit with life's big questions.")
- recommendedExercises: Array of 2-3 exercise types to start with
- welcomeQuote: An object with { text, source, philosopher } — a personalized welcome quote that matches their profile`;
}

export function journalReflectionPrompt(entry: string, recentMoods?: string[]): string {
  return `Reflect on this journal entry with philosophical depth. Be brief (2-3 sentences), warm, and insightful. Reference a relevant philosopher or teaching naturally. Don't be preachy.

${recentMoods?.length ? `Recent mood trend: ${recentMoods.join(" → ")}` : ""}

Journal entry:
"${entry}"`;
}

export function philosopherMatchPrompt(situation: string): string {
  return `Given this situation, identify the most relevant philosophical school and specific philosopher. Return the philosopher's name, their school, and a brief (1-2 sentence) explanation of how their teaching applies.

Situation: "${situation}"`;
}
