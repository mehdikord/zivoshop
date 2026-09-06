"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Color selector (PRD §18). Shows a swatch + name; unavailable colors
 * are struck out and non-selectable.
 */
export function ColorSelector({
  colors,
  unavailable,
  value,
  onChange,
}: {
  colors: { name: string; hex: string }[];
  unavailable: string[];
  value: string | null;
  onChange: (color: string) => void;
}) {
  const selectedColor = colors.find((c) => c.name === value);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-text">رنگ</span>
        {selectedColor ? (
          <span className="text-sm text-text-muted">
            — <span className="font-bold text-text">{selectedColor.name}</span>
          </span>
        ) : null}
      </div>
      <div
        className="flex flex-wrap gap-2.5"
        role="radiogroup"
        aria-label="انتخاب رنگ"
      >
        {colors.map((color) => {
          const isUnavailable = unavailable.includes(color.name);
          const selected = value === color.name;
          return (
            <button
              key={color.name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={color.name}
              disabled={isUnavailable}
              title={color.name}
              onClick={() => onChange(color.name)}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-full border border-border transition-all",
                "hover:scale-105 focus-visible:ring-2 focus-visible:ring-gold-dark/50",
                selected && "ring-2 ring-gold-dark ring-offset-2 ring-offset-background",
                isUnavailable && "cursor-not-allowed opacity-50 grayscale hover:scale-100",
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
              {isUnavailable ? (
                <span
                  className="pointer-events-none absolute h-px w-7 rotate-45 bg-text/60"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
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
