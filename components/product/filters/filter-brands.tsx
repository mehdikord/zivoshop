"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useFilterContext } from "@/components/product/filters/filter-context";
import { formatNumber } from "@/lib/format";

/** Multi-select brand filter. */
export function FilterBrands() {
  const { query, options, handlers } = useFilterContext();

  return (
    <ul className="space-y-2.5">
      {options.brands.map((brand) => {
        const checked = query.brands.includes(brand.id);
        return (
          <li key={brand.id}>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text">
              <Checkbox
                checked={checked}
                onCheckedChange={() => handlers.onToggleBrand(brand.id)}
                aria-label={`فیلتر برند ${brand.name}`}
              />
              <span className="flex-1 leading-5">{brand.name}</span>
              <span className="text-xs text-text-muted tabular-nums">
                {formatNumber(brand.count)}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
