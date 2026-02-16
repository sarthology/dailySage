import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/lib/supabase/types";

interface JournalEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: entryData, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !entryData) {
    notFound();
  }

  const entry = entryData as JournalEntry;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[800px] px-4 py-8 md:px-8 md:py-12">
        <Link href="/journal" className="text-body-sm text-muted hover:text-ink transition-colors">
          &larr; Back to Journal
        </Link>

        <article className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <p className="font-mono text-xs text-muted">
              {new Date(entry.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {entry.prompt && (
            <div className="mb-6 rounded-md bg-paper-light border border-muted-light p-4">
              <p className="text-label text-muted mb-1">Prompt</p>
              <p className="font-display text-base italic text-ink leading-relaxed">
                &ldquo;{entry.prompt}&rdquo;
              </p>
            </div>
          )}

          <div className="prose-ink">
            <p className="text-body text-ink leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>

          {/* Philosophical tags */}
          {entry.philosophical_tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {entry.philosophical_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-muted-light bg-paper-light px-2.5 py-1 font-mono text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* AI Reflection */}
          {entry.ai_reflection && (
            <div className="mt-8 rounded-lg border border-sage/20 bg-sage/5 p-6">
              <p className="font-mono text-xs font-medium text-sage uppercase tracking-wider mb-3">
                Philosophical Reflection
              </p>
              <p className="text-body text-ink leading-relaxed italic">
                {entry.ai_reflection}
              </p>
            </div>
          )}

          {/* Mood snapshot */}
          {entry.mood_before && (
            <div className="mt-6 rounded-md border border-muted-light bg-paper-light p-4">
              <p className="text-label text-muted mb-1">Mood at time of writing</p>
              <p className="font-mono text-sm text-ink">
                Valence: {(entry.mood_before as { x: number; y: number }).x.toFixed(2)} &middot;
                Energy: {(entry.mood_before as { x: number; y: number }).y.toFixed(2)}
              </p>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
