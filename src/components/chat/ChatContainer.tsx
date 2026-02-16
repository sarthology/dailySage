"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useSession } from "@/hooks/useSession";
import { useCredits } from "@/hooks/useCredits";

interface ChatContainerProps {
  sessionId: string;
}

export function ChatContainer({ sessionId }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [creditError, setCreditError] = useState(false);
  const { updateSessionMessages } = useSession();
  const { canAfford, deductCredit } = useCredits();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { context: { sessionId } },
      }),
    [sessionId]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist messages to Supabase when they change
  const persistMessages = useCallback(async () => {
    if (messages.length === 0) return;
    const serialized = messages.map((m) => ({
      role: m.role,
      content:
        m.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("") || "",
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

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
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
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role as "user" | "assistant"}
                content={
                  message.parts
                    ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                    .map((p) => p.text)
                    .join("") || ""
                }
              />
            ))}
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

      {/* Input area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
