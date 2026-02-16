interface DailyMaximProps {
  title: string;
  description: string;
  content: {
    maxim?: string;
    explanation?: string;
    practical_application?: string;
  };
  philosopher?: { name: string; school: string; relevance: string };
}

export function DailyMaxim({
  title,
  description,
  content,
  philosopher,
}: DailyMaximProps) {
  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-warm uppercase tracking-wider">
        Daily Maxim
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 text-muted">{description}</p>

      {content.maxim && (
        <blockquote className="mt-6 border-l-2 border-warm pl-4">
          <p className="font-display text-lg italic leading-relaxed text-ink">
            &ldquo;{content.maxim}&rdquo;
          </p>
        </blockquote>
      )}

      {content.explanation && (
        <p className="text-body-sm mt-4 text-ink leading-relaxed">
          {content.explanation}
        </p>
      )}

      {content.practical_application && (
        <div className="mt-4 rounded-md bg-paper p-4">
          <p className="text-label text-muted mb-1">Try this today</p>
          <p className="text-body-sm text-ink">{content.practical_application}</p>
        </div>
      )}

      {philosopher && (
        <div className="mt-4 border-t border-muted-light pt-4">
          <p className="text-caption text-muted">
            <span className="font-semibold">{philosopher.name}</span> &middot; {philosopher.school}
          </p>
          <p className="text-body-sm mt-1 italic text-muted">{philosopher.relevance}</p>
        </div>
      )}
    </div>
  );
}
