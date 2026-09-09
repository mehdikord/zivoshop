"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "@/components/product/filters/filter-panel";
import { useFilterContext } from "@/components/product/filters/filter-context";
import { formatNumber } from "@/lib/format";

/**
 * Mobile filter bottom-sheet (PRD §15: «Bottom Sheet/Drawer»).
 * Reuses the same FilterPanel as the desktop sidebar.
 */
export function FilterSheet({
  open,
  onOpenChange,
  total,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}) {
  const { handlers } = useFilterContext();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto max-w-xl">
        <DrawerHeader className="border-b border-border/70 pb-3">
          <DrawerTitle className="flex items-center gap-2 text-sm font-bold text-text">
            <SlidersHorizontal className="size-4 text-gold-dark" aria-hidden />
            فیلترها
          </DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[55dvh] overflow-y-auto px-5 py-2">
          <FilterPanel />
        </div>
        <DrawerFooter className="flex-row items-center gap-3 border-t border-border/70 pb-6">
          <Button variant="outline-gold" size="sm" onClick={handlers.onClearAll}>
            حذف فیلترها
          </Button>
          <Button
            variant="gold"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            نمایش {formatNumber(total)} نتیجه
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
