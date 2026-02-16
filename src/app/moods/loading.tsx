import { SkeletonLine, SkeletonCard } from "@/components/core/Skeleton";

export default function MoodsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 text-center">
        <SkeletonLine width="w-20 mx-auto" height="h-3" />
        <div className="mt-3">
          <SkeletonLine width="w-48 mx-auto" height="h-8" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
      </div>
      {/* Timeline placeholder */}
      <SkeletonCard lines={6} />
    </div>
  );
}
