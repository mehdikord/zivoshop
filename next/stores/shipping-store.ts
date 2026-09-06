"use client";

import { create } from "zustand";
import {
  DEFAULT_SHIPPING_FEE,
  DEFAULT_SHIPPING_THRESHOLD,
  type ShippingProvince,
} from "@/lib/cart";

type ShippingState = {
  freeShippingThreshold: number;
  baseShippingFee: number;
  provinces: ShippingProvince[];
  loaded: boolean;
  load: () => Promise<void>;
};

export const useShippingStore = create<ShippingState>()((set, get) => ({
  freeShippingThreshold: DEFAULT_SHIPPING_THRESHOLD,
  baseShippingFee: DEFAULT_SHIPPING_FEE,
  provinces: [],
  loaded: false,

  load: async () => {
    const state = get();
    if (state.loaded) return;
    try {
      const res = await fetch("/api/shipping-settings");
      const json = await res.json();
      if (json.success) {
        set({
          freeShippingThreshold: json.data.freeShippingThreshold,
          baseShippingFee: json.data.baseShippingFee,
          provinces: json.data.provinces,
          loaded: true,
        });
      }
    } catch {
      // Keep built-in defaults when the request fails.
    }
  },
}));