"use client";

import { Minus, Plus } from "lucide-react";
import { formatNumber } from "@/lib/format";

/**
 * Quantity selector (PRD §19). Buttons increase/decrease within the
 * stock and a hard maximum of 10.
 */
export function QuantitySelector({
  value,
  onChange,
  max,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled?: boolean;
}) {
  const clampedMax = Math.min(max, 10);

  return (
    <div
      className="inline-flex items-center rounded-xl border border-border bg-surface-secondary/50"
      role="group"
      aria-label="تعداد"
    >
      <button
        type="button"
        disabled={disabled || value >= clampedMax}
        onClick={() => onChange(value + 1)}
        aria-label="افزایش تعداد"
        className="flex size-10 items-center justify-center rounded-s-xl border-e border-border text-text transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden />
      </button>
      <span
        className="w-12 text-center text-sm font-bold tabular-nums text-text"
        aria-live="polite"
      >
        {formatNumber(value)}
      </span>
      <button
        type="button"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        aria-label="کاهش تعداد"
        className="flex size-10 items-center justify-center rounded-e-xl border-s border-border text-text transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
