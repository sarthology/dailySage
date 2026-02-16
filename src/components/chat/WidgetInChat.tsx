"use client";

import { BreathingExercise } from "@/components/widgets/BreathingExercise";
import { ReflectionPrompt } from "@/components/widgets/ReflectionPrompt";
import { MoodReframe } from "@/components/widgets/MoodReframe";
import { PhilosophicalDilemma } from "@/components/widgets/PhilosophicalDilemma";
import { StoicMeditation } from "@/components/widgets/StoicMeditation";
import { DailyMaxim } from "@/components/widgets/DailyMaxim";
import { GratitudeList } from "@/components/widgets/GratitudeList";
import { ThoughtExperiment } from "@/components/widgets/ThoughtExperiment";
import { ObstacleReframe } from "@/components/widgets/ObstacleReframe";
import { ValuesWheel } from "@/components/widgets/ValuesWheel";
import { CognitiveDistortion } from "@/components/widgets/CognitiveDistortion";
import { QuoteChallenge } from "@/components/widgets/QuoteChallenge";
import { WeeklyReview } from "@/components/widgets/WeeklyReview";
import { ArgumentMapper } from "@/components/widgets/ArgumentMapper";

interface WidgetInChatProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
}

export function WidgetInChat({ toolName, args, state }: WidgetInChatProps) {
  // Show loading skeleton while tool args are still streaming
  // AI SDK v6 uses "input-streaming" state (not "partial-call")
  if (state === "input-streaming") {
    return (
      <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4 animate-pulse">
        <div className="h-3 bg-muted-light rounded w-24 mb-3" />
        <div className="h-5 bg-muted-light rounded w-48 mb-2" />
        <div className="h-3 bg-muted-light rounded w-full mb-1" />
        <div className="h-3 bg-muted-light rounded w-3/4" />
      </div>
    );
  }

  const a = args as any;

  switch (toolName) {
    case "show_breathing_exercise":
      return (
        <BreathingExercise
          title={a.title}
          description={a.description}
          content={{
            inhale_seconds: a.inhaleSeconds,
            hold_seconds: a.holdSeconds,
            exhale_seconds: a.exhaleSeconds,
            cycles: a.cycles,
          }}
        />
      );

    case "show_reflection_prompt":
      return (
        <ReflectionPrompt
          title={a.title}
          description={a.description}
          content={{
            prompt: a.prompt,
            guiding_questions: a.guidingQuestions,
          }}
        />
      );

    case "show_mood_reframe":
      return (
        <MoodReframe
          title={a.title}
          description={a.description}
          content={{
            original_thought: a.originalThought,
            technique: a.technique,
            steps: a.steps,
            reframe: a.reframedThought,
          }}
        />
      );

    case "show_philosophical_dilemma":
      return (
        <PhilosophicalDilemma
          title={a.title}
          description={a.description}
          content={{
            scenario: a.scenario,
            choice_a: { label: a.optionA.label, description: a.optionA.description },
            choice_b: { label: a.optionB.label, description: a.optionB.description },
            insight: a.insight,
          }}
        />
      );

    case "show_stoic_meditation":
      return (
        <StoicMeditation
          title={a.title}
          description={a.description}
          content={{
            steps: a.steps?.map((s: any) => ({
              instruction: s.instruction,
              duration_seconds: s.durationSeconds,
            })),
          }}
        />
      );

    case "show_daily_maxim":
      return (
        <DailyMaxim
          title={a.philosopher}
          description={a.school}
          content={{
            maxim: a.quote,
            explanation: a.explanation,
            practical_application: a.practicalApplication,
          }}
        />
      );

    case "show_gratitude_list":
      return (
        <GratitudeList
          title={a.title}
          description={a.description}
          content={{
            prompt: a.prompt,
            min_items: a.minItems,
            max_items: a.maxItems,
            reflection: a.reflectionOnComplete,
          }}
        />
      );

    case "show_thought_experiment":
      return (
        <ThoughtExperiment
          title={a.title}
          description={a.description}
          content={{
            scenario: a.scenario,
            questions: a.questions,
            insight: a.insight,
          }}
          philosopher={a.philosopher ? { name: a.philosopher, school: "", relevance: "" } : undefined}
        />
      );

    // New widgets — flat props matching tool schemas directly
    case "show_obstacle_reframe":
      return (
        <ObstacleReframe
          title={a.title}
          obstacle={a.obstacle}
          withinControl={a.withinControl}
          outsideControl={a.outsideControl}
          actionPlan={a.actionPlan}
          stoicQuote={a.stoicQuote}
        />
      );

    case "show_values_wheel":
      return (
        <ValuesWheel
          title={a.title}
          domains={a.domains}
          reflectionPrompt={a.reflectionPrompt}
        />
      );

    case "show_cognitive_distortion":
      return (
        <CognitiveDistortion
          title={a.title}
          userThought={a.userThought}
          distortionType={a.distortionType}
          explanation={a.explanation}
          philosophicalCounter={a.philosophicalCounter}
          reframedPerspective={a.reframedPerspective}
        />
      );

    case "show_quote_challenge":
      return (
        <QuoteChallenge
          quote={a.quote}
          options={a.options}
          correctIndex={a.correctIndex}
          explanation={a.explanation}
        />
      );

    case "show_weekly_review":
      return (
        <WeeklyReview
          title={a.title}
          prompts={a.prompts}
          closingReflection={a.closingReflection}
        />
      );

    case "show_argument_mapper":
      return (
        <ArgumentMapper
          title={a.title}
          originalStatement={a.originalStatement}
          premises={a.premises}
          conclusion={a.conclusion}
          philosophicalAnalysis={a.philosophicalAnalysis}
        />
      );

    default:
      return (
        <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
          <span className="font-mono text-xs font-medium text-muted uppercase tracking-wider">
            Widget
          </span>
          <p className="text-body-sm mt-2 text-muted">
            Interactive widget: {toolName}
          </p>
        </div>
      );
  }
}
