"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

/**
 * Single cart line item (PRD §22) — shared by the CartDrawer and CartPage.
 * `variant="drawer"` renders compact; `variant="page"` renders spacious.
 */
export function CartItem({
  item,
  variant = "page",
  onRemove,
  onQuantityChange,
}: {
  item: CartItemType;
  variant?: "drawer" | "page";
  onRemove: (key: string) => void;
  onQuantityChange: (key: string, quantity: number) => void;
}) {
  const isDrawer = variant === "drawer";
  const key = `${item.productId}__${item.size}__${item.color}`;
  const effectivePrice = item.discountPrice ?? item.price;
  const hasDiscount = !!item.discountPrice && item.discountPrice < item.price;
  const lineTotal = effectivePrice * item.quantity;
  const canDec = item.quantity > 1;
  const canInc = item.quantity < item.stock;

  return (
    <div
      className={cn(
        "group flex gap-4 border-b border-border/60 last:border-b-0",
        isDrawer ? "py-4" : "py-5 sm:gap-5",
      )}
    >
      {/* Image */}
      <Link
        href={`/products/${item.slug}` as Route}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-surface-secondary",
          isDrawer ? "size-20" : "size-24 sm:size-28",
        )}
        aria-label={item.name}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={isDrawer ? "80px" : "112px"}
          className="object-cover transition-transform group-hover:scale-105"
        />
      </Link>

      {/* Info + controls */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.slug}` as Route}
            className={cn(
              "line-clamp-2 font-semibold text-text transition-colors hover:text-primary",
              isDrawer ? "text-sm leading-5" : "text-sm leading-6 sm:text-base",
            )}
          >
            {item.name}
          </Link>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {item.size ? (
              <span className="inline-flex items-center rounded-md bg-surface-secondary px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                سایز: {item.size}
              </span>
            ) : null}
            {item.color ? (
              <span className="inline-flex items-center rounded-md bg-surface-secondary px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                رنگ: {item.color}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
          {/* Quantity */}
          <div className="flex items-center rounded-xl border border-border bg-surface-secondary/50">
            <button
              type="button"
              disabled={!canDec}
              onClick={() => onQuantityChange(key, item.quantity - 1)}
              aria-label="کاهش تعداد"
              className="flex size-8 items-center justify-center rounded-s-xl border-e border-border text-text transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span className="w-8 text-center text-xs font-bold tabular-nums text-text">
              {formatNumber(item.quantity)}
            </span>
            <button
              type="button"
              disabled={!canInc}
              onClick={() => onQuantityChange(key, item.quantity + 1)}
              aria-label="افزایش تعداد"
              className="flex size-8 items-center justify-center rounded-e-xl border-s border-border text-text transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <span className="text-xs text-text-muted line-through">
                {formatPrice(item.price * item.quantity)}
              </span>
            ) : null}
            <span
              className={cn(
                "font-bold text-gold-dark tabular-nums",
                isDrawer ? "text-sm" : "text-sm sm:text-base",
              )}
            >
              {formatPrice(lineTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(key)}
        aria-label={`حذف ${item.name}`}
        className="self-start rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
