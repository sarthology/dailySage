"use client";

import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { ChatPanel } from "@/components/chat/ChatPanel";
import type { ChatPanelHandle } from "@/components/chat/ChatPanel";
import type { DashboardLayout } from "@/types/dashboard";
import { WIDGET_PRESETS } from "@/lib/widget-presets";

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  parts?: unknown[];
  timestamp: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  profileId: string;
  initialLayout: DashboardLayout;
  sessionId: string;
  initialMessages: StoredMessage[];
  familiarityLevel?: "beginner" | "intermediate" | "advanced";
  stoicConcepts?: string[];
}

const DEFAULT_CHAT_WIDTH = 400;
const CHAT_WIDTH_KEY = "daily-sage:chat-width";

/** Processes gallery intent query params (addWidget, customizeWidget) on mount */
function GalleryIntentHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addWidget, prefillChat } = useDashboard();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const addWidgetType = searchParams.get("addWidget");
    const customizeWidget = searchParams.get("customizeWidget");
    const customizeLabel = searchParams.get("customizeLabel");

    if (!addWidgetType && !customizeWidget) return;
    processed.current = true;

    if (addWidgetType) {
      const preset = WIDGET_PRESETS.find((p) => p.widgetType === addWidgetType);
      if (preset) {
        addWidget({
          widgetType: preset.widgetType,
          title: (preset.defaultArgs.title as string) || preset.label,
          description: preset.defaultArgs.description as string | undefined,
          args: preset.defaultArgs,
          size: "medium",
          pinned: false,
          source: "user",
        });
      }
    }

    if (customizeWidget) {
      const label = customizeLabel || customizeWidget.replace(/_/g, " ");
      // Small delay to let chat panel mount
      requestAnimationFrame(() => {
        prefillChat(`I'd like a customized ${label} widget. Here's what I want: `);
      });
    }

    // Clean URL params
    const url = new URL(window.location.href);
    url.searchParams.delete("addWidget");
    url.searchParams.delete("customizeWidget");
    url.searchParams.delete("customizeLabel");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [searchParams, addWidget, prefillChat, router]);

  return null;
}

export function DashboardShell({
  children,
  profileId,
  initialLayout,
  sessionId,
  initialMessages,
  familiarityLevel,
  stoicConcepts,
}: DashboardShellProps) {
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_CHAT_WIDTH;
    const stored = localStorage.getItem(CHAT_WIDTH_KEY);
    if (!stored) return DEFAULT_CHAT_WIDTH;
    const n = Number(stored);
    return Number.isFinite(n) && n >= 320 && n <= 700 ? n : DEFAULT_CHAT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const chatRef = useRef<ChatPanelHandle>(null);

  const handleSendToChat = useCallback((prompt: string) => {
    if (!chatOpen) setChatOpen(true);
    chatRef.current?.sendMessage(prompt);
  }, [chatOpen]);

  const handlePrefillChat = useCallback((prompt: string) => {
    if (!chatOpen) setChatOpen(true);
    chatRef.current?.prefillMessage(prompt);
  }, [chatOpen]);

  return (
    <DashboardProvider
      initialLayout={initialLayout}
      profileId={profileId}
      sendToChat={handleSendToChat}
      prefillChat={handlePrefillChat}
    >
      <Suspense><GalleryIntentHandler /></Suspense>
      <div className="flex h-[calc(100vh-65px)]">
        {/* Main content: widget grid */}
        <main
          className={`flex-1 overflow-y-auto ${isResizing ? "" : "transition-all duration-300"}`}
          style={{ marginRight: chatOpen ? `${chatWidth}px` : 0 }}
        >
          {children}
        </main>

        {/* Chat panel */}
        <ChatPanel
          ref={chatRef}
          open={chatOpen}
          onToggle={() => setChatOpen((prev) => !prev)}
          sessionId={sessionId}
          initialMessages={initialMessages}
          familiarityLevel={familiarityLevel}
          stoicConcepts={stoicConcepts}
          width={chatWidth}
          onResize={setChatWidth}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => { setIsResizing(false); localStorage.setItem(CHAT_WIDTH_KEY, String(chatWidth)); }}
        />
      </div>
    </DashboardProvider>
  );
}
