/**
 * Cart helpers — shipping logic and thresholds (PRD §22, Phase 05).
 *
 * Defaults mirror the factory configuration; the live values are loaded from
 * the server (see `stores/shipping-store.ts`) and passed into these helpers.
 */
import type { CartItem } from "@/types";

export const DEFAULT_SHIPPING_THRESHOLD = 2_000_000;
export const DEFAULT_SHIPPING_FEE = 45_000;

/** Backwards-compatible aliases (used as fallback when config not loaded). */
export const SHIPPING_THRESHOLD = DEFAULT_SHIPPING_THRESHOLD;
export const SHIPPING_FEE = DEFAULT_SHIPPING_FEE;

export interface ShippingProvince {
  id: string;
  name: string;
  slug: string;
  shippingCost: number;
}

/**
 * Shipping cost for a subtotal: free when the subtotal reaches the
 * configured threshold, otherwise the given per-destination fee.
 */
export function shippingCost(
  subtotal: number,
  threshold: number = SHIPPING_THRESHOLD,
  fee: number = SHIPPING_FEE,
): number {
  return subtotal >= threshold ? 0 : fee;
}

/** Remaining amount before free shipping. */
export function freeShippingRemaining(
  subtotal: number,
  threshold: number = SHIPPING_THRESHOLD,
): number {
  return Math.max(0, threshold - subtotal);
}

/** Progress fraction (0..1) toward free shipping. */
export function freeShippingProgress(
  subtotal: number,
  threshold: number = SHIPPING_THRESHOLD,
): number {
  return threshold > 0 ? Math.min(1, subtotal / threshold) : 1;
}

/**
 * Resolve the shipping fee for a destination. Matches by province id first,
 * then by province name, falling back to the base fee when unknown.
 */
export function provinceShippingFee(
  provinceId: string | undefined,
  provinceName: string | undefined,
  provinces: ShippingProvince[],
  baseFee: number = SHIPPING_FEE,
): number {
  if (provinceId) {
    const byId = provinces.find((p) => p.id === provinceId);
    if (byId) return byId.shippingCost;
  }
  if (provinceName) {
    const byName = provinces.find((p) => p.name.trim() === provinceName.trim());
    if (byName) return byName.shippingCost;
  }
  return baseFee;
}

/** Whether an item requires removal confirmation (high-value). */
export function requiresConfirmation(item: CartItem): boolean {
  return (item.discountPrice ?? item.price) * item.quantity >= 500_000;
}

/** Effective unit price for an item. */
export function unitPrice(item: CartItem): number {
  return item.discountPrice ?? item.price;
}

/** Line total for an item. */
export function lineTotal(item: CartItem): number {
  return unitPrice(item) * item.quantity;
}