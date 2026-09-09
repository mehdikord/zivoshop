"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  /** Product ids only — product data is resolved through the data layer. */
  productIds: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      productIds: [],

      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),

      add: (productId) =>
        set((state) =>
          state.productIds.includes(productId)
            ? state
            : { productIds: [...state.productIds, productId] },
        ),

      remove: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),

      clear: () => set({ productIds: [] }),
    }),
    {
      name: "zivo-wishlist",
      partialize: (state) => ({ productIds: state.productIds }),
    },
  ),
);
