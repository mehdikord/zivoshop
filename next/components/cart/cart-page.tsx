"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { requiresConfirmation } from "@/lib/cart";
import { useCartStore } from "@/stores/cart-store";

const crumbItems = [
  { label: "خانه", href: "/" as const },
  { label: "سبد خرید" },
];

/**
 * Cart page client component (PRD §22).
 * Two-column on desktop, single column on mobile.
 */
export function CartPageClient() {
  const items = useCartStore((s) => s.items);
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
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <Breadcrumb items={crumbItems} />

        <h1 className="mt-6 text-xl font-extrabold text-text sm:text-2xl">
          سبد خرید
        </h1>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
            {/* Item list */}
            <div>
              <div className="rounded-2xl border border-border/60 bg-surface px-5">
                {items.map((item) => (
                  <div key={`${item.productId}__${item.size}__${item.color}`}>
                    <CartItem
                      item={item}
                      variant="page"
                      onRemove={handleRemove}
                      onQuantityChange={updateQuantity}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <CartSummary
                subtotal={subtotal}
                saving={saving}
                itemCount={itemCount}
                variant="page"
              />
            </div>
          </div>
        )}
      </div>

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
    </main>
  );
}
