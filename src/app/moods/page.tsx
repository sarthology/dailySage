import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MoodTimeline } from "@/components/core/MoodTimeline";
import { createClient } from "@/lib/supabase/server";
import { getMoodQuadrant, getMoodColor } from "@/types/mood";
import type { MoodLogRow } from "@/lib/supabase/types";

export default async function MoodsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: moodsData } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(90);

  const moods = (moodsData || []) as MoodLogRow[];

  // Summary stats
  const totalCheckins = moods.length;

  // Most common quadrant
  const quadrantCounts = new Map<string, number>();
  let totalValence = 0;
  for (const mood of moods) {
    const q = getMoodQuadrant(mood.mood_vector);
    quadrantCounts.set(q, (quadrantCounts.get(q) || 0) + 1);
    totalValence += mood.mood_vector.x;
  }

  let mostCommonQuadrant = "";
  let maxCount = 0;
  for (const [q, count] of quadrantCounts) {
    if (count > maxCount) {
      mostCommonQuadrant = q;
      maxCount = count;
    }
  }

  const avgValence = moods.length > 0 ? totalValence / moods.length : 0;

  // Streak calculation
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const uniqueDays = new Set(
    moods.map((m) => {
      const d = new Date(m.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);
    if (uniqueDays.has(checkDate.getTime())) {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  streak = Math.max(streak, moods.length > 0 ? 1 : 0);

  const quadrantLabels: Record<string, string> = {
    calm_content: "Calm & Content",
    energized_happy: "Energized & Happy",
    low_struggling: "Low & Struggling",
    tense_overwhelmed: "Tense & Overwhelmed",
  };

  const COLOR_MAP: Record<string, string> = {
    sage: "text-sage",
    slate: "text-slate",
    warm: "text-warm",
    muted: "text-muted",
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="text-body-sm text-muted hover:text-ink transition-colors">
            &larr; Dashboard
          </Link>
          <div className="mt-4">
            <p className="text-caption mb-1 uppercase tracking-[0.2em] text-muted">
              Mood History
            </p>
            <h1 className="text-h1 text-ink">Your Emotional Landscape</h1>
          </div>
        </div>

        {moods.length === 0 ? (
          <div className="rounded-lg border border-muted-light bg-paper-light p-12 text-center">
            <p className="font-display text-lg italic text-muted">
              &ldquo;Know thyself.&rdquo;
            </p>
            <p className="text-caption mt-3 text-muted">&mdash; Inscribed at the Temple of Apollo at Delphi</p>
            <p className="text-body-sm mt-6 text-muted">
              Check in on the dashboard to start tracking your mood over time.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
                <p className="font-display text-2xl font-bold text-ink">{totalCheckins}</p>
                <p className="text-caption text-muted mt-1">Check-ins</p>
              </div>
              <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
                <p className="font-display text-2xl font-bold text-ink">{streak}</p>
                <p className="text-caption text-muted mt-1">Day Streak</p>
              </div>
              <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
                <p className="font-display text-lg font-bold text-ink">
                  {avgValence > 0.2 ? "Positive" : avgValence < -0.2 ? "Negative" : "Neutral"}
                </p>
                <p className="text-caption text-muted mt-1">Avg. Valence</p>
              </div>
              <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
                <p className="font-display text-lg font-bold text-ink">
                  {quadrantLabels[mostCommonQuadrant] || "—"}
                </p>
                <p className="text-caption text-muted mt-1">Most Common</p>
              </div>
            </div>

            {/* Timeline chart */}
            <div className="rounded-lg border border-muted-light bg-paper-light p-6">
              <h2 className="text-h3 text-ink mb-1">Last 90 Days</h2>
              <p className="text-body-sm text-muted mb-4">
                Higher dots = more positive mood. Color reflects your emotional quadrant.
              </p>
              <MoodTimeline moods={moods} days={90} />
            </div>

            {/* Recent mood logs */}
            <div>
              <h2 className="text-h3 text-ink mb-4">Recent Check-ins</h2>
              <div className="space-y-3">
                {moods.slice(0, 10).map((mood) => {
                  const quadrant = getMoodQuadrant(mood.mood_vector);
                  const colorName = getMoodColor(quadrant);

                  return (
                    <div
                      key={mood.id}
                      className="flex items-center justify-between rounded-lg border border-muted-light bg-paper-light p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full`}
                          style={{
                            backgroundColor:
                              colorName === "sage"
                                ? "#7a8b6f"
                                : colorName === "slate"
                                  ? "#5b6b7a"
                                  : colorName === "warm"
                                    ? "#b8860b"
                                    : "#8a8275",
                          }}
                        />
                        <div>
                          <p className={`text-body-sm font-medium ${COLOR_MAP[colorName] || "text-muted"}`}>
                            {quadrantLabels[quadrant]}
                          </p>
                          {mood.mood_label && (
                            <p className="text-caption text-muted">{mood.mood_label}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-muted">
                          {new Date(mood.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {mood.context && (
                          <p className="text-caption text-muted">{mood.context}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
