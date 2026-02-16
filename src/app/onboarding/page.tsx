"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoodCanvas } from "@/components/core/MoodCanvas";
import { createClient } from "@/lib/supabase/client";
import type { MoodVector } from "@/types/mood";

const concerns = [
  { value: "work", label: "Work & Career" },
  { value: "relationships", label: "Relationships" },
  { value: "self", label: "Self & Identity" },
  { value: "purpose", label: "Purpose & Meaning" },
  { value: "other", label: "Something else" },
];

const copingStyles = [
  { value: "talk", label: "Talk it out" },
  { value: "push", label: "Push through" },
  { value: "avoid", label: "Avoid & distract" },
  { value: "analyze", label: "Analyze & research" },
];

const sampleQuotes = [
  {
    text: "You have power over your mind — not outside events.",
    philosopher: "Marcus Aurelius",
    school: "Stoicism",
  },
  {
    text: "In the midst of winter, I found there was, within me, an invincible summer.",
    philosopher: "Albert Camus",
    school: "Absurdism",
  },
  {
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    philosopher: "Thich Nhat Hanh",
    school: "Buddhism",
  },
  {
    text: "Nature does not hurry, yet everything is accomplished.",
    philosopher: "Laozi",
    school: "Taoism",
  },
];

type Step = "welcome" | "mood" | "concern" | "coping" | "quotes" | "familiarity" | "result";

const familiarityOptions = [
  { value: "beginner", label: "Never heard of it", description: "That's totally fine — we'll explain everything as we go." },
  { value: "intermediate", label: "I've heard of it", description: "You know the basics. We'll build on that." },
  { value: "advanced", label: "I've studied it", description: "Great — we can go deeper together." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [mood, setMood] = useState<MoodVector>({ x: 0, y: 0 });
  const [concern, setConcern] = useState("");
  const [coping, setCoping] = useState("");
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([]);
  const [familiarity, setFamiliarity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive the matched school from selected quotes
  const matchedSchool = selectedQuotes.length > 0
    ? sampleQuotes[selectedQuotes[0]].school
    : "Stoicism";

  function toggleQuote(index: number) {
    setSelectedQuotes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  async function handleComplete() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated. Please sign in.");
        setLoading(false);
        return;
      }

      // Call the analyze-onboarding API to generate a philosophical profile
      const quoteTexts = selectedQuotes.map((i) => sampleQuotes[i].text);
      const res = await fetch("/api/analyze-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodVector: mood,
          concern,
          copingStyle: coping,
          selectedQuotes: quoteTexts,
          familiarityLevel: familiarity || "beginner",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze onboarding responses");
      }

      const philosophicalProfile = await res.json();

      // Save profile + onboarding status to Supabase (upsert to handle existing or new users)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          onboarding_complete: true,
          philosophical_profile: philosophicalProfile,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Log initial mood
      const intensity = Math.round(
        Math.sqrt(mood.x * mood.x + mood.y * mood.y) * 10
      );

      await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood_vector: mood,
        mood_label: null,
        intensity: Math.min(10, Math.max(1, intensity || 1)),
        context: "onboarding",
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-lg">
        {/* Welcome */}
        {step === "welcome" && (
          <div className="text-center">
            <p className="text-caption mb-6 uppercase tracking-[0.2em] text-muted">
              Welcome
            </p>
            <h1 className="text-h1 mb-4 text-ink">
              Let&apos;s Get to Know You
            </h1>
            <p className="text-body mx-auto mb-10 max-w-md text-muted">
              A few quick questions to match you with the philosophical
              traditions that speak to your situation. Takes about 30 seconds.
            </p>
            <Button
              onClick={() => setStep("mood")}
              className="rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
            >
              Let&apos;s Begin
            </Button>
          </div>
        )}

        {/* Mood Canvas */}
        {step === "mood" && (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 1 of 5
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              How Are You Feeling?
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              Place the pin where you feel right now. Don&apos;t overthink it.
            </p>
            <MoodCanvas value={mood} onChange={setMood} />
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => setStep("concern")}
                className="rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Concern */}
        {step === "concern" && (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 2 of 5
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              What&apos;s on Your Mind?
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              What brought you here today?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {concerns.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setConcern(c.value)}
                  className={`rounded-lg border-2 p-4 text-left text-body-sm font-medium transition-all duration-150 ${
                    concern === c.value
                      ? "border-accent bg-paper-light text-ink"
                      : "border-muted-light bg-paper text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => setStep("mood")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("coping")}
                disabled={!concern}
                className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Coping Style */}
        {step === "coping" && (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 3 of 5
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              How Do You Usually Cope?
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              There&apos;s no wrong answer.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {copingStyles.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCoping(c.value)}
                  className={`rounded-lg border-2 p-4 text-left text-body-sm font-medium transition-all duration-150 ${
                    coping === c.value
                      ? "border-accent bg-paper-light text-ink"
                      : "border-muted-light bg-paper text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => setStep("concern")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("quotes")}
                disabled={!coping}
                className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Quotes */}
        {step === "quotes" && (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 4 of 5
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              What Resonates?
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              Pick 1 or 2 that speak to you.
            </p>
            <div className="space-y-4">
              {sampleQuotes.map((q, i) => (
                <button
                  key={i}
                  onClick={() => toggleQuote(i)}
                  className={`w-full rounded-lg border-2 p-5 text-left transition-all duration-150 ${
                    selectedQuotes.includes(i)
                      ? "border-accent bg-paper-light"
                      : "border-muted-light bg-paper hover:border-ink"
                  }`}
                >
                  <p className="font-display text-base italic leading-relaxed text-ink">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <p className="mt-2 text-caption text-muted">
                    — {q.philosopher} &middot; {q.school}
                  </p>
                </button>
              ))}
            </div>
            {error && (
              <p className="mt-4 text-body-sm text-accent text-center">{error}</p>
            )}
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => setStep("coping")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("familiarity")}
                disabled={selectedQuotes.length === 0}
                className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Familiarity */}
        {step === "familiarity" && (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 5 of 5
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              {matchedSchool} Resonates With You
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              How familiar are you with {matchedSchool}?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {familiarityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFamiliarity(opt.value)}
                  className={`rounded-lg border-2 p-4 text-left transition-all duration-150 ${
                    familiarity === opt.value
                      ? "border-accent bg-paper-light"
                      : "border-muted-light bg-paper hover:border-ink"
                  }`}
                >
                  <p className="text-body-sm font-medium text-ink">
                    {opt.label}
                  </p>
                  <p className="text-caption mt-1 text-muted">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
            {error && (
              <p className="mt-4 text-body-sm text-accent text-center">{error}</p>
            )}
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => setStep("quotes")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!familiarity || loading}
                className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Complete"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
