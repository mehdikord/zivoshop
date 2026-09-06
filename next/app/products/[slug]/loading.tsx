import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* gallery skeleton */}
          <div className="hidden gap-4 lg:grid lg:grid-cols-[96px_minmax(0,1fr)]">
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          </div>
          <div className="aspect-[4/5] lg:hidden">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>

          {/* info skeleton */}
          <div className="space-y-5">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-7 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-24 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-32 rounded-xl" />
              <Skeleton className="h-9 w-20 rounded-xl" />
            </div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="size-12 rounded-xl" />
              ))}
            </div>
            <div className="flex gap-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="size-10 rounded-full" />
              ))}
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-12 space-y-4">
          <div className="flex gap-4 border-b border-border/60">
            <Skeleton className="h-10 w-20 rounded-none" />
            <Skeleton className="h-10 w-20 rounded-none" />
            <Skeleton className="h-10 w-24 rounded-none" />
          </div>
          <div className="space-y-3 pt-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full rounded-full" />
            ))}
          </div>
        </div>

        {/* related */}
        <div className="mt-12">
          <Skeleton className="h-6 w-40 rounded-xl" />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-4 w-4/5 rounded-full" />
                  <Skeleton className="h-4 w-2/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
