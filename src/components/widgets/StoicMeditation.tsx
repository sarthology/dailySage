"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface StoicMeditationProps {
  title: string;
  description: string;
  content: {
    steps?: { instruction: string; duration_seconds: number }[];
    technique?: string;
    total_duration_seconds?: number;
  };
  philosopher?: { name: string; school: string; relevance: string };
}

type Phase = "idle" | "active" | "complete";

export function StoicMeditation({
  title,
  description,
  content,
  philosopher,
}: StoicMeditationProps) {
  const steps = content.steps || [
    { instruction: "Close your eyes and settle into stillness.", duration_seconds: 10 },
    { instruction: "Observe your thoughts without judgment.", duration_seconds: 15 },
    { instruction: "Return your focus to your breath.", duration_seconds: 10 },
  ];

  const [phase, setPhase] = useState<Phase>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const stepDuration = steps[currentStep]?.duration_seconds || 10;
  const totalDuration = steps.reduce((sum, s) => sum + s.duration_seconds, 0);
  const totalElapsed =
    steps.slice(0, currentStep).reduce((sum, s) => sum + s.duration_seconds, 0) + elapsed;
  const overallProgress = totalDuration > 0 ? totalElapsed / totalDuration : 0;

  const advanceStep = useCallback(() => {
    setElapsed(0);
    setCurrentStep((prev) => {
      if (prev + 1 >= steps.length) {
        setPhase("complete");
        return prev;
      }
      return prev + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (phase !== "active") return;

    const interval = setInterval(() => {
      setElapsed((t) => {
        if (t + 1 >= stepDuration) {
          advanceStep();
          return 0;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, stepDuration, advanceStep]);

  function start() {
    setCurrentStep(0);
    setElapsed(0);
    setPhase("active");
  }

  const stepProgress = stepDuration > 0 ? elapsed / stepDuration : 0;

  // SVG progress ring
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - overallProgress);

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-sage uppercase tracking-wider">
        Stoic Meditation
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 mb-6 text-muted">{description}</p>

      <div className="flex flex-col items-center py-6">
        {phase === "idle" && (
          <>
            {content.technique && (
              <p className="text-body-sm text-muted mb-4 text-center max-w-sm">
                {content.technique}
              </p>
            )}
            <p className="text-caption text-muted mb-4">
              {steps.length} steps &middot; ~{Math.ceil(totalDuration / 60)} min
            </p>
            <Button
              onClick={start}
              className="rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
            >
              Begin Meditation
            </Button>
          </>
        )}

        {phase === "active" && (
          <>
            {/* SVG progress ring */}
            <div className="relative">
              <svg width="150" height="150" className="-rotate-90">
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted-light"
                />
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-sage transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-mono text-2xl text-ink">
                  {stepDuration - elapsed}
                </p>
                <p className="font-mono text-xs text-muted">sec</p>
              </div>
            </div>

            <p className="font-display text-base text-ink mt-4 text-center max-w-sm leading-relaxed">
              {steps[currentStep].instruction}
            </p>

            <div className="mt-4 flex items-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                    i < currentStep
                      ? "bg-sage"
                      : i === currentStep
                        ? "bg-sage/50"
                        : "bg-muted-light"
                  }`}
                />
              ))}
            </div>

            <p className="text-caption mt-2 text-muted">
              Step {currentStep + 1} of {steps.length}
            </p>
          </>
        )}

        {phase === "complete" && (
          <div className="text-center">
            <p className="font-display text-lg text-ink">Meditation complete.</p>
            <p className="text-body-sm mt-2 text-muted">
              Take a moment before returning to your day.
            </p>
            <Button
              onClick={start}
              variant="outline"
              className="mt-4 rounded-md border-2 border-ink px-6 py-2 text-sm font-semibold text-ink"
            >
              Repeat
            </Button>
          </div>
        )}
      </div>

      {philosopher && (
        <div className="mt-4 border-t border-muted-light pt-4">
          <p className="text-caption text-muted">
            <span className="font-semibold">{philosopher.name}</span> &middot; {philosopher.school}
          </p>
          <p className="text-body-sm mt-1 italic text-muted">{philosopher.relevance}</p>
        </div>
      )}
    </div>
  );
}
