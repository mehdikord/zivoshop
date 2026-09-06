"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useFilterContext } from "@/components/product/filters/filter-context";
import { formatNumber } from "@/lib/format";

/**
 * Dual-thumb price range slider. Local state tracks the drag so the
 * thumb follows the pointer; the parent re-keys this component with the
 * committed range so external changes (reset, back/forward) re-sync it.
 */
export function FilterPrice() {
  const { query, options, handlers } = useFilterContext();
  const { min, max } = options.priceRange;

  const [range, setRange] = useState<[number, number]>([
    query.minPrice > 0 ? query.minPrice : min,
    query.maxPrice > 0 ? query.maxPrice : max,
  ]);

  const from = query.minPrice > 0 ? query.minPrice : min;
  const to = query.maxPrice > 0 ? query.maxPrice : max;

  return (
    <div>
      <Slider
        min={min}
        max={max}
        step={10000}
        minStepsBetweenThumbs={1}
        value={range}
        onValueChange={(v) => setRange([v[0] ?? min, v[1] ?? max])}
        onValueCommit={(v) =>
          handlers.onSetPriceRange(v[0] ?? min, v[1] ?? max)
        }
        aria-label="محدوده قیمت"
        className="mt-1"
      />
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-text-secondary">
        <span>
          از{" "}
          <span className="font-semibold text-text tabular-nums">
            {formatNumber(from)}
          </span>{" "}
          تومان
        </span>
        <span className="text-text-muted">تا</span>
        <span>
          <span className="font-semibold text-text tabular-nums">
            {formatNumber(to)}
          </span>{" "}
          تومان
        </span>
      </div>
    </div>
  );
}
