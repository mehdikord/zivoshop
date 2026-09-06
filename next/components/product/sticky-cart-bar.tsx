"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";

/**
 * Mobile-only sticky bar pinned above the bottom nav (PRD §53).
 * Shows the final price and a prominent "افزودن به سبد" button;
 * all state/validation is handled by the parent PDP component.
 */
export function StickyCartBar({
  price,
  discountPrice,
  onAdd,
  disabled,
}: {
  price: number;
  discountPrice?: number | null;
  onAdd: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <Price
          price={price}
          discountPrice={discountPrice}
          size="lg"
          className="shrink-0"
        />
        <Button
          variant="gold"
          size="sm"
          disabled={disabled}
          onClick={onAdd}
          className="shrink-0 px-5"
        >
          <ShoppingBag className="ms-1.5 size-4" aria-hidden />
          افزودن به سبد
        </Button>
      </div>
    </div>
  );
}
