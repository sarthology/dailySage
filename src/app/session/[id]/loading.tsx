import { SkeletonLine } from "@/components/core/Skeleton";

export default function SessionLoading() {
  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      <div className="flex-1 px-4 md:px-8">
        <div className="mx-auto max-w-3xl py-8 space-y-6">
          {/* Simulated chat messages */}
          <div className="py-5">
            <SkeletonLine width="w-12" height="h-3" />
            <div className="mt-3 space-y-2">
              <SkeletonLine width="w-3/4" />
            </div>
          </div>
          <div className="border-l-2 border-muted-light py-5 pl-5">
            <SkeletonLine width="w-32" height="h-3" />
            <div className="mt-3 space-y-2">
              <SkeletonLine width="w-full" />
              <SkeletonLine width="w-full" />
              <SkeletonLine width="w-2/3" />
            </div>
          </div>
          <div className="py-5">
            <SkeletonLine width="w-12" height="h-3" />
            <div className="mt-3 space-y-2">
              <SkeletonLine width="w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
