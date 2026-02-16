"use client";

import { useState } from "react";
import type { MoodLogRow } from "@/lib/supabase/types";
import { getMoodQuadrant, getMoodColor } from "@/types/mood";

interface MoodTimelineProps {
  moods: MoodLogRow[];
  days?: number;
  compact?: boolean;
}

interface DayData {
  date: string;
  displayDate: string;
  mood: MoodLogRow;
  color: string;
  quadrant: string;
}

const COLOR_MAP: Record<string, string> = {
  sage: "#7a8b6f",
  slate: "#5b6b7a",
  warm: "#b8860b",
  muted: "#8a8275",
};

export function MoodTimeline({ moods, days = 30, compact = false }: MoodTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (moods.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-body-sm text-muted italic">No mood data yet.</p>
      </div>
    );
  }

  // Group moods by day, take the latest per day
  const moodsByDay = new Map<string, MoodLogRow>();
  for (const mood of moods) {
    const dateKey = new Date(mood.created_at).toISOString().split("T")[0];
    if (!moodsByDay.has(dateKey)) {
      moodsByDay.set(dateKey, mood);
    }
  }

  // Build day data for the last N days
  const today = new Date();
  const dayData: (DayData | null)[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const mood = moodsByDay.get(dateKey);

    if (mood) {
      const quadrant = getMoodQuadrant(mood.mood_vector);
      const colorName = getMoodColor(quadrant);
      dayData.push({
        date: dateKey,
        displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        mood,
        color: COLOR_MAP[colorName] || COLOR_MAP.muted,
        quadrant: quadrant.replace("_", " "),
      });
    } else {
      dayData.push(null);
    }
  }

  const height = compact ? 80 : 140;
  const padding = { top: 16, bottom: compact ? 8 : 24, left: 8, right: 8 };
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate x positions
  const chartWidth = 100; // percentage
  const step = dayData.length > 1 ? chartWidth / (dayData.length - 1) : chartWidth;

  // Build points for the line + dots
  const points: { x: number; y: number; data: DayData }[] = [];
  dayData.forEach((d, i) => {
    if (d) {
      // Map valence (x: -1 to 1) to y position (1 = top, -1 = bottom)
      const valence = d.mood.mood_vector.x;
      const yNorm = (1 - valence) / 2; // 0 = top (positive), 1 = bottom (negative)
      points.push({
        x: i * step,
        y: padding.top + yNorm * chartHeight,
        data: d,
      });
    }
  });

  // Build line path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}`)
    .join(" ");

  // Date labels (every 7 days for full, none for compact)
  const dateLabels: { x: number; label: string }[] = [];
  if (!compact) {
    dayData.forEach((d, i) => {
      if (i % 7 === 0 && d) {
        dateLabels.push({ x: i * step, label: d.displayDate });
      }
    });
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full overflow-visible"
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        <line
          x1="0"
          y1={padding.top + chartHeight / 2}
          x2="100%"
          y2={padding.top + chartHeight / 2}
          stroke="#d4cfc6"
          strokeWidth="0.3"
          strokeDasharray="2 2"
        />

        {/* Connecting line */}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#d4cfc6"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Dots */}
        {points.map((p, i) => {
          const intensity = Math.max(3, (p.data.mood.intensity / 10) * 5);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i}>
              <circle
                cx={`${p.x}%`}
                cy={p.y}
                r={isHovered ? intensity + 1.5 : intensity}
                fill={p.data.color}
                opacity={isHovered ? 1 : 0.75}
                className="transition-all duration-150"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}

        {/* Date labels */}
        {dateLabels.map((label, i) => (
          <text
            key={i}
            x={`${label.x}%`}
            y={height - 2}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: "3.5px", fontFamily: "var(--font-mono)" }}
          >
            {label.label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div className="mt-1 text-center">
          <p className="font-mono text-xs text-muted">
            {points[hoveredIndex].data.displayDate} &middot;{" "}
            <span style={{ color: points[hoveredIndex].data.color }}>
              {points[hoveredIndex].data.quadrant}
            </span>
            {points[hoveredIndex].data.mood.mood_label && (
              <> &middot; {points[hoveredIndex].data.mood.mood_label}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
