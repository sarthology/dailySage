"use client";

import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Measure actual container width for proper SVG coordinates
  useEffect(() => {
    if (!containerRef.current) return;
    setWidth(containerRef.current.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
  const padding = { top: 16, bottom: compact ? 8 : 28, left: 12, right: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate x positions using actual pixel coordinates
  const step = dayData.length > 1 ? chartWidth / (dayData.length - 1) : 0;

  // Build points for the line + dots
  const points: { x: number; y: number; data: DayData }[] = [];
  dayData.forEach((d, i) => {
    if (d) {
      // Map valence (x: -1 to 1) to y position (1 = top/positive, -1 = bottom/negative)
      const valence = d.mood.mood_vector.x;
      const yNorm = (1 - valence) / 2; // 0 = top (positive), 1 = bottom (negative)
      points.push({
        x: padding.left + i * step,
        y: padding.top + yNorm * chartHeight,
        data: d,
      });
    }
  });

  // Build smooth line path using Catmull-Rom → cubic Bezier
  let linePath = "";
  if (points.length >= 2) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) {
      linePath += ` L ${points[1].x} ${points[1].y}`;
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const tension = 6;
        const cp1x = p1.x + (p2.x - p0.x) / tension;
        const cp1y = p1.y + (p2.y - p0.y) / tension;
        const cp2x = p2.x - (p3.x - p1.x) / tension;
        const cp2y = p2.y - (p3.y - p1.y) / tension;

        linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    }
  }

  // Date labels (every 7 days for full view)
  const dateLabels: { x: number; label: string }[] = [];
  if (!compact) {
    dayData.forEach((d, i) => {
      if (i % 7 === 0 && d) {
        dateLabels.push({ x: padding.left + i * step, label: d.displayDate });
      }
    });
  }

  const dotRadius = compact ? 3.5 : 4.5;

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height: `${height}px` }}
      >
        {/* Center grid line (neutral valence) */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight / 2}
          x2={width - padding.right}
          y2={padding.top + chartHeight / 2}
          stroke="#d4cfc6"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Connecting line */}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#c4bfb6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots */}
        {points.map((p, i) => {
          const intensity = p.data.mood.intensity || 5;
          const r = dotRadius + (intensity / 10) * 2;
          const isHovered = hoveredIndex === i;

          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isHovered ? r + 2 : r}
              fill={p.data.color}
              opacity={isHovered ? 1 : 0.8}
              className="transition-all duration-150"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* Date labels */}
        {dateLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 4}
            textAnchor="middle"
            fill="#8a8275"
            style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
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
