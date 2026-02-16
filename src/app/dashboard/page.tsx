import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardContent } from "@/components/core/DashboardContent";
import { createClient } from "@/lib/supabase/server";
import { aggregateSchoolProgress } from "@/lib/philosophy/path-tracking";
import type { Profile, SessionRow, MoodLogRow, PhilosophicalPathRow } from "@/lib/supabase/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
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

  // Redirect to onboarding if not complete
  if (!profile?.onboarding_complete) {
    redirect("/onboarding");
  }

  // Fetch recent sessions
  const { data: sessionsData } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentSessions = (sessionsData || []) as SessionRow[];

  // Fetch recent moods for streak calculation + timeline
  const { data: moodsData } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(90);

  const recentMoods = (moodsData || []) as MoodLogRow[];

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = new Set(
    recentMoods.map((m) => {
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
  streak = Math.max(streak, 1);

  // Fetch philosophical paths for progress
  const { data: pathsData } = await supabase
    .from("philosophical_paths")
    .select("*")
    .eq("user_id", user.id);

  const paths = (pathsData || []) as PhilosophicalPathRow[];
  const schoolProgress = aggregateSchoolProgress(paths).slice(0, 3);

  // Pick a quote based on philosophical profile
  const philosophicalProfile = profile.philosophical_profile as {
    welcomeQuote?: { text: string; source?: string; philosopher: string };
  } | null;

  const greeting = getGreeting();
  const displayName = profile.display_name || "seeker";

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <p className="text-caption mb-1 uppercase tracking-[0.2em] text-muted">
            Dashboard
          </p>
          <h1 className="text-h1 text-ink">{greeting}, {displayName}.</h1>
        </div>

        <DashboardContent
          streak={streak}
          recentSessions={recentSessions}
          recentMoods={recentMoods}
          schoolProgress={schoolProgress}
          welcomeQuote={philosophicalProfile?.welcomeQuote}
        />
      </main>
    </div>
  );
}
