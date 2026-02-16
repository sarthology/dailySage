interface QuoteBlockProps {
  text: string;
  philosopher: string;
  source?: string;
}

export function QuoteBlock({ text, philosopher, source }: QuoteBlockProps) {
  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-5">
      <blockquote>
        <p className="font-display text-base italic leading-relaxed text-ink">
          &ldquo;{text}&rdquo;
        </p>
        <footer className="mt-3">
          <cite className="text-caption not-italic text-muted">
            — {philosopher}
            {source && (
              <span className="text-muted/60">, {source}</span>
            )}
          </cite>
        </footer>
      </blockquote>
    </div>
  );
}
