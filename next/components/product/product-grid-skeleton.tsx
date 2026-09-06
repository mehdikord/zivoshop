import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Skeleton grid matching the product grids (PRD §40). */
export function ProductGridSkeleton({
  count = 8,
  className,
  gridClassName,
}: {
  count?: number;
  className?: string;
  gridClassName?: string;
}) {
  const grid = gridClassName ?? "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4";
  return (
    <div className={cn(grid, className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-4/5 rounded-full" />
            <Skeleton className="h-4 w-2/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
