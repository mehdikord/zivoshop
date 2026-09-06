"use client";

import { Check } from "lucide-react";
import { useFilterContext } from "@/components/product/filters/filter-context";
import { cn } from "@/lib/utils";

/** Multi-select color swatches. */
export function FilterColors() {
  const { query, options, handlers } = useFilterContext();

  return (
    <ul className="flex flex-wrap gap-2.5">
      {options.colors.map((color) => {
        const selected = query.colors.includes(color.name);
        return (
          <li key={color.id}>
            <button
              type="button"
              onClick={() => handlers.onToggleColor(color.name)}
              aria-pressed={selected}
              aria-label={`فیلتر رنگ ${color.name}`}
              title={color.name}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border border-border transition-transform hover:scale-105",
                selected && "border-gold-dark ring-2 ring-gold-dark/40",
              )}
              style={{ backgroundColor: color.hex }}
            >
              {selected ? (
                <Check
                  className={cn(
                    "size-4",
                    isLightColor(color.hex) ? "text-text" : "text-background",
                  )}
                  aria-hidden
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function isLightColor(hex: string): boolean {
  const m = hex.replace("#", "");
  if (m.length !== 6) return false;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
