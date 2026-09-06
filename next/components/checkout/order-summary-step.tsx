"use client";

import Image from "next/image";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import {
  freeShippingRemaining,
  provinceShippingFee,
  shippingCost,
} from "@/lib/cart";
import { useShipping } from "@/hooks/use-shipping";

/**
 * Step 2 — Full order summary review (PRD §26 Invoice Mock).
 * Also used as a reusable component for order success/failure pages.
 */
export function OrderSummaryStep({ onNext }: { onNext: () => void }) {
  const items = useCartStore((s) => s.items);
  const selectedId = useCheckoutStore((s) => s.selectedAddressId);
  const addresses = useCheckoutStore((s) => s.addresses);
  const address = addresses.find((a) => a.id === selectedId);
  const { freeShippingThreshold, baseShippingFee, provinces } = useShipping();

  const subtotal = items.reduce(
    (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
    0,
  );
  const saving = items.reduce(
    (sum, i) =>
      sum + Math.max(0, i.price - (i.discountPrice ?? i.price)) * i.quantity,
    0,
  );
  const destinationFee = provinceShippingFee(
    address?.provinceId,
    address?.province,
    provinces,
    baseShippingFee,
  );
  const shipping = shippingCost(subtotal, freeShippingThreshold, destinationFee);
  const total = subtotal + shipping;

  return (
    <div className="space-y-5">
      {/* Address info */}
      {address ? (
        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <p className="mb-1 text-xs font-semibold text-text-muted">آدرس ارسال</p>
          <p className="text-sm font-bold text-text">
            {address.title} — {address.receiverName}
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">
            {address.fullAddress}، {address.city}، {address.province}
          </p>
          {address.postalCode ? (
            <p className="mt-0.5 text-xs text-text-muted">کدپستی: {address.postalCode}</p>
          ) : null}
        </div>
      ) : null}

      {/* Items table */}
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border/60 bg-surface-secondary/50">
            <tr>
              <th className="px-4 py-3 text-start font-semibold text-text">محصول</th>
              <th className="px-4 py-3 text-center font-semibold text-text">تعداد</th>
              <th className="px-4 py-3 text-end font-semibold text-text">قیمت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => {
              const unit = item.discountPrice ?? item.price;
              const line = unit * item.quantity;
              return (
                <tr key={`${item.productId}__${item.size}__${item.color}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="size-12 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-semibold text-text">{item.name}</p>
                        <p className="text-xs text-text-muted">
                          سایز: {item.size} — رنگ: {item.color}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-text-secondary">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {item.discountPrice ? (
                      <span className="text-xs text-text-muted line-through">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    ) : null}
                    <p className="font-bold text-gold-dark tabular-nums">{formatPrice(line)}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-2 rounded-2xl border border-border/60 bg-surface p-4">
        <div className="flex justify-between text-sm text-text-secondary">
          <span>جمع محصولات</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {saving > 0 ? (
          <div className="flex justify-between text-sm text-green-600">
            <span>صرفه‌جویی</span>
            <span className="font-semibold tabular-nums">−{formatPrice(saving)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-sm text-text-secondary">
          <span>هزینه ارسال</span>
          <span className="tabular-nums">
            {shipping === 0 ? (
              <span className="font-semibold text-green-600">رایگان</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>
        {freeShippingRemaining(subtotal, freeShippingThreshold) > 0 && freeShippingRemaining(subtotal, freeShippingThreshold) < 1_000_000 ? (
          <div className="flex items-center gap-2 rounded-xl bg-surface-secondary/50 px-3 py-2 text-xs text-text-secondary">
            <Truck className="size-4 shrink-0 text-gold-dark" aria-hidden />
            تا ارسال رایگان {formatPrice(freeShippingRemaining(subtotal, freeShippingThreshold))} دیگر خرید کنید
          </div>
        ) : null}
        <div className="border-t border-border/60 pt-2">
          <div className="flex justify-between">
            <span className="text-sm font-bold text-text">مبلغ قابل پرداخت</span>
            <span className="text-lg font-extrabold text-gold-dark tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="gold" onClick={onNext}>
          ادامه
        </Button>
      </div>
    </div>
  );
}
