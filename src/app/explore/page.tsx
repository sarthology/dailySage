import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { philosophicalSchools } from "@/lib/philosophy/schools";
import { createClient } from "@/lib/supabase/server";

export default async function ExplorePage() {
  const schools = Object.entries(philosophicalSchools);

  // Try to get user's primary school for personalized view
  let primarySchool: string | null = null;
  let unlockedSchools: string[] = [];
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("philosophical_profile")
        .eq("id", user.id)
        .single();

      if (profile?.philosophical_profile) {
        const pp = profile.philosophical_profile as any;
        primarySchool = pp.primarySchool?.toLowerCase() || null;
      }

      // Get unlocked schools from paths
      const { data: paths } = await supabase
        .from("philosophical_paths")
        .select("school")
        .eq("user_id", user.id);

      if (paths) {
        unlockedSchools = paths.map((p: any) => p.school);
      }
    }
  } catch {
    // Non-critical — show default layout
  }

  // Separate primary school from others
  const primaryEntry = primarySchool
    ? schools.find(([key]) => key === primarySchool)
    : null;
  const otherSchools = primarySchool
    ? schools.filter(([key]) => key !== primarySchool)
    : schools;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-12 text-center">
          <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted">
            Explore
          </p>
          <h1 className="text-h1 mb-4 text-ink">Schools of Thought</h1>
          <p className="text-body mx-auto max-w-lg text-muted">
            Seven philosophical traditions, each offering a different lens for
            understanding yourself and the world.
          </p>
        </div>

        {/* Primary school featured card */}
        {primaryEntry && (
          <div className="mb-8">
            <p className="text-caption mb-3 uppercase tracking-[0.2em] text-sage font-semibold">
              Your Path
            </p>
            <Link
              href={`/explore/${primaryEntry[0]}`}
              className="group block rounded-lg border-2 border-accent/30 bg-paper-light p-8 transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-4">
                <span className={`stamp text-${primaryEntry[1].color}`}>
                  {primaryEntry[1].name}
                </span>
              </div>
              <p className="font-mono text-xs text-muted mb-3">
                {primaryEntry[1].era}
              </p>
              <p className="text-body text-ink leading-relaxed">
                {primaryEntry[1].core}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {primaryEntry[1].bestFor.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm bg-paper px-2 py-0.5 text-[0.7rem] font-mono text-muted"
                  >
                    {tag.replace("_", " ")}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-body-sm text-muted">
                {primaryEntry[1].philosophers.join(", ")}
              </div>
            </Link>
          </div>
        )}

        {/* Other schools */}
        {primarySchool && (
          <p className="text-caption mb-4 uppercase tracking-[0.2em] text-muted">
            Other Traditions
          </p>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {otherSchools.map(([key, school]) => {
            const isUnlocked = unlockedSchools.includes(key);
            return (
              <Link
                key={key}
                href={`/explore/${key}`}
                className={`group rounded-lg border bg-paper-light p-6 transition-shadow duration-300 hover:shadow-md ${
                  primarySchool && !isUnlocked
                    ? "border-muted-light/50 opacity-70"
                    : "border-muted-light"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className={`stamp text-${school.color}`}>
                    {school.name}
                  </span>
                  {primarySchool && !isUnlocked && (
                    <span className="rounded-sm bg-muted-light/50 px-2 py-0.5 text-[0.65rem] font-mono text-muted">
                      Explore Later
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-muted mb-3">{school.era}</p>
                <p className="text-body-sm text-ink leading-relaxed">
                  {school.core}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {school.bestFor.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm bg-paper px-2 py-0.5 text-[0.7rem] font-mono text-muted"
                    >
                      {tag.replace("_", " ")}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-body-sm text-muted">
                  {school.philosophers.slice(0, 3).join(", ")}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
