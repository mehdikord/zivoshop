"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { formatNumber } from "@/lib/format";
import { requiresConfirmation } from "@/lib/cart";
import { useCartStore } from "@/stores/cart-store";
import { useState } from "react";

/**
 * Cart drawer opened from the header (PRD §54, §22).
 * Shows item list with quantities, totals and the checkout CTA.
 */
export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
    0,
  );
  const saving = items.reduce(
    (sum, i) =>
      sum + Math.max(0, i.price - (i.discountPrice ?? i.price)) * i.quantity,
    0,
  );

  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");

  const handleRemove = (key: string) => {
    const item = items.find(
      (i) => `${i.productId}__${i.size}__${i.color}` === key,
    );
    if (item && requiresConfirmation(item)) {
      setPendingKey(key);
      setPendingName(item.name);
    } else {
      removeItem(key);
    }
  };

  return (
    <>
      <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="flex items-center gap-2.5 text-base">
              <ShoppingBag className="size-5 text-gold-dark" aria-hidden />
              سبد خرید
              {itemCount > 0 ? (
                <Badge variant="gold" className="min-w-5 justify-center px-1.5">
                  {formatNumber(itemCount)}
                </Badge>
              ) : null}
            </SheetTitle>
            <SheetDescription className="sr-only">
              محصولات انتخاب‌شده شما
            </SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Scrollable item list */}
              <div className="flex-1 overflow-y-auto px-5" role="list" aria-label="محصولات سبد خرید">
                {items.map((item) => (
                  <div key={`${item.productId}__${item.size}__${item.color}`} role="listitem">
                    <CartItem
                      item={item}
                      variant="drawer"
                      onRemove={handleRemove}
                      onQuantityChange={updateQuantity}
                    />
                  </div>
                ))}
              </div>

              {/* Summary + CTA */}
              <div className="border-t border-border bg-surface-secondary/30">
                <CartSummary
                  subtotal={subtotal}
                  saving={saving}
                  itemCount={itemCount}
                  variant="drawer"
                />
                <div className="border-t border-border px-5 pb-5 pt-3">
                  <Button variant="ghost" className="w-full text-sm text-text-muted" asChild>
                    <Link href="/cart" onClick={() => setDrawerOpen(false)}>
                      مشاهده سبد خرید
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        open={!!pendingKey}
        onOpenChange={() => {
          setPendingKey(null);
          setPendingName("");
        }}
        title="حذف از سبد خرید"
        description={`آیا از حذف «${pendingName}» از سبد خرید اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
        confirmLabel="حذف"
        confirmVariant="destructive"
        icon="destructive"
        onConfirm={() => {
          if (pendingKey) removeItem(pendingKey);
          setPendingKey(null);
          setPendingName("");
        }}
      />
    </>
  );
}
