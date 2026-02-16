"use client";

import { useCallback, useRef, useState } from "react";
import type { MoodVector } from "@/types/mood";

interface MoodCanvasProps {
  value: MoodVector;
  onChange: (value: MoodVector) => void;
  compact?: boolean;
}

export function MoodCanvas({ value, onChange, compact = false }: MoodCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, -(((clientY - rect.top) / rect.height) * 2 - 1)));

      onChange({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const pinLeft = ((value.x + 1) / 2) * 100;
  const pinTop = ((-value.y + 1) / 2) * 100;

  const size = compact ? "h-48 w-48" : "h-72 w-72 md:h-80 md:w-80";

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`${size} relative cursor-crosshair select-none rounded-xl border border-muted-light bg-paper-light touch-none`}
      >
        {/* Grid lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-light" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-muted-light" />

        {/* Quadrant labels */}
        <span className="absolute top-2 left-3 text-[0.6rem] font-mono font-medium uppercase tracking-wider text-muted/60">
          Tense
        </span>
        <span className="absolute top-2 right-3 text-[0.6rem] font-mono font-medium uppercase tracking-wider text-sage/60">
          Energized
        </span>
        <span className="absolute bottom-2 left-3 text-[0.6rem] font-mono font-medium uppercase tracking-wider text-muted/60">
          Low
        </span>
        <span className="absolute bottom-2 right-3 text-[0.6rem] font-mono font-medium uppercase tracking-wider text-slate/60">
          Calm
        </span>

        {/* Axis labels */}
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[0.55rem] font-mono text-muted/40">
          &minus;
        </span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[0.55rem] font-mono text-muted/40">
          +
        </span>

        {/* Pin */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
          style={{ left: `${pinLeft}%`, top: `${pinTop}%` }}
        >
          <div className="h-5 w-5 rounded-full border-2 border-accent bg-accent/20 shadow-sm" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
        </div>
      </div>

      {!compact && (
        <p className="text-caption text-muted">
          Tap or drag to place your mood
        </p>
      )}
    </div>
  );
}
