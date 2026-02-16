"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { stagger, fadeUp, editorial } from "@/lib/motion";
import { WIDGET_PRESETS, type WidgetPreset } from "@/lib/widget-presets";
import { WIDGET_REGISTRY } from "@/lib/widget-registry";
import { WidgetInChat } from "@/components/chat/WidgetInChat";
import type { WidgetBehavior } from "@/types/widget-behaviors";

type TabKey = "all" | "display" | "data_saving" | "prompt_to_chat";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "display", label: "Exercises" },
  { key: "data_saving", label: "Journaling" },
  { key: "prompt_to_chat", label: "Chat Starters" },
];

function getBehaviorBadge(behavior: WidgetBehavior): { label: string; className: string } {
  switch (behavior) {
    case "display":
      return { label: "Exercise", className: "text-sage bg-sage/10 border-sage/20" };
    case "data_saving":
      return { label: "Journaling", className: "text-warm bg-warm/10 border-warm/20" };
    case "prompt_to_chat":
      return { label: "Chat Starter", className: "text-slate bg-slate/10 border-slate/20" };
  }
}

function getFilteredPresets(tab: TabKey): WidgetPreset[] {
  if (tab === "all") return WIDGET_PRESETS;
  return WIDGET_PRESETS.filter(
    (p) => WIDGET_REGISTRY[p.widgetType]?.primaryBehavior === tab
  );
}

export function WidgetGallery() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const router = useRouter();
  const presets = getFilteredPresets(activeTab);

  function handleAddToDashboard(preset: WidgetPreset) {
    const params = new URLSearchParams({ addWidget: preset.widgetType });
    router.push(`/dashboard?${params.toString()}`);
  }

  function handleAskCoachToEdit(preset: WidgetPreset) {
    const params = new URLSearchParams({
      customizeWidget: preset.widgetType,
      customizeLabel: preset.label,
    });
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted">
          Widget Gallery
        </p>
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          Philosophical Tools
        </h1>
        <p className="text-body mx-auto mt-3 max-w-lg text-muted">
          Browse exercises, journaling prompts, and conversation starters. Add them to your dashboard or ask your coach to customize one for you.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-8 flex gap-1 border-b border-muted-light">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-accent text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Widget grid — masonry two-column layout like dashboard */}
      <motion.div
        key={activeTab}
        className="columns-1 gap-4 md:columns-2"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {presets.map((preset) => {
          const behavior = WIDGET_REGISTRY[preset.widgetType]?.primaryBehavior || "display";
          const badge = getBehaviorBadge(behavior);
          const toolName = `show_${preset.widgetType}`;

          return (
            <motion.div
              key={preset.widgetType}
              variants={fadeUp}
              className="break-inside-avoid mb-4"
            >
              <div className="group relative rounded-xl border border-muted-light/40 bg-paper-light shadow-sm overflow-clip transition-shadow hover:shadow-md">
                {/* Behavior badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Rendered widget preview */}
                <div className="[&_div.my-4]:my-0 [&>div>div]:rounded-none [&>div>div]:border-0 [&>div>div]:shadow-none [&>div>div]:bg-transparent">
                  <WidgetInChat
                    toolName={toolName}
                    args={preset.defaultArgs}
                    state="input-available"
                  />
                </div>

                {/* Action bar */}
                <div className="flex gap-2 border-t border-muted-light/40 p-3">
                  <button
                    onClick={() => handleAddToDashboard(preset)}
                    className="flex-1 rounded-md bg-accent px-3 py-2 font-mono text-xs uppercase tracking-wider text-paper-light transition-colors hover:bg-accent-hover"
                  >
                    Add to Dashboard
                  </button>
                  <button
                    onClick={() => handleAskCoachToEdit(preset)}
                    className="flex-1 rounded-md border border-muted-light px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
