import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <div className="prose text-body max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
