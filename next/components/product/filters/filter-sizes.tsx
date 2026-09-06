"use client";

import { useFilterContext } from "@/components/product/filters/filter-context";
import { cn } from "@/lib/utils";

/** Multi-select size chips. */
export function FilterSizes() {
  const { query, options, handlers } = useFilterContext();

  return (
    <div className="flex flex-wrap gap-2">
      {options.sizes.map((size) => {
        const selected = query.sizes.includes(size.label);
        return (
          <button
            key={size.id}
            type="button"
            onClick={() => handlers.onToggleSize(size.label)}
            aria-pressed={selected}
            className={cn(
              "min-w-11 rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-gold-dark hover:text-primary",
              selected &&
                "border-gold-dark bg-gold-dark text-background hover:text-background",
            )}
          >
            {size.label}
          </button>
        );
      })}
    </div>
  );
}
