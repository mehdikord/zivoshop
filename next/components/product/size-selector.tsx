"use client";

import { Ruler } from "lucide-react";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { cn } from "@/lib/utils";

/**
 * Size selector (PRD §17). Out-of-stock sizes are disabled and
 * struck through; the available sizes behave as a radio group.
 */
export function SizeSelector({
  sizes,
  unavailable,
  value,
  onChange,
}: {
  sizes: string[];
  unavailable: string[];
  value: string | null;
  onChange: (size: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-text">
          سایز
          {value ? (
            <span className="ms-2 font-bold text-gold-dark">{value}</span>
          ) : null}
        </span>
        <SizeGuideDialog
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              <Ruler className="size-3.5" aria-hidden />
              راهنمای سایز
            </button>
          }
        />
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="انتخاب سایز"
      >
        {sizes.map((size) => {
          const isUnavailable = unavailable.includes(size);
          const selected = value === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isUnavailable}
              onClick={() => onChange(size)}
              className={cn(
                "min-w-12 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text transition-colors focus-visible:ring-2 focus-visible:ring-gold-dark/50",
                "hover:border-gold-dark",
                selected &&
                  "border-gold-dark bg-gold-dark text-background hover:text-background",
                isUnavailable &&
                  "cursor-not-allowed text-text-muted/50 line-through hover:border-border hover:text-text-muted/50",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
