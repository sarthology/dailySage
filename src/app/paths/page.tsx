import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { philosophicalSchools } from "@/lib/philosophy/schools";
import { aggregateSchoolProgress, exercisesForNextLevel } from "@/lib/philosophy/path-tracking";
import type { PhilosophicalPathRow } from "@/lib/supabase/types";
import type { PhilosophicalSchool } from "@/types/philosophy";

export default async function PathsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: pathsData } = await supabase
    .from("philosophical_paths")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const paths = (pathsData || []) as PhilosophicalPathRow[];
  const schoolProgress = aggregateSchoolProgress(paths);

  // Group paths by school
  const pathsBySchool = new Map<string, PhilosophicalPathRow[]>();
  for (const path of paths) {
    const existing = pathsBySchool.get(path.school) || [];
    existing.push(path);
    pathsBySchool.set(path.school, existing);
  }

  const masteryLabels = ["Novice", "Beginner", "Student", "Practitioner", "Adept", "Master"];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <p className="text-caption mb-1 uppercase tracking-[0.2em] text-muted">
            Journey
          </p>
          <h1 className="text-h1 text-ink">Your Philosophical Path</h1>
          <p className="text-body-sm mt-2 text-muted max-w-lg">
            Track your exploration across philosophical traditions. Each coaching session
            and exercise deepens your understanding.
          </p>
        </div>

        {paths.length === 0 ? (
          <div className="rounded-lg border border-muted-light bg-paper-light p-12 text-center">
            <p className="font-display text-lg italic text-muted">
              &ldquo;The journey of a thousand miles begins with a single step.&rdquo;
            </p>
            <p className="text-caption mt-3 text-muted">&mdash; Laozi</p>
            <p className="text-body-sm mt-6 text-muted">
              Start a coaching session to begin your philosophical journey.
              Each conversation unlocks new paths and deepens your mastery.
            </p>
            <Link
              href="/session/new"
              className="mt-4 inline-block rounded-md bg-accent px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
            >
              Start a Session
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall progress summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
                <p className="font-display text-2xl font-bold text-ink">
                  {schoolProgress.length}
                </p>
                <p className="text-caption text-muted mt-1">
                  School{schoolProgress.length !== 1 ? "s" : ""} Explored
                </p>
              </div>
              <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
                <p className="font-display text-2xl font-bold text-ink">
                  {paths.length}
                </p>
                <p className="text-caption text-muted mt-1">
                  Concept{paths.length !== 1 ? "s" : ""} Unlocked
                </p>
              </div>
              <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
                <p className="font-display text-2xl font-bold text-ink">
                  {paths.reduce((sum, p) => sum + p.exercises_completed, 0)}
                </p>
                <p className="text-caption text-muted mt-1">
                  Exercises Completed
                </p>
              </div>
            </div>

            {/* School progress cards */}
            {schoolProgress.map((progress) => {
              const schoolDef = philosophicalSchools[progress.school as PhilosophicalSchool];
              const schoolPaths = pathsBySchool.get(progress.school) || [];
              const maxMastery = Math.max(...schoolPaths.map((p) => p.mastery_level));

              return (
                <div
                  key={progress.school}
                  className="rounded-lg border border-muted-light bg-paper-light p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="mb-2">
                        <span className={`stamp text-${schoolDef?.color || "muted"}`}>
                          {schoolDef?.name || progress.school}
                        </span>
                      </div>
                      <p className="text-body-sm text-muted">
                        {progress.conceptCount} concept{progress.conceptCount !== 1 ? "s" : ""} &middot;{" "}
                        {progress.totalExercises} exercise{progress.totalExercises !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-muted uppercase">Mastery</p>
                      <p className="font-display text-lg font-semibold text-ink">
                        {masteryLabels[maxMastery]}
                      </p>
                    </div>
                  </div>

                  {/* Mastery progress bar */}
                  <div className="mb-4">
                    <div className="h-2 rounded-full bg-muted-light overflow-hidden">
                      <div
                        className="h-full rounded-full bg-warm transition-all duration-500"
                        style={{ width: `${(maxMastery / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="font-mono text-xs text-muted">Level {maxMastery}/5</p>
                      {exercisesForNextLevel(maxMastery) !== null && (
                        <p className="font-mono text-xs text-muted">
                          {exercisesForNextLevel(maxMastery)! -
                            Math.max(...schoolPaths.map((p) => p.exercises_completed))}{" "}
                          exercises to next level
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Concept list */}
                  <div className="space-y-2">
                    {schoolPaths.map((path) => (
                      <div
                        key={path.id}
                        className="flex items-center justify-between rounded-md bg-paper p-3"
                      >
                        <div>
                          <p className="text-body-sm font-medium text-ink capitalize">
                            {path.concept.replace("_", " ")}
                          </p>
                          {path.philosopher && (
                            <p className="text-caption text-muted">{path.philosopher}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-muted">
                            {path.exercises_completed} exercises
                          </p>
                          <p className="font-mono text-xs text-warm">
                            {masteryLabels[path.mastery_level]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Explore more schools */}
            <div className="text-center">
              <Link
                href="/explore"
                className="text-body-sm text-muted hover:text-ink transition-colors"
              >
                Explore more schools &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
