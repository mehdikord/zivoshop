import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { cn } from "@/lib/utils";

/**
 * Page-level skeleton for full-page loading (PRD §40).
 * Used on pages with header, sidebar, and main content area.
 */
export function PageSkeleton({
  showSidebar = true,
  className,
}: { showSidebar?: boolean; className?: string } = {}) {
  return (
    <main className={cn("bg-background", className)}>
      {/* Top bar skeleton */}
      <div className="sticky top-0 z-40 bg-surface/95 shadow-soft backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="mt-2 h-4 w-64 rounded" />
        </div>

        {/* Shell: sidebar + content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {showSidebar && (
            <aside className="lg:w-64 flex-shrink-0">
              <Skeleton className="h-40 w-full rounded-2xl border border-border/40" />
              <Skeleton className="mt-4 h-32 w-full rounded-2xl border border-border/40" />
            </aside>
          )}

          <div className="min-w-0 flex-1 space-y-6">
            {/* Generic content cards */}
            <Skeleton className="h-24 w-full rounded-2xl border border-border/40" />
            <Skeleton className="h-32 w-full rounded-2xl border border-border/40" />
            <Skeleton className="h-40 w-full rounded-2xl border border-border/40" />
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Dashboard-specific skeleton with stat cards + recent orders.
 */
export function DashboardSkeleton({ className }: { className?: string } = {}) {
  return (
    <main className={cn("bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome banner */}
        <Skeleton className="h-24 w-full rounded-2xl border border-border/40 mb-8" />

        {/* Stat cards (4) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl border border-border/40" />
          ))}
        </div>

        {/* Recent orders section header */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>

        {/* Order cards (3) */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl border border-border/40" />
          ))}
        </div>

        {/* Default address section */}
        <div className="mt-8">
          <Skeleton className="h-5 w-32 rounded mb-4" />
          <Skeleton className="h-32 w-full rounded-2xl border border-border/40" />
        </div>
      </div>
    </main>
  );
}

/**
 * Orders list skeleton with tab filters + order cards.
 */
export function OrdersSkeleton({ className }: { className?: string } = {}) {
  return (
    <main className={cn("bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page title */}
        <Skeleton className="h-8 w-48 rounded mb-8" />

        {/* Tab bar */}
        <Skeleton className="h-12 w-full border-b border-border/50 mb-6" />

        {/* Order cards (5) */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl border border-border/40" />
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * Order detail skeleton with timeline, items, pricing, address.
 */
export function OrderDetailSkeleton({ className }: { className?: string } = {}) {
  return (
    <main className={cn("bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header + back link */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Timeline */}
            <Skeleton className="h-80 w-full rounded-2xl border border-border/40 p-5" />
            {/* Products */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl bg-background/50 p-4" />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Skeleton className="h-60 w-full rounded-2xl border border-border/40 p-5" />
            {/* Shipping address */}
            <Skeleton className="h-48 w-full rounded-2xl border border-border/40 p-5" />
            {/* Note */}
            <Skeleton className="h-28 w-full rounded-2xl border border-border/40 p-5" />
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Profile page skeleton with name/email fields + password section.
 */
export function ProfileSkeleton({ className }: { className?: string } = {}) {
  return (
    <main className={cn("bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 rounded mb-8" />

        {/* Profile info card */}
        <Skeleton className="h-72 w-full rounded-2xl border border-border/40 p-5 mb-8" />

        {/* Password section */}
        <Skeleton className="h-72 w-full rounded-2xl border border-border/40 p-5" />
      </div>
    </main>
  );
}

/**
 * Addresses page skeleton with add button + address cards.
 */
export function AddressesSkeleton({ className }: { className?: string } = {}) {
  return (
    <main className={cn("bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 rounded mb-8" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-10 w-28 rounded" />
        </div>

        {/* Address cards (3) */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl border border-border/40 p-4" />
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * Wishlist skeleton with product grid.
 */
export function WishlistSkeleton({ className }: { className?: string } = {}) {
  return (
    <main className={cn("bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 rounded mb-8" />
        <ProductGridSkeleton count={6} />
      </div>
    </main>
  );
}