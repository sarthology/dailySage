"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger, scaleIn, tapScale, collapseReveal, editorial } from "@/lib/motion";
import { MoodTimeline } from "@/components/core/MoodTimeline";
import { useWidgetData, type HistoryEntry } from "@/hooks/useWidgetData";
import type { DataSubtype } from "@/types/widget-behaviors";
import type { MoodLogRow } from "@/lib/supabase/types";

const QUADRANT_LABELS: Record<string, string> = {
  calm_content: "Calm & Content",
  energized_happy: "Energized & Happy",
  low_struggling: "Low & Struggling",
  tense_overwhelmed: "Tense & Overwhelmed",
};

const SUBTYPE_LABELS: Record<DataSubtype, { label: string; color: string }> = {
  journal: { label: "Journal", color: "slate" },
  mood_log: { label: "Mood", color: "accent" },
  gratitude: { label: "Gratitude", color: "sage" },
  assessment: { label: "Assessment", color: "warm" },
  reframe: { label: "Reframe", color: "accent" },
};

const ALL_SUBTYPES: DataSubtype[] = ["journal", "mood_log", "gratitude", "assessment", "reframe"];

interface JournalContentProps {
  moodStats: {
    totalCheckins: number;
    streak: number;
    avgValence: number;
    mostCommonQuadrant: string;
  };
  recentMoods: MoodLogRow[];
}

export function JournalContent({ moodStats, recentMoods }: JournalContentProps) {
  const { getHistory } = useWidgetData();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubtype, setActiveSubtype] = useState<DataSubtype | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags)));

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getHistory({
        dataSubtype: activeSubtype || undefined,
        tags: activeTag ? [activeTag] : undefined,
        limit: 50,
      });
      setEntries(data);
      setLoading(false);
    }
    load();
  }, [activeSubtype, activeTag, getHistory]);

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-caption mb-1 uppercase tracking-[0.2em] text-muted">
            Journal
          </p>
          <h1 className="text-h1 text-ink">Your Journey</h1>
        </div>
        <motion.div whileTap={tapScale}>
          <Link
            href="/journal/new"
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
          >
            New Entry
          </Link>
        </motion.div>
      </div>

      {/* Mood stats */}
      {moodStats.totalCheckins > 0 && (
        <motion.div
          className="mb-8 grid gap-3 grid-cols-2 sm:grid-cols-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="rounded-lg border border-muted-light bg-paper-light p-4 text-center">
            <p className="font-display text-2xl font-bold text-ink">{moodStats.totalCheckins}</p>
            <p className="text-caption text-muted mt-1">Check-ins</p>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-lg border border-muted-light bg-paper-light p-4 text-center">
            <p className="font-display text-2xl font-bold text-ink">{moodStats.streak}</p>
            <p className="text-caption text-muted mt-1">Day Streak</p>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-lg border border-muted-light bg-paper-light p-4 text-center">
            <p className="font-display text-lg font-bold text-ink">
              {moodStats.avgValence > 0.2 ? "Positive" : moodStats.avgValence < -0.2 ? "Negative" : "Neutral"}
            </p>
            <p className="text-caption text-muted mt-1">Avg. Valence</p>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-lg border border-muted-light bg-paper-light p-4 text-center">
            <p className="font-display text-lg font-bold text-ink">
              {QUADRANT_LABELS[moodStats.mostCommonQuadrant] || "—"}
            </p>
            <p className="text-caption text-muted mt-1">Most Common</p>
          </motion.div>
        </motion.div>
      )}

      {/* Mood timeline */}
      {recentMoods.length > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8 rounded-lg border border-muted-light bg-paper-light p-5"
        >
          <h3 className="text-h4 text-ink mb-3">Mood Trend</h3>
          <MoodTimeline moods={recentMoods} days={30} compact />
        </motion.div>
      )}

      {/* Filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <motion.button
          whileTap={tapScale}
          onClick={() => { setActiveSubtype(null); setActiveTag(null); }}
          className={`rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeSubtype === null && activeTag === null
              ? "bg-ink text-paper"
              : "border border-muted-light text-muted hover:text-ink"
          }`}
        >
          All
        </motion.button>
        {ALL_SUBTYPES.map((subtype) => {
          const { label, color } = SUBTYPE_LABELS[subtype];
          return (
            <motion.button
              key={subtype}
              whileTap={tapScale}
              onClick={() => setActiveSubtype(activeSubtype === subtype ? null : subtype)}
              className={`rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                activeSubtype === subtype
                  ? `bg-${color}/15 text-${color} border border-${color}/30`
                  : "border border-muted-light text-muted hover:text-ink"
              }`}
            >
              {label}
            </motion.button>
          );
        })}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <span className="font-mono text-[0.65rem] text-muted uppercase tracking-wider mr-2 self-center">
            Tags:
          </span>
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              whileTap={tapScale}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-2.5 py-1 font-mono text-[0.65rem] transition-colors ${
                activeTag === tag
                  ? "bg-ink text-paper"
                  : "bg-muted-light/40 text-muted hover:text-ink"
              }`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      )}

      {/* Entry feed */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-muted-light bg-paper-light p-6">
              <div className="h-3 bg-muted-light rounded w-24 mb-3" />
              <div className="h-5 bg-muted-light rounded w-48 mb-2" />
              <div className="h-3 bg-muted-light rounded w-full" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="py-16 text-center"
        >
          <p className="font-display text-lg italic text-muted">
            &ldquo;The unexamined life is not worth living.&rdquo;
          </p>
          <p className="text-caption mt-2 text-muted">&mdash; Socrates</p>
          <p className="text-body-sm mt-6 text-muted">
            {activeSubtype || activeTag
              ? "No entries match your filters. Try adjusting them."
              : "No history yet. Start using the dashboard to build your philosophical journey."}
          </p>
          {!activeSubtype && !activeTag && (
            <Link
              href="/journal/new"
              className="mt-4 inline-block rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              Write Your First Entry
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {entries.map((entry) => (
            <motion.div key={entry.id} variants={fadeUp}>
              <HistoryCard entry={entry} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const { label, color } = SUBTYPE_LABELS[entry.dataSubtype];

  // Journal entries are clickable links
  const isJournal = entry.dataSubtype === "journal" && entry.source === "journal_entries";

  const card = (
    <div className={`rounded-lg border border-muted-light bg-paper-light p-5 transition-shadow ${isJournal ? "hover:shadow-md" : "hover:shadow-sm"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`rounded-full bg-${color}/10 px-2.5 py-0.5 font-mono text-[0.65rem] font-medium uppercase text-${color}`}
        >
          {label}
        </span>
        <span className="font-mono text-[0.65rem] text-muted">
          {formatDate(entry.createdAt)}
        </span>
        {entry.tags.length > 0 && (
          <div className="flex gap-1 ml-auto">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted-light/40 px-2 py-0.5 font-mono text-[0.6rem] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={expanded ? "" : "line-clamp-3"}>
        <HistoryEntryContent entry={entry} />
      </div>

      {!isJournal && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 font-mono text-xs text-muted hover:text-ink transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );

  if (isJournal) {
    return (
      <Link href={`/journal/${entry.id}`} className="block">
        {card}
      </Link>
    );
  }

  return card;
}

function HistoryEntryContent({ entry }: { entry: HistoryEntry }) {
  const { content, dataSubtype } = entry;

  switch (dataSubtype) {
    case "journal": {
      const text = (content.text as string) || "";
      const prompt = content.prompt as string;
      return (
        <div>
          {prompt && (
            <p className="text-body-sm italic text-muted mb-2">
              Prompt: &ldquo;{prompt}&rdquo;
            </p>
          )}
          <p className="text-body-sm text-ink whitespace-pre-wrap">{text}</p>
        </div>
      );
    }
    case "mood_log": {
      const moodLabel = content.label as string;
      const intensity = content.intensity as number;
      const vector = content.moodVector as { x: number; y: number };
      return (
        <div className="flex items-center gap-4">
          <p className="text-body text-ink capitalize">{moodLabel || "Mood logged"}</p>
          {intensity && (
            <span className="font-mono text-xs text-muted">
              Intensity: {intensity}/10
            </span>
          )}
          {vector && (
            <span className="font-mono text-xs text-muted">
              ({vector.x.toFixed(1)}, {vector.y.toFixed(1)})
            </span>
          )}
        </div>
      );
    }
    case "gratitude": {
      const items = (content.items as string[]) || [];
      return (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-body-sm text-ink flex gap-2">
              <span className="font-mono text-xs text-sage mt-0.5">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    case "assessment": {
      const ratings = (content.ratings as Record<string, number>) || {};
      return (
        <div className="space-y-1.5">
          {Object.entries(ratings).map(([domain, value]) => (
            <div key={domain} className="flex items-center gap-3">
              <span className="text-body-sm w-28 text-ink">{domain}</span>
              <div className="flex-1 h-2 rounded-full bg-muted-light overflow-hidden">
                <div
                  className="h-full rounded-full bg-warm transition-all"
                  style={{ width: `${(value as number) * 10}%` }}
                />
              </div>
              <span className="font-mono text-xs text-muted">
                {value}/10
              </span>
            </div>
          ))}
        </div>
      );
    }
    case "reframe": {
      const original = (content.originalThought as string) || "";
      const reframed = (content.reframedThought as string) || "";
      const technique = content.technique as string;
      return (
        <div className="space-y-2">
          <div>
            <span className="font-mono text-[0.65rem] text-muted uppercase">Original</span>
            <p className="text-body-sm text-ink italic">&ldquo;{original}&rdquo;</p>
          </div>
          {reframed && (
            <div>
              <span className="font-mono text-[0.65rem] text-sage uppercase">Reframed</span>
              <p className="text-body-sm text-ink">&ldquo;{reframed}&rdquo;</p>
            </div>
          )}
          {technique && (
            <span className="inline-block rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[0.6rem] text-accent">
              {technique}
            </span>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
