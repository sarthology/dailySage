import { SkeletonLine, SkeletonCard } from "@/components/core/Skeleton";

export default function JournalLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 text-center">
        <SkeletonLine width="w-20 mx-auto" height="h-3" />
        <div className="mt-3">
          <SkeletonLine width="w-48 mx-auto" height="h-8" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  );
}
