"use client";

import { Check } from "lucide-react";
import { useFilterContext } from "@/components/product/filters/filter-context";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Single-select category list (PRD §15). */
export function FilterCategories() {
  const { query, options, handlers } = useFilterContext();

  return (
    <ul className="space-y-1">
      {options.categories.map((category) => {
        const selected = query.category === category.id;
        return (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => handlers.onToggleCategory(category.id, category.slug)}
              aria-pressed={selected}
              className={cn(
                "group flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-secondary/60 hover:text-text",
                selected && "bg-gold-light/40 font-semibold text-primary",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border border-border text-transparent",
                    selected && "border-gold-dark bg-gold-dark text-background",
                  )}
                  aria-hidden
                >
                  <Check className="size-3" />
                </span>
                {category.name}
              </span>
              <span className="text-xs text-text-muted tabular-nums">
                {formatNumber(category.count)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
