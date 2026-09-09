"use client";

import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SortSelect } from "@/components/product/sort-select";
import { formatNumber } from "@/lib/format";
import type { SortOption } from "@/stores/filter-store";

/** PLP toolbar: mobile filter trigger + sort control. */
export function ProductsToolbar({
  activeCount,
  sort,
  onSortChange,
  onOpenFilters,
}: {
  activeCount: number;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onOpenFilters: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline-gold"
        size="sm"
        className="lg:hidden"
        onClick={onOpenFilters}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        فیلترها
        {activeCount > 0 ? (
          <Badge variant="gold" className="min-w-5 justify-center px-1.5">
            {formatNumber(activeCount)}
          </Badge>
        ) : null}
      </Button>
      <div className="flex-1 lg:flex-none" />
      <SortSelect value={sort} onChange={onSortChange} />
    </div>
  );
}
