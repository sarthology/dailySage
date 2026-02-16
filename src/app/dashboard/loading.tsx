import { SkeletonLine, SkeletonCard } from "@/components/core/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
      {/* Greeting */}
      <div className="mb-8">
        <SkeletonLine width="w-48" height="h-8" />
        <div className="mt-2">
          <SkeletonLine width="w-72" height="h-4" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
      </div>

      {/* Recent sessions */}
      <div className="space-y-4">
        <SkeletonLine width="w-40" height="h-6" />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
    </div>
  );
}
