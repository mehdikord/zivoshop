"use client";

import { useWishlistStore } from "@/stores/wishlist-store";

export function useWishlist() {
  const productIds = useWishlistStore((s) => s.productIds);
  const toggle = useWishlistStore((s) => s.toggle);
  const add = useWishlistStore((s) => s.add);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);

  return {
    productIds,
    count: productIds.length,
    isWishlisted: (productId: string) => productIds.includes(productId),
    toggle,
    add,
    remove,
    clear,
  };
}
