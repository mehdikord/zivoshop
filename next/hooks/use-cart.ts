"use client";

import { useCartStore, cartItemKey } from "@/stores/cart-store";

/**
 * Cart hook — exposes the cart with derived values computed through
 * zustand selectors so components re-render only on relevant changes.
 */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const lastAddedAt = useCartStore((s) => s.lastAddedAt);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity,
    0,
  );
  const saving = items.reduce(
    (sum, item) =>
      sum +
      Math.max(0, item.price - (item.discountPrice ?? item.price)) *
        item.quantity,
    0,
  );

  return {
    items,
    isDrawerOpen,
    lastAddedAt,
    itemCount,
    subtotal,
    saving,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setDrawerOpen,
    cartItemKey,
  };
}
