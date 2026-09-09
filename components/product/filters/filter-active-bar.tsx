"use client";

import { X } from "lucide-react";
import { useFilterContext } from "@/components/product/filters/filter-context";
import { formatNumber } from "@/lib/format";

type Chip = {
  key: string;
  label: string;
  onRemove: () => void;
};

/** Active filter chips + «حذف همه» (PRD §15). */
export function FilterActiveBar() {
  const { query, options, handlers } = useFilterContext();

  const chips: Chip[] = [];

  if (query.category) {
    const name =
      options.categories.find((c) => c.id === query.category)?.name ?? "";
    if (name) {
      chips.push({
        key: "category",
        label: name,
        onRemove: () => handlers.onToggleCategory(query.category, query.categorySlug),
      });
    }
  }

  for (const id of query.brands) {
    const name = options.brands.find((b) => b.id === id)?.name ?? id;
    chips.push({
      key: `brand-${id}`,
      label: name,
      onRemove: () => handlers.onToggleBrand(id),
    });
  }

  for (const size of query.sizes) {
    chips.push({
      key: `size-${size}`,
      label: `سایز ${size}`,
      onRemove: () => handlers.onToggleSize(size),
    });
  }

  for (const color of query.colors) {
    chips.push({
      key: `color-${color}`,
      label: color,
      onRemove: () => handlers.onToggleColor(color),
    });
  }

  if (query.minPrice > 0 || query.maxPrice > 0) {
    const { min, max } = options.priceRange;
    chips.push({
      key: "price",
      label: `${formatNumber(query.minPrice > 0 ? query.minPrice : min)} تا ${formatNumber(query.maxPrice > 0 ? query.maxPrice : max)} تومان`,
      onRemove: () => handlers.onSetPriceRange(0, 0),
    });
  }

  if (query.onSale) {
    chips.push({
      key: "on-sale",
      label: "فقط تخفیف‌دار",
      onRemove: () => handlers.onSetOnSale(false),
    });
  }

  if (query.minRating !== null) {
    chips.push({
      key: "rating",
      label: `${formatNumber(query.minRating)}+ امتیاز`,
      onRemove: () => handlers.onSetMinRating(null),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold-dark/40 bg-gold-light/30 px-3 py-1 text-xs font-medium text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`حذف فیلتر ${chip.label}`}
            className="text-primary/70 transition-colors hover:text-primary"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={handlers.onClearAll}
        className="px-2 text-xs text-text-muted underline-offset-2 transition-colors hover:text-primary hover:underline"
      >
        حذف همه فیلترها
      </button>
    </div>
  );
}
