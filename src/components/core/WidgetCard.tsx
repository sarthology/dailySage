"use client";

import { useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { scaleIn, editorial } from "@/lib/motion";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useDashboard } from "@/contexts/DashboardContext";
import { WidgetInChat } from "@/components/chat/WidgetInChat";
import type { DashboardWidgetInstance } from "@/types/dashboard";
import { WIDGET_REGISTRY } from "@/lib/widget-registry";
import { useWidgetData } from "@/hooks/useWidgetData";

interface WidgetCardProps {
  widget: DashboardWidgetInstance;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  isDragging?: boolean;
}

function WidgetCard({
  widget,
  dragAttributes,
  dragListeners,
  isDragging,
}: WidgetCardProps) {
  const { removeWidget, resizeWidget, sendToChat } = useDashboard();
  const { saveWidgetData } = useWidgetData();

  const behaviorConfig = WIDGET_REGISTRY[widget.widgetType];
  const toolName = `show_${widget.widgetType}`;
  const isWide = widget.size === "large";

  const handleSave = useCallback(
    async (data: Record<string, unknown>): Promise<boolean> => {
      if (!behaviorConfig?.dataSaving) return false;

      return saveWidgetData({
        dataSubtype: behaviorConfig.dataSaving.dataSubtype,
        content: data,
        tags: widget.tags,
        widgetInstanceId: widget.id,
      });
    },
    [behaviorConfig, saveWidgetData, widget.id, widget.tags]
  );

  const handleSendToChat = useCallback(
    (prompt: string) => {
      sendToChat?.(prompt);
    },
    [sendToChat]
  );

  return (
    <div
      className={`relative group rounded-xl bg-paper-light shadow-sm border border-muted-light/40 overflow-clip transition-shadow hover:shadow-md ${
        isDragging ? "z-50 opacity-80 shadow-lg" : ""
      }`}
    >
      {/* Controls overlay */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Drag handle */}
        <button
          className="cursor-grab rounded-md bg-paper/90 backdrop-blur-sm px-1.5 py-1 font-mono text-[0.6rem] text-muted hover:text-ink transition-colors border border-muted-light/50 active:cursor-grabbing"
          {...dragAttributes}
          {...dragListeners}
        >
          ⠿
        </button>

        {/* Size toggle */}
        <button
          onClick={() => resizeWidget(widget.id, isWide ? "medium" : "large")}
          className="rounded-md bg-paper/90 backdrop-blur-sm px-1.5 py-1 font-mono text-[0.6rem] text-muted hover:text-ink transition-colors border border-muted-light/50"
          title={isWide ? "Half width" : "Full width"}
        >
          {isWide ? "½" : "1"}
        </button>

        {widget.pinned && (
          <motion.span
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="rounded-md bg-sage/10 px-1.5 py-1 font-mono text-[0.6rem] text-sage"
          >
            Pinned
          </motion.span>
        )}
        <button
          onClick={() => removeWidget(widget.id)}
          className="rounded-md bg-paper/90 backdrop-blur-sm px-1.5 py-1 font-mono text-[0.6rem] text-muted hover:text-accent transition-colors border border-muted-light/50"
        >
          Remove
        </button>
      </div>

      {/* Widget content — strip inner widget's margin/border/rounded/shadow since the card provides them */}
      <div className="[&_div.my-4]:my-0 [&>div>div]:rounded-none [&>div>div]:border-0 [&>div>div]:shadow-none [&>div>div]:bg-transparent">
        <WidgetInChat
          toolName={toolName}
          args={widget.args}
          state="input-available"
          onSave={behaviorConfig?.dataSaving ? handleSave : undefined}
          onSendToChat={behaviorConfig?.chatPrompt ? handleSendToChat : undefined}
          widgetInstanceId={widget.id}
        />
      </div>
    </div>
  );
}

// Sortable wrapper for masonry layout
export function SortableWidgetCard({ widget }: { widget: DashboardWidgetInstance }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  // Only apply transform when actively dragging — idle transforms break CSS columns
  const style: React.CSSProperties = isDragging
    ? { transform: CSS.Transform.toString(transform), transition, zIndex: 50 }
    : {};

  const isWide = widget.size === "large";

  return (
    <div
      ref={setNodeRef}
      className={isWide ? "md:col-span-2" : ""}
      style={style}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={editorial.enter}
      >
        <WidgetCard
          widget={widget}
          dragAttributes={attributes}
          dragListeners={listeners}
          isDragging={isDragging}
        />
      </motion.div>
    </div>
  );
}
