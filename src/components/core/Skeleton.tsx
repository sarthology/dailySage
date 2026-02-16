export function SkeletonLine({
  width = "w-full",
  height = "h-4",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={`${width} ${height} rounded bg-muted-light skeleton-shimmer`}
    />
  );
}

export function SkeletonCard({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-muted-light bg-paper-light p-6 ${className}`}
    >
      <SkeletonLine width="w-24" height="h-3" />
      <div className="mt-3">
        <SkeletonLine width="w-48" height="h-6" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? "w-3/4" : "w-full"}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonPage({
  cards = 3,
  columns = 1,
}: {
  cards?: number;
  columns?: number;
}) {
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
      {/* Header skeleton */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <SkeletonLine width="w-20" height="h-3" />
        <SkeletonLine width="w-64" height="h-8" />
        <SkeletonLine width="w-80" height="h-4" />
      </div>

      {/* Cards grid */}
      <div className={`grid gap-6 ${gridClass}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
