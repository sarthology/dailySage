"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { slideFromLeft, slideFromRight, fadeUp, scaleIn, editorial, tapScale } from "@/lib/motion";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WidgetInChat } from "./WidgetInChat";
import { useDashboard } from "@/contexts/DashboardContext";
import { useSession } from "@/hooks/useSession";
import { useCredits } from "@/hooks/useCredits";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { WidgetType } from "@/types/widget";
import type { ChatMode } from "@/types/chat";
import { WIDGET_REGISTRY } from "@/lib/widget-registry";
import { useWidgetData } from "@/hooks/useWidgetData";

export interface ChatPanelHandle {
  sendMessage: (text: string) => void;
  prefillMessage: (text: string) => void;
}

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  parts?: unknown[];
  timestamp: string;
}

const MIN_CHAT_WIDTH = 320;
const MAX_CHAT_WIDTH = 700;

interface ChatPanelProps {
  open: boolean;
  onToggle: () => void;
  sessionId: string;
  initialMessages?: StoredMessage[];
  familiarityLevel?: "beginner" | "intermediate" | "advanced";
  stoicConcepts?: string[];
  width?: number;
  onResize?: (width: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

const DASHBOARD_TOOL_NAMES = [
  "add_dashboard_widget",
  "remove_dashboard_widget",
  "update_dashboard_widget",
  "log_mood",
];

// Tool part shape from AI SDK v6: { type: "tool-{name}", toolCallId, state, input }
interface ToolPart {
  type: string;
  toolCallId: string;
  state?: string;
  input?: Record<string, unknown>;
}

export const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>(function ChatPanel({
  open,
  onToggle,
  sessionId,
  initialMessages = [],
  familiarityLevel,
  stoicConcepts,
  width = 400,
  onResize,
  onResizeStart,
  onResizeEnd,
}, ref) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [creditError, setCreditError] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("dialogue");
  const submittingRef = useRef(false);
  const { updateSessionMessages } = useSession();
  const { credits, loading: creditsLoading, canAfford, deductCredit } = useCredits();
  const { layout, addWidget, removeWidget, updateWidget, consumeEvents, pinWidgetFromChat } =
    useDashboard();
  const { saveWidgetData } = useWidgetData();
  const processedToolCalls = useRef<Set<string>>(new Set());

  // Drag-to-resize handler
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onResizeStart?.();
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = startX - moveEvent.clientX;
        const newWidth = Math.min(MAX_CHAT_WIDTH, Math.max(MIN_CHAT_WIDTH, startWidth + delta));
        onResize?.(newWidth);
      };

      const onMouseUp = () => {
        onResizeEnd?.();
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width, onResize, onResizeStart, onResizeEnd]
  );

  // Ref for dynamic context — read lazily by the transport on each request
  const contextRef = useRef({
    sessionId,
    familiarityLevel,
    stoicConcepts,
    dashboardWidgets: [] as Array<{ id: string; type: string; title: string; tags?: string[] }>,
    recentWidgetEvents: [] as unknown[],
    mode: "dialogue" as ChatMode,
  });

  // Keep ref fresh (no state updates, safe during render)
  contextRef.current.sessionId = sessionId;
  contextRef.current.familiarityLevel = familiarityLevel;
  contextRef.current.stoicConcepts = stoicConcepts;
  contextRef.current.dashboardWidgets = layout.widgets.map((w) => ({
    id: w.id,
    type: w.widgetType,
    title: w.title,
    tags: w.tags,
  }));
  contextRef.current.mode = chatMode;

  const getMessageContent = (message: { content?: string; parts?: Array<{ type: string; text?: string }> }): string => {
    if (typeof message.content === "string") return message.content;
    if (message.parts) {
      return message.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("");
    }
    return "";
  };

  const getToolParts = (message: { parts?: unknown[] }): ToolPart[] => {
    if (!message.parts) return [];
    return message.parts.filter((p): p is ToolPart => {
      const part = p as Record<string, unknown>;
      return (
        typeof part.type === "string" &&
        part.type.startsWith("tool-") &&
        typeof part.toolCallId === "string"
      );
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hydratedMessages: any[] = useMemo(
    () =>
      initialMessages.map((m, i) => ({
        id: `restored-${i}`,
        role: m.role,
        content: m.content,
        parts: m.parts || [{ type: "text", text: m.content }],
        createdAt: new Date(m.timestamp),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Stable transport — body is a function so it reads fresh context per request
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          context: {
            ...contextRef.current,
            recentWidgetEvents: consumeEvents(),
          },
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: hydratedMessages,
    onError: (error) => {
      // Suppress abort errors — expected when navigating away or sending a new message mid-stream
      if (error.name === "AbortError") return;
      console.error("Chat error:", error);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Expose sendMessage and prefillMessage to parent via ref
  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      setInput(text);
      // Widget-triggered messages use discourse mode (no tools) —
      // the widget already handled data saving, we just need a text reply.
      const prevMode = contextRef.current.mode;
      contextRef.current.mode = "discourse";
      sendMessage({ text });
      // Restore after transport reads context synchronously
      requestAnimationFrame(() => {
        contextRef.current.mode = prevMode;
      });
    },
    prefillMessage: (text: string) => {
      setInput(text);
    },
  }), [sendMessage]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist messages to Supabase
  const persistMessages = useCallback(async () => {
    if (messages.length === 0) return;
    const serialized = messages.map((m) => ({
      role: m.role,
      content: getMessageContent(m as { content?: string; parts?: Array<{ type: string; text?: string }> }),
      parts: m.parts,
      timestamp: new Date().toISOString(),
    }));
    await updateSessionMessages(sessionId, serialized);
  }, [messages, sessionId, updateSessionMessages]);

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      persistMessages();
    }
  }, [status, messages.length, persistMessages]);

  // Process dashboard tool invocations from chat
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const toolParts = getToolParts(lastMessage as { parts?: unknown[] });
    for (const p of toolParts) {
      if (p.state !== "input-available") continue;
      if (processedToolCalls.current.has(p.toolCallId)) continue;

      const toolName = p.type.replace("tool-", "");
      const args = p.input || {};

      if (toolName === "add_dashboard_widget") {
        processedToolCalls.current.add(p.toolCallId);
        addWidget({
          widgetType: args.widgetType as WidgetType,
          title: (args.title as string) || "Widget",
          description: args.description as string | undefined,
          args: (args.args as Record<string, unknown>) || {},
          size: (args.size as "small" | "medium" | "large") || "medium",
          pinned: false,
          source: "chat",
          tags: (args.tags as string[]) || undefined,
        });
      } else if (toolName === "remove_dashboard_widget") {
        processedToolCalls.current.add(p.toolCallId);
        removeWidget(args.widgetId as string);
      } else if (toolName === "update_dashboard_widget") {
        processedToolCalls.current.add(p.toolCallId);
        const updates = args.updates as Record<string, unknown> | undefined;
        if (updates) {
          updateWidget(args.widgetId as string, {
            title: updates.title as string | undefined,
            description: updates.description as string | undefined,
            args: updates.args as Record<string, unknown> | undefined,
          });
        }
      }
      // log_mood is handled server-side in the API route
    }
  }, [messages, addWidget, removeWidget, updateWidget]);

  // Fire-and-forget session title generation
  const titleGenerated = useRef(false);
  useEffect(() => {
    if (status === "ready" && messages.length === 2 && !titleGenerated.current) {
      titleGenerated.current = true;
      const firstMessage = getMessageContent(messages[0] as { content?: string; parts?: Array<{ type: string; text?: string }> });
      if (firstMessage) {
        fetch("/api/session-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, firstMessage }),
        }).catch(() => {});
      }
    }
  }, [status, messages.length, sessionId, messages]);

  // Reset submit guard when status returns to ready
  useEffect(() => {
    if (status === "ready") {
      submittingRef.current = false;
    }
  }, [status]);

  async function onSubmit() {
    // Guard against concurrent submits (async deductCredit creates a window)
    if (!input.trim() || isLoading || submittingRef.current) return;
    submittingRef.current = true;

    if (!canAfford("chat_message")) {
      setCreditError(true);
      submittingRef.current = false;
      return;
    }
    setCreditError(false);
    const deducted = await deductCredit("chat_message");
    if (!deducted) {
      setCreditError(true);
      submittingRef.current = false;
      return;
    }

    const text = input;
    setInput("");
    sendMessage({ text });
  }

  const isChatWidget = (toolName: string) =>
    !DASHBOARD_TOOL_NAMES.includes(toolName);

  // --- Render ---

  const chatContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-muted-light px-4 py-3">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted">
            Daily Sage
          </p>
        </div>
        <button
          onClick={onToggle}
          className="rounded-sm p-1 text-muted hover:text-ink transition-colors text-xs font-mono"
          aria-label="Toggle chat"
        >
          {open ? "Close" : "Open"}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4">
        <div className="py-6">
          {messages.length === 0 && (
            <motion.div
              className="py-12 text-center"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <p className="font-display text-lg italic text-muted">
                &ldquo;The beginning of wisdom is the definition of terms.&rdquo;
              </p>
              <p className="text-caption mt-2 text-muted">— Socrates</p>
              <p className="text-body-sm mt-6 text-muted">
                Tell me what&apos;s on your mind.
              </p>
            </motion.div>
          )}
          <div className="space-y-2">
            {messages.map((message, idx) => {
              const toolParts = getToolParts(message as { parts?: unknown[] });
              return (
                <motion.div
                  key={`${message.id}-${idx}`}
                  variants={message.role === "assistant" ? slideFromLeft : slideFromRight}
                  initial="hidden"
                  animate="visible"
                >
                  <ChatMessage
                    role={message.role as "user" | "assistant"}
                    content={getMessageContent(message as { content?: string; parts?: Array<{ type: string; text?: string }> })}
                  />
                  {toolParts.map((p) => {
                    const toolName = p.type.replace("tool-", "");
                    if (!isChatWidget(toolName)) return null;
                    const widgetType = toolName.replace("show_", "") as WidgetType;
                    const config = WIDGET_REGISTRY[widgetType];
                    return (
                      <WidgetInChat
                        key={p.toolCallId}
                        toolName={toolName}
                        args={(p.input || {}) as Record<string, unknown>}
                        state={p.state || "input-available"}
                        onPin={() => pinWidgetFromChat(toolName, (p.input || {}) as Record<string, unknown>)}
                        onSave={config?.dataSaving ? async (data) => {
                          return saveWidgetData({
                            dataSubtype: config.dataSaving!.dataSubtype,
                            content: data,
                          });
                        } : undefined}
                        onSendToChat={config?.chatPrompt ? (text) => sendMessage({ text }) : undefined}
                      />
                    );
                  })}
                </motion.div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="border-l-2 border-accent py-5 pl-5">
                <p className="text-caption mb-2 uppercase tracking-wider text-muted">
                  Daily Sage
                </p>
                <div className="flex gap-1 text-muted">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-pulse" style={{ animationDelay: "300ms" }}>.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credit warning */}
      {creditError && (
        <div className="border-t border-warm/30 bg-warm/5 px-4 py-2 text-center">
          <p className="text-body-sm text-warm">
            Not enough credits.
          </p>
        </div>
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        isLoading={isLoading}
        mode={chatMode}
        onModeChange={setChatMode}
        credits={credits}
        creditsLoading={creditsLoading}
      />
    </div>
  );

  // Desktop: fixed side panel
  // Mobile: Sheet overlay
  return (
    <>
      {/* Desktop panel */}
      <motion.aside
        className="fixed right-0 top-[65px] hidden h-[calc(100vh-65px)] border-l border-muted-light bg-paper lg:block"
        style={{ width: `${width}px` }}
        animate={{ x: open ? 0 : width }}
        transition={editorial.enter}
      >
        {/* Resize handle */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-accent/30 active:bg-accent/50 transition-colors"
        />
        {chatContent}
      </motion.aside>

      {/* Desktop toggle when closed */}
      <AnimatePresence>
        {!open && (
          <motion.button
            onClick={onToggle}
            className="fixed right-4 bottom-6 z-40 hidden rounded-full bg-accent p-4 text-paper-light shadow-lg transition-colors hover:bg-accent-hover lg:block"
            aria-label="Open chat"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={editorial.spring}
            whileTap={tapScale}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile: Sheet (no dark overlay) */}
      <Sheet open={open} onOpenChange={onToggle} modal={false}>
        <SheetContent
          side="right"
          showCloseButton={false}
          showOverlay={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="w-full sm:w-[400px] p-0 bg-paper lg:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Daily Sage</SheetTitle>
          </SheetHeader>
          {chatContent}
        </SheetContent>
      </Sheet>

      {/* Mobile FAB */}
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-6 z-40 rounded-full bg-accent p-4 text-paper-light shadow-lg transition-colors hover:bg-accent-hover lg:hidden"
        aria-label="Open chat"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
});
