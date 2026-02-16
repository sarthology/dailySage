import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { aggregateSchoolProgress } from "@/lib/philosophy/path-tracking";
import { philosophicalSchools } from "@/lib/philosophy/schools";
import type { Profile, PhilosophicalPathRow } from "@/lib/supabase/types";
import type { PhilosophicalSchool } from "@/types/philosophy";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Fetch stats
  const { count: sessionCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: journalCount } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Calculate streak from mood logs
  const { data: moodsData } = await supabase
    .from("mood_logs")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(90);

  let streak = 0;
  if (moodsData && moodsData.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = new Set(
      moodsData.map((row: { created_at: string }) => {
        const d = new Date(row.created_at);
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
  }
  streak = Math.max(streak, 1);

  // Fetch philosophical paths
  const { data: pathsData } = await supabase
    .from("philosophical_paths")
    .select("*")
    .eq("user_id", user.id);

  const paths = (pathsData || []) as PhilosophicalPathRow[];
  const schoolProgress = aggregateSchoolProgress(paths);

  const masteryLabels = ["Novice", "Beginner", "Student", "Practitioner", "Adept", "Master"];

  const philosophicalProfile = profile?.philosophical_profile as {
    primarySchool?: string;
    secondarySchool?: string;
    description?: string;
  } | null;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[800px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <p className="text-caption mb-1 uppercase tracking-[0.2em] text-muted">
            Profile
          </p>
          <h1 className="text-h1 text-ink">Your Journey</h1>
        </div>

        <div className="space-y-6">
          {/* Philosophical Profile */}
          <div className="rounded-lg border border-muted-light bg-paper-light p-6">
            <h2 className="text-h3 text-ink mb-4">Philosophical Profile</h2>
            {philosophicalProfile?.description ? (
              <div>
                <p className="text-body text-ink leading-relaxed">
                  {philosophicalProfile.description}
                </p>
                <div className="mt-4 flex gap-2">
                  {philosophicalProfile.primarySchool && (
                    <span className="rounded-md bg-accent/10 px-3 py-1 font-mono text-xs font-medium text-accent">
                      {philosophicalProfile.primarySchool}
                    </span>
                  )}
                  {philosophicalProfile.secondarySchool && (
                    <span className="rounded-md bg-slate/10 px-3 py-1 font-mono text-xs font-medium text-slate">
                      {philosophicalProfile.secondarySchool}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-muted italic">
                Complete onboarding to discover your philosophical profile.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
              <p className="font-display text-2xl font-bold text-ink">{sessionCount || 0}</p>
              <p className="text-caption text-muted mt-1">Sessions</p>
            </div>
            <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
              <p className="font-display text-2xl font-bold text-ink">{journalCount || 0}</p>
              <p className="text-caption text-muted mt-1">Journal Entries</p>
            </div>
            <div className="rounded-lg border border-muted-light bg-paper-light p-5 text-center">
              <p className="font-display text-2xl font-bold text-ink">{streak}</p>
              <p className="text-caption text-muted mt-1">
                Day{streak !== 1 ? "s" : ""} Streak
              </p>
            </div>
          </div>

          {/* Philosophical Journey */}
          {schoolProgress.length > 0 && (
            <div className="rounded-lg border border-muted-light bg-paper-light p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 text-ink">Philosophical Journey</h2>
                <Link href="/paths" className="font-mono text-xs text-muted hover:text-ink transition-colors">
                  View all &rarr;
                </Link>
              </div>
              <div className="space-y-3">
                {schoolProgress.map((progress) => {
                  const schoolDef = philosophicalSchools[progress.school as PhilosophicalSchool];
                  const maxMastery = Math.min(5, Math.ceil(progress.avgMastery));

                  return (
                    <div key={progress.school}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-body-sm font-medium text-ink">
                          {schoolDef?.name || progress.school}
                        </p>
                        <p className="font-mono text-xs text-warm">
                          {masteryLabels[maxMastery]} &middot; {progress.totalExercises} exercises
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-muted-light overflow-hidden">
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

          {/* Preferences */}
          <div className="rounded-lg border border-muted-light bg-paper-light p-6">
            <h2 className="text-h3 text-ink mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-medium text-ink">Theme</p>
                  <p className="text-caption text-muted">Light mode (dark mode coming soon)</p>
                </div>
              </div>
              <div className="border-t border-muted-light" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-medium text-ink">Notifications</p>
                  <p className="text-caption text-muted">Daily check-in reminders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="rounded-lg border border-muted-light bg-paper-light p-6">
            <h2 className="text-h3 text-ink mb-2">Credits</h2>
            <p className="font-display text-3xl font-bold text-accent">
              {profile?.credits_remaining ?? 50}
            </p>
            <p className="text-body-sm text-muted mt-1">credits remaining</p>
            <Link
              href="/pricing"
              className="mt-3 inline-block text-body-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Get More Credits &rarr;
            </Link>
          </div>

          {/* Account */}
          <div className="rounded-lg border border-muted-light bg-paper-light p-6">
            <h2 className="text-h3 text-ink mb-4">Account</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-body-sm text-muted">Email</p>
                <p className="font-mono text-xs text-ink">{user.email}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-body-sm text-muted">Member since</p>
                <p className="font-mono text-xs text-ink">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
