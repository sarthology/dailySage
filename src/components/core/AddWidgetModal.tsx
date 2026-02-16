"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDashboard } from "@/contexts/DashboardContext";
import { WIDGET_PRESETS, type WidgetPreset } from "@/lib/widget-presets";

interface AddWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWidgetModal({ open, onOpenChange }: AddWidgetModalProps) {
  const [tab, setTab] = useState<"browse" | "ai">("browse");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const { addWidget } = useDashboard();

  function handleAddPreset(preset: WidgetPreset) {
    addWidget({
      widgetType: preset.widgetType,
      title: preset.defaultArgs.title as string || preset.label,
      description: preset.defaultArgs.description as string | undefined,
      args: preset.defaultArgs,
      size: "medium",
      pinned: false,
      source: "user",
    });
    onOpenChange(false);
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error("Failed to generate widget");
      const data = await res.json();
      addWidget({
        widgetType: data.widgetType,
        title: data.title,
        description: data.description,
        args: data.args,
        size: data.size || "medium",
        pinned: false,
        source: "user",
      });
      setAiPrompt("");
      onOpenChange(false);
    } catch {
      // Could show an error toast here
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper border-muted-light sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-ink">Add Widget</DialogTitle>
          <DialogDescription className="text-body-sm text-muted">
            Choose a preset exercise or ask the AI to create one for you.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 border-b border-muted-light">
          <button
            onClick={() => setTab("browse")}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              tab === "browse"
                ? "border-b-2 border-accent text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab("ai")}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              tab === "ai"
                ? "border-b-2 border-accent text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            Ask AI
          </button>
        </div>

        {/* Content */}
        {tab === "browse" ? (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
              {WIDGET_PRESETS.map((preset) => (
                <button
                  key={preset.widgetType}
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-start gap-3 rounded-lg border border-muted-light bg-paper-light p-3 text-left transition-colors hover:border-accent/50 hover:bg-paper"
                >
                  <span className="mt-0.5 text-lg leading-none">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-ink">{preset.label}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{preset.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 py-2">
            <p className="text-body-sm text-muted">
              Describe the exercise or widget you want, and the AI will create it for you.
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={'e.g. "A morning routine checklist based on Marcus Aurelius\' Meditations" or "A breathing exercise for pre-meeting anxiety"'}
              className="w-full rounded-lg border border-muted-light bg-paper-light p-3 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none resize-none"
              rows={4}
            />
            <button
              onClick={handleAiGenerate}
              disabled={!aiPrompt.trim() || aiLoading}
              className="self-end rounded-md bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper-light transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? "Generating..." : "Generate Widget"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
