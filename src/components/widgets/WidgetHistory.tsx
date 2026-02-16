"use client";

import { useState, useEffect } from "react";
import { useWidgetData, type HistoryEntry } from "@/hooks/useWidgetData";
import type { DataSubtype } from "@/types/widget-behaviors";

interface WidgetHistoryProps {
  dataSubtype: DataSubtype;
  widgetInstanceId?: string;
  limit?: number;
}

export function WidgetHistory({
  dataSubtype,
  widgetInstanceId,
  limit = 5,
}: WidgetHistoryProps) {
  const { getHistory, getWidgetHistory } = useWidgetData();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = widgetInstanceId
        ? await getWidgetHistory(widgetInstanceId, limit)
        : await getHistory({ dataSubtype, limit });
      setEntries(data);
      setLoading(false);
    }
    load();
  }, [dataSubtype, widgetInstanceId, limit, getHistory, getWidgetHistory]);

  if (loading) {
    return (
      <div className="mt-3 space-y-2 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 rounded-md bg-muted-light/30" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="mt-3 text-caption text-muted italic">No history yet.</p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-md border border-muted-light/50 bg-paper p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <SubtypeBadge subtype={entry.dataSubtype} />
            <span className="font-mono text-[0.65rem] text-muted">
              {formatDate(entry.createdAt)}
            </span>
            {entry.tags.length > 0 && (
              <div className="flex gap-1 ml-auto">
                {entry.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted-light/50 px-2 py-0.5 font-mono text-[0.6rem] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <ContentPreview entry={entry} />
        </div>
      ))}
    </div>
  );
}

function SubtypeBadge({ subtype }: { subtype: DataSubtype }) {
  const styles: Record<DataSubtype, string> = {
    journal: "bg-slate/10 text-slate",
    mood_log: "bg-accent/10 text-accent",
    gratitude: "bg-sage/10 text-sage",
    assessment: "bg-warm/10 text-warm",
    reframe: "bg-accent/10 text-accent",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-medium uppercase ${styles[subtype]}`}>
      {subtype.replace("_", " ")}
    </span>
  );
}

function ContentPreview({ entry }: { entry: HistoryEntry }) {
  const { content, dataSubtype } = entry;

  switch (dataSubtype) {
    case "journal": {
      const text = (content.text as string) || "";
      return (
        <p className="text-body-sm text-ink line-clamp-2">{text}</p>
      );
    }
    case "mood_log": {
      const label = content.label as string;
      const intensity = content.intensity as number;
      return (
        <p className="text-body-sm text-ink">
          {label || "Mood logged"} {intensity ? `(intensity: ${intensity}/10)` : ""}
        </p>
      );
    }
    case "gratitude": {
      const items = (content.items as string[]) || [];
      return (
        <ul className="text-body-sm text-ink">
          {items.slice(0, 3).map((item, i) => (
            <li key={i} className="flex gap-1">
              <span className="text-sage font-mono text-xs">{i + 1}.</span>
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-muted text-caption">+{items.length - 3} more</li>
          )}
        </ul>
      );
    }
    case "assessment": {
      const ratings = (content.ratings as Record<string, number>) || {};
      const entries = Object.entries(ratings).slice(0, 3);
      return (
        <div className="flex gap-3 text-body-sm text-ink">
          {entries.map(([key, val]) => (
            <span key={key}>
              {key}: <strong>{val}/10</strong>
            </span>
          ))}
        </div>
      );
    }
    case "reframe": {
      const original = (content.originalThought as string) || "";
      return (
        <p className="text-body-sm text-ink line-clamp-2 italic">
          &ldquo;{original}&rdquo;
        </p>
      );
    }
    default:
      return null;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
