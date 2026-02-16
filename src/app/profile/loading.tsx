import { SkeletonLine, SkeletonCard } from "@/components/core/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <SkeletonLine width="w-48" height="h-8" />
      </div>
      <SkeletonCard lines={4} className="mb-6" />
      <SkeletonCard lines={2} className="mb-6" />
      <SkeletonCard lines={3} />
    </div>
  );
}
