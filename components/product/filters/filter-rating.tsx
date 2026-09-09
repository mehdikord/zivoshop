"use client";

import { Star } from "lucide-react";
import { useFilterContext } from "@/components/product/filters/filter-context";
import { cn } from "@/lib/utils";

const RATING_OPTIONS = [
  { value: 4, label: "۴ ستاره و بالاتر" },
  { value: 3, label: "۳ ستاره و بالاتر" },
] as const;

/** Minimum-rating filter with star icons. */
export function FilterRating() {
  const { query, handlers } = useFilterContext();
  const selected = query.minRating;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => handlers.onSetMinRating(null)}
        aria-pressed={selected === null}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-secondary/60 hover:text-text",
          selected === null && "bg-gold-light/40 font-semibold text-primary",
        )}
      >
        <span
          className={cn(
            "size-4 rounded-full border border-border",
            selected === null && "border-gold-dark bg-gold-dark",
          )}
          aria-hidden
        />
        هر امتیازی
      </button>
      {RATING_OPTIONS.map((option) => {
        const active = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handlers.onSetMinRating(option.value)}
            aria-pressed={active}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-secondary/60 hover:text-text",
              active && "bg-gold-light/40 font-semibold text-primary",
            )}
          >
            <span
              className={cn(
                "size-4 rounded-full border border-border",
                active && "border-gold-dark bg-gold-dark",
              )}
              aria-hidden
            />
            <span className="flex items-center gap-1">
              {Array.from({ length: option.value }).map((_, i) => (
                <Star
                  key={i}
                  className="size-3.5 fill-gold-dark text-gold-dark"
                  aria-hidden
                />
              ))}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
