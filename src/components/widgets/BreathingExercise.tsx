"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface BreathingExerciseProps {
  title: string;
  description: string;
  content: {
    inhale_seconds?: number;
    hold_seconds?: number;
    exhale_seconds?: number;
    cycles?: number;
    technique?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
}

type Phase = "idle" | "inhale" | "hold" | "exhale" | "complete";

export function BreathingExercise({
  title,
  description,
  content,
  philosopher,
}: BreathingExerciseProps) {
  const inhale = content.inhale_seconds || 4;
  const hold = content.hold_seconds || 4;
  const exhale = content.exhale_seconds || 6;
  const totalCycles = content.cycles || 4;

  const [phase, setPhase] = useState<Phase>("idle");
  const [cycle, setCycle] = useState(0);
  const [timer, setTimer] = useState(0);

  const currentDuration = phase === "inhale" ? inhale : phase === "hold" ? hold : exhale;

  const advancePhase = useCallback(() => {
    setPhase((prev) => {
      if (prev === "inhale") return "hold";
      if (prev === "hold") return "exhale";
      if (prev === "exhale") {
        setCycle((c) => {
          if (c + 1 >= totalCycles) {
            return c + 1;
          }
          return c + 1;
        });
        return "inhale";
      }
      return prev;
    });
    setTimer(0);
  }, [totalCycles]);

  useEffect(() => {
    if (phase === "idle" || phase === "complete") return;

    if (cycle >= totalCycles) {
      setPhase("complete");
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t + 1 >= currentDuration) {
          advancePhase();
          return 0;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, cycle, totalCycles, currentDuration, advancePhase]);

  function start() {
    setCycle(0);
    setTimer(0);
    setPhase("inhale");
  }

  const progress = phase !== "idle" && phase !== "complete" ? timer / currentDuration : 0;

  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-sage uppercase tracking-wider">
        Breathing Exercise
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 mb-6 text-muted">{description}</p>

      <div className="flex flex-col items-center py-6">
        {phase === "idle" && (
          <Button
            onClick={start}
            className="rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
          >
            Begin
          </Button>
        )}

        {phase !== "idle" && phase !== "complete" && (
          <>
            {/* Breathing circle */}
            <div
              className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-sage/30 transition-transform duration-1000 ease-in-out"
              style={{
                transform: phase === "inhale" ? `scale(${1 + progress * 0.3})` : phase === "exhale" ? `scale(${1.3 - progress * 0.3})` : "scale(1.3)",
              }}
            >
              <div className="text-center">
                <p className="font-display text-lg font-semibold capitalize text-ink">
                  {phase}
                </p>
                <p className="font-mono text-2xl text-ink mt-1">
                  {currentDuration - timer}
                </p>
              </div>
            </div>
            <p className="text-caption mt-4 text-muted">
              Cycle {Math.min(cycle + 1, totalCycles)} of {totalCycles}
            </p>
          </>
        )}

        {phase === "complete" && (
          <div className="text-center">
            <p className="font-display text-lg text-ink">Well done.</p>
            <p className="text-body-sm mt-2 text-muted">
              {totalCycles} cycles completed. How do you feel?
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
