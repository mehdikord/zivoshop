"use client";

import { Tag } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useFilterContext } from "@/components/product/filters/filter-context";

/** «فقط کالاهای تخفیف‌دار» toggle. */
export function FilterOnSale() {
  const { query, handlers } = useFilterContext();

  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor="filter-on-sale"
        className="flex items-center gap-2 text-sm text-text"
      >
        <Tag className="size-4 text-gold-dark" aria-hidden />
        فقط کالاهای تخفیف‌دار
      </label>
      <Switch
        id="filter-on-sale"
        checked={query.onSale}
        onCheckedChange={handlers.onSetOnSale}
      />
    </div>
  );
}
