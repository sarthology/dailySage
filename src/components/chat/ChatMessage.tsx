interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isCoach = role === "assistant";

  return (
    <div
      className={`py-5 ${isCoach ? "border-l-2 border-accent pl-5" : "pl-0"}`}
    >
      <p className="text-caption mb-2 uppercase tracking-wider text-muted">
        {isCoach ? "Philosopher Coach" : "You"}
      </p>
      <div className="text-body text-ink leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
