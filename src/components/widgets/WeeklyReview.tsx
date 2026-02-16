"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface WeeklyReviewProps {
  title: string;
  prompts: { question: string; placeholder: string }[];
  closingReflection: string;
}

export function WeeklyReview({
  title,
  prompts,
  closingReflection,
}: WeeklyReviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(
    () => new Array(prompts.length).fill("")
  );
  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateResponse(value: string) {
    setResponses((prev) => {
      const next = [...prev];
      next[currentStep] = value;
      return next;
    });
  }

  function handleNext() {
    if (currentStep < prompts.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setCompleted(true);
    }
  }

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-slate uppercase tracking-wider">
        Weekly Review
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>

      {!completed ? (
        <>
          {/* Progress dots */}
          <div className="mt-4 mb-6 flex gap-2">
            {prompts.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentStep
                    ? "bg-accent"
                    : i < currentStep
                      ? "bg-sage"
                      : "bg-muted-light"
                }`}
              />
            ))}
          </div>

          {/* Current prompt */}
          <p className="font-display text-lg text-ink mb-3">
            {prompts[currentStep].question}
          </p>
          <textarea
            value={responses[currentStep]}
            onChange={(e) => updateResponse(e.target.value)}
            placeholder={prompts[currentStep].placeholder}
            rows={4}
            className="w-full rounded-md border border-muted-light bg-paper px-4 py-3 text-body-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none resize-none"
          />

          {/* Navigation */}
          <div className="mt-4 flex gap-3">
            {currentStep > 0 && (
              <Button
                onClick={() => setCurrentStep((s) => s - 1)}
                variant="outline"
                className="rounded-md border-2 border-ink px-6 py-2 text-sm font-semibold text-ink"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!responses[currentStep].trim()}
              className="rounded-md bg-accent px-6 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
            >
              {currentStep < prompts.length - 1 ? "Next" : "Complete"}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Summary */}
          <div className="mt-4 space-y-4">
            {prompts.map((prompt, i) => (
              <div key={i} className="rounded-md border border-muted-light p-4">
                <p className="text-caption text-muted mb-1">{prompt.question}</p>
                <p className="text-body-sm text-ink">{responses[i]}</p>
              </div>
            ))}
          </div>

          <p className="text-body-sm mt-6 italic text-muted">
            {closingReflection}
          </p>

          <Button
            onClick={() => setSaved(true)}
            disabled={saved}
            className="mt-4 rounded-md bg-sage px-6 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-sage/90 disabled:opacity-50"
          >
            {saved ? "Saved to Journal" : "Save to Journal"}
          </Button>
        </>
      )}
    </div>
  );
}
