"use client";

import { FilterPanel } from "@/components/product/filters/filter-panel";
import { useFilterContext } from "@/components/product/filters/filter-context";

/** Desktop filter sidebar beside the product grid. */
export function FilterSidebar() {
  const { handlers } = useFilterContext();

  return (
    <aside
      aria-label="فیلتر محصولات"
      className="h-fit rounded-2xl border border-border/60 bg-surface p-5 lg:sticky lg:top-28"
    >
      <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
        <h2 className="text-sm font-bold text-text">فیلترها</h2>
        <button
          type="button"
          onClick={handlers.onClearAll}
          className="text-xs text-text-muted transition-colors hover:text-primary"
        >
          حذف همه
        </button>
      </div>
      <FilterPanel />
    </aside>
  );
}
