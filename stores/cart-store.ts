"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

/**
 * Composite key for a cart line: one line per (product × size × color).
 */
export function cartItemKey(item: Pick<CartItem, "productId" | "size" | "color">): string {
  return `${item.productId}__${item.size}__${item.color}`;
}

type CartState = {
  items: CartItem[];
  isDrawerOpen: boolean;
  /** Timestamp of the last add — used to trigger a subtle badge pulse. */
  lastAddedAt: number | null;
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,
      lastAddedAt: null,

      addItem: (item) =>
        set((state) => {
          const key = cartItemKey(item);
          const existing = state.items.find((i) => cartItemKey(i) === key);
          const items = existing
            ? state.items.map((i) =>
                cartItemKey(i) === key
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                  : i,
              )
            : [...state.items, item];
          return { items, lastAddedAt: Date.now() };
        }),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (cartItemKey(item) !== key) return item;
              const next = Math.max(1, Math.min(quantity, item.stock));
              return { ...item, quantity: next };
            })
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((item) => cartItemKey(item) !== key),
        })),

      clearCart: () => set({ items: [] }),
      setDrawerOpen: (open) => set({ isDrawerOpen: open }),
    }),
    {
      name: "zivo-cart",
      partialize: (state) => ({
        items: state.items,
        lastAddedAt: state.lastAddedAt,
      }),
    },
  ),
);
