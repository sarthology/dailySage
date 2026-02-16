"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WidgetInChat } from "./WidgetInChat";
import { SessionSummary } from "@/components/core/SessionSummary";
import { useSession } from "@/hooks/useSession";
import { useCredits } from "@/hooks/useCredits";

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  parts?: any[];
  timestamp: string;
}

interface ChatContainerProps {
  sessionId: string;
  initialMessages?: StoredMessage[];
  initialMood?: { x: number; y: number } | null;
  sessionStatus?: string;
}

export function ChatContainer({ sessionId, initialMessages = [], initialMood, sessionStatus }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [creditError, setCreditError] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const { updateSessionMessages } = useSession();
  const { canAfford, deductCredit } = useCredits();

  // Helper to extract text content from message (handles both parts and content formats)
  const getMessageContent = (message: any): string => {
    if (typeof message.content === "string") {
      return message.content;
    }
    if (message.parts) {
      return message.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
    }
    return "";
  };

  // Extract tool invocation parts from message
  // AI SDK v6 uses part.type = "tool-{toolName}" (e.g. "tool-show_breathing_exercise")
  // with part.input (not args) and states: "input-streaming", "input-available", etc.
  const getToolInvocations = (message: any) => {
    if (!message.parts) return [];
    return message.parts.filter(
      (p: any) => p.type?.startsWith("tool-") && p.toolCallId
    );
  };

  // Convert stored messages from Supabase to UIMessage format for useChat
  const hydratedMessages = useMemo(
    () =>
      initialMessages.map((m, i) => ({
        id: `restored-${i}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        parts: m.parts || [{ type: "text" as const, text: m.content }],
        createdAt: new Date(m.timestamp),
      })),
    // Only compute once on mount — initialMessages comes from the server and won't change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { context: { sessionId } },
      }),
    [sessionId]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: hydratedMessages,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist messages to Supabase when they change (including tool invocation parts)
  const persistMessages = useCallback(async () => {
    if (messages.length === 0) return;
    const serialized = messages.map((m) => ({
      role: m.role,
      content: getMessageContent(m),
      parts: m.parts,
      timestamp: new Date().toISOString(),
    }));
    await updateSessionMessages(sessionId, serialized);
  }, [messages, sessionId, updateSessionMessages]);

  // Persist when assistant finishes responding
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      persistMessages();
    }
  }, [status, messages.length, persistMessages]);

  // Fire-and-forget session title generation after first exchange
  const titleGenerated = useRef(false);
  useEffect(() => {
    if (
      status === "ready" &&
      messages.length === 2 &&
      !titleGenerated.current
    ) {
      titleGenerated.current = true;
      const firstMessage = getMessageContent(messages[0]);
      if (firstMessage) {
        fetch("/api/session-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, firstMessage }),
        }).catch(() => {}); // fire and forget
      }
    }
  }, [status, messages.length, sessionId, messages]);

  async function onSubmit() {
    if (!input.trim() || isLoading) return;

    // Check credits
    if (!canAfford("chat_message")) {
      setCreditError(true);
      return;
    }

    setCreditError(false);
    const deducted = await deductCredit("chat_message");
    if (!deducted) {
      setCreditError(true);
      return;
    }

    sendMessage({ text: input });
    setInput("");
  }

  const isCompleted = sessionStatus === "completed";

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      {/* Completed session banner */}
      {isCompleted && (
        <div className="border-b border-sage/30 bg-sage/5 px-4 py-3 text-center">
          <p className="text-body-sm text-sage font-medium">
            This session has been completed.{" "}
            <a href="/session/new" className="underline hover:text-sage/80">
              Start a new session
            </a>
          </p>
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl py-8">
          {messages.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-xl italic text-muted">
                &ldquo;The beginning of wisdom is the definition of terms.&rdquo;
              </p>
              <p className="text-caption mt-3 text-muted">— Socrates</p>
              <p className="text-body-sm mt-8 text-muted">
                Tell me what&apos;s on your mind. I&apos;ll listen with the ears of a philosopher.
              </p>
            </div>
          )}
          <div className="space-y-2">
            {messages.map((message) => {
              const toolParts = getToolInvocations(message);
              return (
                <div key={message.id}>
                  <ChatMessage
                    role={message.role as "user" | "assistant"}
                    content={getMessageContent(message)}
                  />
                  {toolParts.map((part: any) => (
                    <WidgetInChat
                      key={part.toolCallId}
                      toolName={part.type.replace("tool-", "")}
                      args={part.input || {}}
                      state={part.state || "input-available"}
                    />
                  ))}
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="border-l-2 border-accent py-5 pl-5">
                <p className="text-caption mb-2 uppercase tracking-wider text-muted">
                  Philosopher Coach
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
            Not enough credits. Visit your profile to check your balance.
          </p>
        </div>
      )}

      {/* Session end flow */}
      {showEndSession && (
        <SessionSummary
          sessionId={sessionId}
          initialMood={initialMood ?? null}
          messageCount={messages.length}
          onCancel={() => setShowEndSession(false)}
        />
      )}

      {/* Input area */}
      {!isCompleted && !showEndSession && (
        <div>
          {messages.length > 0 && (
            <div className="flex justify-center border-t border-muted-light py-2">
              <button
                onClick={() => setShowEndSession(true)}
                className="text-xs font-medium text-muted hover:text-ink transition-colors"
              >
                End Session
              </button>
            </div>
          )}
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
