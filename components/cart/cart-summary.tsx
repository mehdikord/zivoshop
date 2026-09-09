"use client";

import Link from "next/link";
import type { Route } from "next";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatNumber,
  formatPrice,
} from "@/lib/format";
import {
  freeShippingProgress,
  freeShippingRemaining,
  shippingCost,
} from "@/lib/cart";
import { cn } from "@/lib/utils";
import { useShipping } from "@/hooks/use-shipping";

/**
 * Cart summary (PRD §22): subtotal, savings, shipping progress,
 * total, and the checkout CTA. Shared by drawer and page.
 */
export function CartSummary({
  subtotal,
  saving,
  itemCount,
  variant = "page",
}: {
  subtotal: number;
  saving: number;
  itemCount: number;
  variant?: "drawer" | "page";
}) {
  const isDrawer = variant === "drawer";
  const { freeShippingThreshold, baseShippingFee } = useShipping();
  const shipping = shippingCost(subtotal, freeShippingThreshold, baseShippingFee);
  const total = subtotal + shipping;
  const freeRemaining = freeShippingRemaining(subtotal, freeShippingThreshold);
  const progress = freeShippingProgress(subtotal, freeShippingThreshold);

  return (
    <div
      className={cn(
        "space-y-4",
        isDrawer ? "px-5 pb-5 pt-2" : "rounded-2xl border border-border/60 bg-surface p-5",
      )}
    >
      {/* Free shipping bar */}
      {freeRemaining > 0 ? (
        <div className="rounded-xl bg-surface-secondary/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-text-secondary">
            <Truck className="size-4 shrink-0 text-gold-dark" aria-hidden />
            <span>
              تا ارسال رایگان{" "}
              <span className="font-bold text-gold-dark">
                {formatPrice(freeRemaining)}
              </span>{" "}
              دیگر خرید کنید
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border/40">
            <div
              className="h-full rounded-full bg-gold-dark transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-700">
          <Truck className="size-4 shrink-0" aria-hidden />
          <span className="font-semibold">ارسال رایگان</span> — سفارش شما مشمول ارسال رایگان شد
        </div>
      )}

      {/* Summary rows */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>جمع محصولات ({formatNumber(itemCount)} عدد)</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {saving > 0 ? (
          <div className="flex justify-between text-green-600">
            <span>صرفه‌جویی</span>
            <span className="font-semibold tabular-nums">−{formatPrice(saving)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-text-secondary">
          <span>هزینه ارسال</span>
          <span className="tabular-nums">
            {shipping === 0 ? (
              <span className="font-semibold text-green-600">رایگان</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>
      </div>

      <div className="h-[1px] w-full bg-border" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text">مبلغ قابل پرداخت</span>
        <span className="text-lg font-extrabold text-gold-dark tabular-nums">
          {formatPrice(total)}
        </span>
      </div>

      <Button
        variant="gold"
        className={cn("w-full", isDrawer ? "" : "h-12 text-base")}
        disabled={itemCount === 0}
        asChild
      >
        <Link href={"/checkout" as Route}>
          ادامه به تسویه حساب
        </Link>
      </Button>
      {!isDrawer ? (
        <p className="text-center text-xs text-text-muted">
          هزینه ارسال در مرحله بعد محاسبه میشود
        </p>
      ) : null}
    </div>
  );
}
