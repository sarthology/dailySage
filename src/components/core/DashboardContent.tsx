"use client";

import { useState } from "react";
import Link from "next/link";
import { MoodCanvas } from "@/components/core/MoodCanvas";
import { MoodTimeline } from "@/components/core/MoodTimeline";
import { QuoteBlock } from "@/components/core/QuoteBlock";
import { useMood } from "@/hooks/useMood";
import type { MoodVector } from "@/types/mood";
import type { SessionRow, MoodLogRow } from "@/lib/supabase/types";
import type { SchoolProgress } from "@/lib/philosophy/path-tracking";
import { philosophicalSchools } from "@/lib/philosophy/schools";
import type { PhilosophicalSchool } from "@/types/philosophy";

interface DashboardContentProps {
  streak: number;
  recentSessions: SessionRow[];
  recentMoods: MoodLogRow[];
  schoolProgress: SchoolProgress[];
  welcomeQuote?: { text: string; source?: string; philosopher: string };
}

export function DashboardContent({
  streak,
  recentSessions,
  recentMoods,
  schoolProgress,
  welcomeQuote,
}: DashboardContentProps) {
  const [mood, setMood] = useState<MoodVector>({ x: 0, y: 0 });
  const [moodLogged, setMoodLogged] = useState(false);
  const { logMood } = useMood();

  async function handleStartSession() {
    if (!moodLogged) {
      await logMood(mood, undefined, "dashboard_checkin");
      setMoodLogged(true);
    }
  }

  const defaultQuote = {
    text: "We suffer more often in imagination than in reality.",
    philosopher: "Seneca",
    source: "Letters to Lucilius",
  };

  const quote = welcomeQuote || defaultQuote;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Mood Check-in Card */}
        <div className="rounded-lg border border-muted-light bg-paper-light p-6">
          <h2 className="text-h3 mb-1 text-ink">How are you today?</h2>
          <p className="text-body-sm mb-6 text-muted">
            A quick check-in to start your day.
          </p>
          <div className="flex flex-col items-center">
            <MoodCanvas value={mood} onChange={setMood} compact />
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/session/new"
              onClick={handleStartSession}
              className="inline-block rounded-md bg-accent px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
            >
              Start a Session
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/journal"
            className="group rounded-lg border border-muted-light bg-paper-light p-5 transition-shadow duration-300 hover:shadow-md"
          >
            <span className="font-mono text-xs font-medium text-sage">Journal</span>
            <h3 className="text-h3 mt-2 text-ink">Write a Reflection</h3>
            <p className="text-body-sm mt-1 text-muted">
              Free-write or use a philosophical prompt.
            </p>
          </Link>
          <Link
            href="/explore"
            className="group rounded-lg border border-muted-light bg-paper-light p-5 transition-shadow duration-300 hover:shadow-md"
          >
            <span className="font-mono text-xs font-medium text-slate">Explore</span>
            <h3 className="text-h3 mt-2 text-ink">Browse Philosophy</h3>
            <p className="text-body-sm mt-1 text-muted">
              Discover schools of thought and exercises.
            </p>
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Streak */}
        <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted">
            Current Streak
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-ink">{streak}</p>
          <p className="text-body-sm text-muted">
            {streak === 1 ? "day" : "days"}
          </p>
        </div>

        {/* Mood Timeline (compact) */}
        {recentMoods.length > 0 && (
          <div className="rounded-lg border border-muted-light bg-paper-light p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h4 text-ink">Mood Trend</h3>
              <Link href="/journal" className="font-mono text-xs text-muted hover:text-ink transition-colors">
                View all &rarr;
              </Link>
            </div>
            <MoodTimeline moods={recentMoods} days={14} compact />
          </div>
        )}

        {/* Quote of the Day */}
        <QuoteBlock
          text={quote.text}
          philosopher={quote.philosopher}
          source={quote.source}
        />

        {/* Path Progress */}
        {schoolProgress.length > 0 && (
          <div className="rounded-lg border border-muted-light bg-paper-light p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h4 text-ink">Your Path</h3>
              <Link href="/paths" className="font-mono text-xs text-muted hover:text-ink transition-colors">
                Journey &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {schoolProgress.map((progress) => {
                const schoolDef = philosophicalSchools[progress.school as PhilosophicalSchool];
                return (
                  <div key={progress.school}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-body-sm font-medium text-ink">
                        {schoolDef?.name || progress.school}
                      </p>
                      <p className="font-mono text-xs text-muted">
                        Lvl {Math.round(progress.avgMastery)}
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted-light overflow-hidden">
                      <div
                        className="h-full rounded-full bg-warm transition-all duration-500"
                        style={{ width: `${(progress.avgMastery / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="rounded-lg border border-muted-light bg-paper-light p-5">
          <h3 className="text-h4 mb-3 text-ink">Recent Sessions</h3>
          {recentSessions.length === 0 ? (
            <p className="text-body-sm text-muted italic">
              No sessions yet. Start your first one above.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/session/${session.id}`}
                  className="block rounded-md border border-muted-light p-3 transition-colors hover:bg-paper"
                >
                  <p className="text-body-sm font-medium text-ink">
                    {session.title || "Coaching Session"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        session.status === "active" ? "bg-sage" : "bg-muted"
                      }`}
                    />
                    <p className="font-mono text-xs text-muted">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
