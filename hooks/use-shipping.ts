"use client";

import { useEffect } from "react";
import { useShippingStore } from "@/stores/shipping-store";

/**
 * Shipping hook — exposes the loaded shipping configuration and triggers a
 * single shared fetch. Falls back to built-in defaults until loaded.
 */
export function useShipping() {
  const freeShippingThreshold = useShippingStore((s) => s.freeShippingThreshold);
  const baseShippingFee = useShippingStore((s) => s.baseShippingFee);
  const provinces = useShippingStore((s) => s.provinces);
  const loaded = useShippingStore((s) => s.loaded);
  const load = useShippingStore((s) => s.load);

  useEffect(() => {
    if (!loaded) {
      load();
    }
  }, [loaded, load]);

  return { freeShippingThreshold, baseShippingFee, provinces, loaded };
}