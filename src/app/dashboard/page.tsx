import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardWidgetGrid } from "@/components/core/DashboardWidgetGrid";
import { createClient } from "@/lib/supabase/server";
import type { Profile, SessionRow } from "@/lib/supabase/types";
import type { DashboardLayout } from "@/types/dashboard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  if (!profile?.onboarding_complete) {
    redirect("/onboarding");
  }

  // Find or create an active session for the chat panel
  const { data: activeSessionData } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let activeSession = activeSessionData as SessionRow | null;

  if (!activeSession) {
    const { data: newSession } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        status: "active",
        messages: [],
        widgets_generated: [],
        philosophers_referenced: [],
        token_count: 0,
      })
      .select()
      .single();
    activeSession = newSession as SessionRow;
  }

  // Extract profile data
  const philosophicalProfile = profile.philosophical_profile as {
    familiarityLevel?: string;
    stoicConcepts?: string[];
  } | null;

  const dashboardLayout: DashboardLayout = (profile.dashboard_layout as DashboardLayout) || {
    widgets: [],
    lastModifiedBy: "llm",
    lastModifiedAt: new Date().toISOString(),
  };

  const greeting = getGreeting();
  const displayName = profile.display_name || "seeker";

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <DashboardShell
        profileId={profile.id}
        initialLayout={dashboardLayout}
        sessionId={activeSession.id}
        initialMessages={(activeSession.messages || []) as Array<{
          role: "user" | "assistant";
          content: string;
          parts?: unknown[];
          timestamp: string;
        }>}
        familiarityLevel={
          (philosophicalProfile?.familiarityLevel as "beginner" | "intermediate" | "advanced") ||
          "beginner"
        }
        stoicConcepts={philosophicalProfile?.stoicConcepts}
      >
        {/* Dashboard header + widget grid */}
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-caption mb-1 uppercase tracking-[0.2em] text-muted">
                Dashboard
              </p>
              <h1 className="text-h1 text-ink">
                {greeting}, {displayName}.
              </h1>
            </div>
            <Link
              href="/onboarding?recreate=true"
              className="shrink-0 rounded-md border border-muted-light px-4 py-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted transition-colors hover:border-ink hover:text-ink"
            >
              Recreate Dashboard
            </Link>
          </div>
          <DashboardWidgetGrid />
        </div>
      </DashboardShell>
    </div>
  );
}
