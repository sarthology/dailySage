import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/lib/supabase/types";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: entriesData } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const entries = (entriesData || []) as JournalEntry[];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-caption mb-1 uppercase tracking-[0.2em] text-muted">
              Journal
            </p>
            <h1 className="text-h1 text-ink">Your Reflections</h1>
          </div>
          <Link
            href="/journal/new"
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
          >
            New Entry
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-muted-light bg-paper-light p-12 text-center">
            <p className="font-display text-lg italic text-muted">
              &ldquo;The unexamined life is not worth living.&rdquo;
            </p>
            <p className="text-caption mt-3 text-muted">— Socrates</p>
            <p className="text-body-sm mt-6 text-muted">
              Your journal is empty. Start writing to track your philosophical journey.
            </p>
            <Link
              href="/journal/new"
              className="mt-4 inline-block rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              Write Your First Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="block rounded-lg border border-muted-light bg-paper-light p-6 transition-shadow duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-ink line-clamp-2">
                      {entry.content.slice(0, 200)}
                      {entry.content.length > 200 ? "..." : ""}
                    </p>
                    {entry.philosophical_tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {entry.philosophical_tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-paper px-2 py-0.5 font-mono text-xs text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-xs text-muted">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                    {entry.ai_reflection && (
                      <span className="mt-1 inline-block font-mono text-xs text-sage">
                        reflected
                      </span>
                    )}
                  </div>
                </div>
                {entry.prompt && (
                  <p className="mt-2 text-caption italic text-muted">
                    Prompt: &ldquo;{entry.prompt.slice(0, 60)}...&rdquo;
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
