"use client";

import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  }

  return (
    <div className="border-t border-muted-light bg-paper-light p-4">
      <div className="mx-auto flex max-w-3xl gap-3">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          rows={1}
          className="min-h-[44px] max-h-32 resize-none border-muted-light bg-paper text-ink placeholder:text-muted focus:border-accent"
        />
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className="shrink-0 rounded-md bg-accent px-5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover disabled:opacity-50"
        >
          {isLoading ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
