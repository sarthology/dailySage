"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger, stepSlide, scaleIn, tapScale, editorial } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { MoodCanvas } from "@/components/core/MoodCanvas";
import { createClient } from "@/lib/supabase/client";
import type { MoodVector } from "@/types/mood";
import type { DashboardLayout } from "@/types/dashboard";

/* ─── Onboarding feelings (wider spectrum than dashboard FeelingPicker) ─── */

interface OnboardingFeeling {
  label: string;
  emoji: string;
  vector: MoodVector;
}

const FEELINGS: OnboardingFeeling[] = [
  { label: "Calm", emoji: "😌", vector: { x: 0.3, y: -0.4 } },
  { label: "Grateful", emoji: "🙏", vector: { x: 0.6, y: -0.2 } },
  { label: "Content", emoji: "☺️", vector: { x: 0.4, y: -0.1 } },
  { label: "Happy", emoji: "😊", vector: { x: 0.7, y: 0.3 } },
  { label: "Energized", emoji: "⚡", vector: { x: 0.5, y: 0.8 } },
  { label: "Inspired", emoji: "✨", vector: { x: 0.6, y: 0.6 } },
  { label: "Curious", emoji: "🤔", vector: { x: 0.2, y: 0.3 } },
  { label: "Anxious", emoji: "😰", vector: { x: -0.5, y: 0.6 } },
  { label: "Frustrated", emoji: "😤", vector: { x: -0.4, y: 0.4 } },
  { label: "Overwhelmed", emoji: "🌊", vector: { x: -0.6, y: 0.5 } },
  { label: "Sad", emoji: "😢", vector: { x: -0.6, y: -0.3 } },
  { label: "Lost", emoji: "🌫️", vector: { x: -0.3, y: -0.5 } },
];

/* ─── Intention suggestion chips ─── */

interface Suggestion {
  chip: string;
  sentence: string;
}

const SUGGESTIONS: Suggestion[] = [
  { chip: "Managing anxiety", sentence: "I want to manage my anxiety better and find more calm in my daily life." },
  { chip: "Building daily habits", sentence: "I want to build better daily habits grounded in philosophical wisdom." },
  { chip: "Finding purpose", sentence: "I'm searching for a deeper sense of purpose and meaning in my life." },
  { chip: "Navigating work stress", sentence: "I'm dealing with work stress and want practical tools to handle it." },
  { chip: "Processing relationships", sentence: "I'm working through relationship challenges and need a thoughtful perspective." },
  { chip: "Exploring philosophy", sentence: "I'm curious about Stoic philosophy and want to explore how it applies to modern life." },
];

/* ─── Detailed-path option data (unchanged from original) ─── */

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

const stoicAwarenessOptions = [
  {
    value: "beginner",
    label: "Not really",
    description:
      "That\u2019s perfectly fine \u2014 we\u2019ll introduce you to the Stoics and their practical wisdom as we go.",
  },
  {
    value: "intermediate",
    label: "I've heard of it",
    description:
      "You know the basics \u2014 Marcus Aurelius, controlling what you can. We\u2019ll build on that.",
  },
  {
    value: "advanced",
    label: "I've studied it",
    description:
      "Great \u2014 we can reference specific texts and go deeper into Stoic practice together.",
  },
];

/* ─── Step types ─── */

type Step = "feeling" | "intention" | "mood" | "concern" | "coping" | "stoic_awareness" | "analyzing";

const STEP_ORDER: Step[] = ["feeling", "intention", "mood", "concern", "coping", "stoic_awareness", "analyzing"];

/* ─── Faster stagger for feeling grid ─── */

const fastStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
};

const chipStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

/* ─── Main component ─── */

function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRecreate = searchParams.get("recreate") === "true";

  // Navigation
  const [step, setStep] = useState<Step>("feeling");
  const [direction, setDirection] = useState(0);

  // Step 1: Feeling
  const [selectedFeeling, setSelectedFeeling] = useState<OnboardingFeeling | null>(null);

  // Step 2: Intention (quick path)
  const [freeformGoal, setFreeformGoal] = useState("");

  // Detailed path state
  const [mood, setMood] = useState<MoodVector>({ x: 0, y: 0 });
  const [concern, setConcern] = useState("");
  const [coping, setCoping] = useState("");
  const [familiarity, setFamiliarity] = useState("");

  // Submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goTo = useCallback(
    (next: Step) => {
      setDirection(STEP_ORDER.indexOf(next) > STEP_ORDER.indexOf(step) ? 1 : -1);
      setStep(next);
    },
    [step]
  );

  function handleFeelingSelect(feeling: OnboardingFeeling) {
    setSelectedFeeling(feeling);
    // Pre-position MoodCanvas for detailed path
    setMood(feeling.vector);
    // Auto-advance after a brief visual feedback delay
    setTimeout(() => goTo("intention"), 600);
  }

  function handleSuggestionTap(suggestion: Suggestion) {
    setFreeformGoal(suggestion.sentence);
  }

  async function handleComplete(quickPath: boolean) {
    setLoading(true);
    setError(null);
    goTo("analyzing");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated. Please sign in.");
        setLoading(false);
        goTo(quickPath ? "intention" : "stoic_awareness");
        return;
      }

      const body = quickPath
        ? {
            moodVector: selectedFeeling?.vector || { x: 0, y: 0 },
            freeformGoal,
            familiarityLevel: "beginner",
          }
        : {
            moodVector: mood,
            concern,
            copingStyle: coping,
            familiarityLevel: familiarity || "beginner",
          };

      const res = await fetch("/api/analyze-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze onboarding responses");
      }

      const profile = await res.json();

      const dashboardLayout: DashboardLayout = {
        widgets: (profile.initialDashboardWidgets || []).map(
          (
            w: {
              widgetType: string;
              title: string;
              description?: string;
              args: Record<string, unknown>;
              size: string;
              tags?: string[];
            },
            i: number
          ) => ({
            id: crypto.randomUUID(),
            widgetType: w.widgetType,
            title: w.title,
            description: w.description,
            args: w.args,
            position: i,
            size: w.size || "medium",
            pinned: false,
            source: "onboarding",
            tags: w.tags || [],
            createdAt: new Date().toISOString(),
          })
        ),
        lastModifiedBy: "llm" as const,
        lastModifiedAt: new Date().toISOString(),
      };

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        onboarding_complete: true,
        philosophical_profile: profile,
        dashboard_layout: dashboardLayout,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        throw new Error(profileError.message);
      }

      const finalVector = quickPath ? (selectedFeeling?.vector || { x: 0, y: 0 }) : mood;
      const intensity = Math.round(
        Math.sqrt(finalVector.x * finalVector.x + finalVector.y * finalVector.y) * 10
      );

      await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood_vector: finalVector,
        mood_label: quickPath ? selectedFeeling?.label.toLowerCase() || null : null,
        intensity: Math.min(10, Math.max(1, intensity || 1)),
        context: isRecreate ? "recreate" : "onboarding",
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
      goTo(quickPath ? "intention" : "stoic_awareness");
    }
  }

  function renderStep() {
    switch (step) {
      /* ───────── Step 1: Feeling Picker ───────── */
      case "feeling":
        return (
          <div className="text-center">
            <motion.p
              className="text-caption mb-3 uppercase tracking-[0.25em] text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {isRecreate ? "Reshape Your Dashboard" : "Daily Sage"}
            </motion.p>
            <motion.h1
              className="font-display text-3xl font-bold text-ink md:text-4xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...editorial.enter }}
            >
              How are you feeling right now?
            </motion.h1>
            <motion.p
              className="text-body-sm mx-auto mt-3 mb-10 max-w-md text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              Pick the emotion closest to where you are &mdash; there&apos;s no wrong answer.
            </motion.p>

            <motion.div
              className="mx-auto grid max-w-md grid-cols-3 gap-3 sm:grid-cols-4"
              variants={fastStagger}
              initial="hidden"
              animate="visible"
            >
              {FEELINGS.map((feeling) => {
                const isSelected = selectedFeeling?.label === feeling.label;
                return (
                  <motion.button
                    key={feeling.label}
                    variants={fadeUp}
                    onClick={() => handleFeelingSelect(feeling)}
                    disabled={selectedFeeling !== null}
                    whileHover={selectedFeeling === null ? { scale: 1.05 } : undefined}
                    whileTap={selectedFeeling === null ? { scale: 0.93 } : undefined}
                    animate={
                      selectedFeeling !== null
                        ? isSelected
                          ? { scale: 1.08, opacity: 1 }
                          : { scale: 0.97, opacity: 0.4 }
                        : {}
                    }
                    transition={isSelected ? editorial.spring : editorial.fast}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-4 transition-colors ${
                      isSelected
                        ? "border-2 border-accent bg-accent/8"
                        : "border border-muted-light/60 hover:border-ink/30 hover:bg-paper-light"
                    }`}
                  >
                    <span className="text-3xl leading-none">{feeling.emoji}</span>
                    <span className="font-mono text-[0.65rem] text-muted capitalize">
                      {feeling.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        );

      /* ───────── Step 2: Intention ───────── */
      case "intention":
        return (
          <div>
            <div className="text-center">
              {selectedFeeling && (
                <motion.p
                  className="mb-3 text-sm text-muted"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={editorial.fast}
                >
                  Feeling{" "}
                  <span className="font-medium text-ink">
                    {selectedFeeling.emoji} {selectedFeeling.label}
                  </span>
                </motion.p>
              )}
              <motion.h2
                className="font-display text-2xl font-bold text-ink md:text-3xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, ...editorial.enter }}
              >
                What Brings You Here?
              </motion.h2>
              <motion.p
                className="text-body-sm mx-auto mt-2 mb-6 max-w-md text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                Share what&apos;s on your mind &mdash; or pick a starting point below.
              </motion.p>
            </div>

            {/* Suggestion chips */}
            <motion.div
              className="mx-auto mb-4 flex max-w-lg flex-wrap justify-center gap-2"
              variants={chipStagger}
              initial="hidden"
              animate="visible"
            >
              {SUGGESTIONS.map((s) => (
                <motion.button
                  key={s.chip}
                  variants={fadeUp}
                  onClick={() => handleSuggestionTap(s)}
                  whileTap={tapScale}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider transition-colors ${
                    freeformGoal === s.sentence
                      ? "border-accent/40 bg-accent/8 text-accent"
                      : "border-muted-light text-muted hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  {s.chip}
                </motion.button>
              ))}
            </motion.div>

            {/* Text area */}
            <motion.div
              className="mx-auto max-w-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ...editorial.enter }}
            >
              <textarea
                value={freeformGoal}
                onChange={(e) => setFreeformGoal(e.target.value)}
                placeholder="I want to use philosophy to help me with..."
                rows={4}
                className="w-full resize-none rounded-lg border-2 border-muted-light bg-paper-light p-4 text-body-sm text-ink placeholder:text-muted/50 transition-colors focus:border-accent focus:outline-none"
              />

              {error && (
                <p className="mt-2 text-body-sm text-accent text-center">{error}</p>
              )}

              <div className="mt-6 flex flex-col items-center gap-3">
                <motion.div whileTap={tapScale}>
                  <Button
                    onClick={() => handleComplete(true)}
                    disabled={!freeformGoal.trim() || loading}
                    className="rounded-md bg-accent px-10 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </motion.div>

                <button
                  onClick={() => goTo("mood")}
                  className="font-mono text-xs text-muted transition-colors hover:text-ink"
                >
                  I&apos;d prefer to answer a few questions &rarr;
                </button>
              </div>
            </motion.div>
          </div>
        );

      /* ───────── Detailed Path: Mood Canvas ───────── */
      case "mood":
        return (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 1 of 4
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              Fine-tune Your Mood
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              Drag the pin to adjust where you feel right now. We&apos;ve placed it near{" "}
              <span className="font-medium text-ink">{selectedFeeling?.label || "center"}</span>.
            </p>
            <MoodCanvas value={mood} onChange={setMood} />
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => goTo("intention")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <motion.div whileTap={tapScale}>
                <Button
                  onClick={() => goTo("concern")}
                  className="rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
                >
                  Next
                </Button>
              </motion.div>
            </div>
          </div>
        );

      /* ───────── Detailed Path: Concern ───────── */
      case "concern":
        return (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 2 of 4
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              What&apos;s on Your Mind?
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              What brought you here today?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {concerns.map((c) => (
                <motion.button
                  key={c.value}
                  whileTap={tapScale}
                  onClick={() => setConcern(c.value)}
                  className={`rounded-lg border-2 p-4 text-left text-body-sm font-medium transition-all duration-150 ${
                    concern === c.value
                      ? "border-accent bg-paper-light text-ink"
                      : "border-muted-light bg-paper text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => goTo("mood")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <motion.div whileTap={tapScale}>
                <Button
                  onClick={() => goTo("coping")}
                  disabled={!concern}
                  className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
                >
                  Next
                </Button>
              </motion.div>
            </div>
          </div>
        );

      /* ───────── Detailed Path: Coping ───────── */
      case "coping":
        return (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 3 of 4
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              How Do You Usually Cope?
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              There&apos;s no wrong answer.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {copingStyles.map((c) => (
                <motion.button
                  key={c.value}
                  whileTap={tapScale}
                  onClick={() => setCoping(c.value)}
                  className={`rounded-lg border-2 p-4 text-left text-body-sm font-medium transition-all duration-150 ${
                    coping === c.value
                      ? "border-accent bg-paper-light text-ink"
                      : "border-muted-light bg-paper text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => goTo("concern")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <motion.div whileTap={tapScale}>
                <Button
                  onClick={() => goTo("stoic_awareness")}
                  disabled={!coping}
                  className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
                >
                  Next
                </Button>
              </motion.div>
            </div>
          </div>
        );

      /* ───────── Detailed Path: Stoic Awareness ───────── */
      case "stoic_awareness":
        return (
          <div>
            <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted text-center">
              Step 4 of 4
            </p>
            <h2 className="text-h2 mb-2 text-center text-ink">
              Have You Encountered Stoicism?
            </h2>
            <p className="text-body-sm mb-8 text-center text-muted">
              This helps us tailor the depth of our philosophical conversations.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {stoicAwarenessOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileTap={tapScale}
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
                </motion.button>
              ))}
            </div>
            {error && (
              <p className="mt-4 text-body-sm text-accent text-center">
                {error}
              </p>
            )}
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={() => goTo("coping")}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink"
              >
                Back
              </Button>
              <motion.div whileTap={tapScale}>
                <Button
                  onClick={() => handleComplete(false)}
                  disabled={!familiarity || loading}
                  className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : "Complete"}
                </Button>
              </motion.div>
            </div>
          </div>
        );

      /* ───────── Analyzing ───────── */
      case "analyzing":
        return (
          <motion.div
            className="text-center py-20"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted-light border-t-accent" />
            <p className="text-body mt-6 text-ink">
              {isRecreate
                ? "Rebuilding your dashboard..."
                : "Crafting your personalized dashboard..."}
            </p>
            <p className="text-body-sm mt-2 text-muted">
              Personalizing your experience with exercises and wisdom.
            </p>
          </motion.div>
        );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepSlide}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted-light border-t-accent" />
        </div>
      }
    >
      <OnboardingFlow />
    </Suspense>
  );
}
