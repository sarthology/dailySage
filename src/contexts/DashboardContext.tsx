"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { DashboardLayout, DashboardWidgetInstance } from "@/types/dashboard";
import type { WidgetType } from "@/types/widget";

// --- Widget Events ---

export type WidgetEvent =
  | { type: "mood_logged"; data: { x: number; y: number; label?: string } }
  | { type: "journal_entry"; data: { content: string } }
  | { type: "widget_interaction"; data: { widgetId: string; action: string; payload: unknown } }
  | { type: "widget_pinned"; data: { widgetId: string } }
  | { type: "chat_widget_generated"; data: { toolName: string; args: Record<string, unknown>; toolCallId: string } };

// --- Context Value ---

interface DashboardContextValue {
  layout: DashboardLayout;
  addWidget: (widget: Omit<DashboardWidgetInstance, "id" | "position" | "createdAt">) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Pick<DashboardWidgetInstance, "title" | "description" | "args">>) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  resizeWidget: (widgetId: string, size: DashboardWidgetInstance["size"]) => void;
  pinWidgetFromChat: (toolName: string, args: Record<string, unknown>) => void;
  recentEvents: WidgetEvent[];
  emitWidgetEvent: (event: WidgetEvent) => void;
  consumeEvents: () => WidgetEvent[];
  sendToChat: (prompt: string) => void;
  prefillChat: (prompt: string) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

// --- Provider ---

interface DashboardProviderProps {
  children: ReactNode;
  initialLayout: DashboardLayout;
  profileId: string;
  sendToChat?: (prompt: string) => void;
  prefillChat?: (prompt: string) => void;
}

export function DashboardProvider({ children, initialLayout, profileId, sendToChat: sendToChatProp, prefillChat: prefillChatProp }: DashboardProviderProps) {
  const [layout, setLayout] = useState<DashboardLayout>(initialLayout);
  const eventsRef = useRef<WidgetEvent[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced persistence to Supabase
  const persistLayout = useCallback(
    (newLayout: DashboardLayout) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ dashboard_layout: newLayout, updated_at: new Date().toISOString() })
          .eq("id", profileId);
      }, 300);
    },
    [profileId]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const updateAndPersist = useCallback(
    (updater: (prev: DashboardLayout) => DashboardLayout) => {
      setLayout((prev) => {
        const next = updater(prev);
        persistLayout(next);
        return next;
      });
    },
    [persistLayout]
  );

  const addWidget = useCallback(
    (widget: Omit<DashboardWidgetInstance, "id" | "position" | "createdAt">) => {
      updateAndPersist((prev) => {
        const newWidget: DashboardWidgetInstance = {
          ...widget,
          id: crypto.randomUUID(),
          position: prev.widgets.length,
          createdAt: new Date().toISOString(),
        };
        return {
          widgets: [...prev.widgets, newWidget],
          lastModifiedBy: widget.source === "user" ? "user" : "llm",
          lastModifiedAt: new Date().toISOString(),
        };
      });
    },
    [updateAndPersist]
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      updateAndPersist((prev) => ({
        widgets: prev.widgets
          .filter((w) => w.id !== widgetId)
          .map((w, i) => ({ ...w, position: i })),
        lastModifiedBy: "user",
        lastModifiedAt: new Date().toISOString(),
      }));
    },
    [updateAndPersist]
  );

  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<Pick<DashboardWidgetInstance, "title" | "description" | "args">>) => {
      updateAndPersist((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === widgetId ? { ...w, ...updates } : w
        ),
        lastModifiedBy: "llm",
        lastModifiedAt: new Date().toISOString(),
      }));
    },
    [updateAndPersist]
  );

  const reorderWidgets = useCallback(
    (activeId: string, overId: string) => {
      updateAndPersist((prev) => {
        const widgets = [...prev.widgets].sort((a, b) => a.position - b.position);
        const oldIndex = widgets.findIndex((w) => w.id === activeId);
        const newIndex = widgets.findIndex((w) => w.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const [moved] = widgets.splice(oldIndex, 1);
        widgets.splice(newIndex, 0, moved);
        return {
          widgets: widgets.map((w, i) => ({ ...w, position: i })),
          lastModifiedBy: "user" as const,
          lastModifiedAt: new Date().toISOString(),
        };
      });
    },
    [updateAndPersist]
  );

  const resizeWidget = useCallback(
    (widgetId: string, size: DashboardWidgetInstance["size"]) => {
      updateAndPersist((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === widgetId ? { ...w, size } : w
        ),
        lastModifiedBy: "user" as const,
        lastModifiedAt: new Date().toISOString(),
      }));
    },
    [updateAndPersist]
  );

  const pinWidgetFromChat = useCallback(
    (toolName: string, args: Record<string, unknown>) => {
      const widgetType = toolName.replace("show_", "") as WidgetType;
      addWidget({
        widgetType,
        title: (args.title as string) || "Pinned Widget",
        description: args.description as string | undefined,
        args,
        size: "medium",
        pinned: true,
        source: "chat",
      });
    },
    [addWidget]
  );

  const emitWidgetEvent = useCallback((event: WidgetEvent) => {
    eventsRef.current = [...eventsRef.current.slice(-4), event];
  }, []);

  const consumeEvents = useCallback((): WidgetEvent[] => {
    const events = [...eventsRef.current];
    eventsRef.current = [];
    return events;
  }, []);

  const sendToChat = useCallback(
    (prompt: string) => {
      sendToChatProp?.(prompt);
    },
    [sendToChatProp]
  );

  const prefillChat = useCallback(
    (prompt: string) => {
      prefillChatProp?.(prompt);
    },
    [prefillChatProp]
  );

  return (
    <DashboardContext.Provider
      value={{
        layout,
        addWidget,
        removeWidget,
        updateWidget,
        reorderWidgets,
        resizeWidget,
        pinWidgetFromChat,
        recentEvents: eventsRef.current,
        emitWidgetEvent,
        consumeEvents,
        sendToChat,
        prefillChat,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
