"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  MapPin,
  StickyNote,
  CreditCard,
  Truck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { OrderTimeline } from "@/components/account/order-timeline";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/types";

/**
 * Order detail page (PRD §31).
 * Visual timeline, shipping info, items table, pricing breakdown, notes.
 */
export function OrderDetailClient({ order }: { order: Order }) {
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!order.id || paying) return;
    setPaying(true);
    try {
      const res = await fetch("/api/payment/zarinpal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setPaying(false);
        toast.error(data.message || "خطا در اتصال به درگاه پرداخت");
      }
    } catch {
      setPaying(false);
      toast.error("خطا در پردازش. لطفاً دوباره تلاش کنید.");
    }
  };

  const needsPayment = order.status === "pending" && !order.paymentRefId;

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-gold-dark transition-colors hover:underline"
      >
        <ChevronRight className="size-4" />
        بازگشت به سفارش‌ها
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p dir="ltr" className="text-lg font-extrabold text-text">
            سفارش {order.orderNumber}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            ثبت شده در {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          {/* Timeline */}
          <section className="rounded-2xl border border-border/40 bg-surface p-5 sm:p-6">
            <h2 className="mb-5 text-base font-bold text-text">وضعیت سفارش</h2>
            <OrderTimeline status={order.status} />
          </section>

          {/* Products */}
          <section className="rounded-2xl border border-border/40 bg-surface p-5 sm:p-6">
            <h2 className="mb-5 text-base font-bold text-text">محصولات سفارش</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl bg-background/50 p-4"
                >
                  <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-secondary">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      سایز: {item.size} · رنگ: {item.color} · تعداد: {item.quantity}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    {item.unitDiscount > 0 ? (
                      <p className="text-xs text-text-muted line-through">
                        {formatPrice(item.unitPrice)}
                      </p>
                    ) : null}
                    <p className="text-sm font-bold text-primary">
                      {formatPrice(item.unitPrice - item.unitDiscount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing breakdown */}
          <section className="rounded-2xl border border-border/40 bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="size-4 text-gold-dark" />
              <h3 className="text-sm font-bold text-text">خلاصه پرداخت</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">جمع سفارش</span>
                <span className="font-medium text-text">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 ? (
                <div className="flex justify-between text-success">
                  <span>تخفیف</span>
                  <span className="font-medium">-{formatPrice(order.discountTotal)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-text-secondary">هزینه ارسال</span>
                <span className="font-medium text-text">
                  {order.shippingCost === 0 ? "رایگان" : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="border-t border-border/50 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-text">مبلغ نهایی</span>
                  <span className="text-lg font-extrabold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
              {order.paymentRefId ? (
                <div className="mt-3 rounded-lg bg-green-50 p-3">
                  <div className="flex justify-between text-xs text-green-700">
                    <span>کد رهگیری پرداخت</span>
                    <span className="font-mono font-bold tabular-nums" dir="ltr">{order.paymentRefId}</span>
                  </div>
                  {order.paymentCardPan ? (
                    <div className="mt-1 flex justify-between text-xs text-green-700/80">
                      <span>شماره کارت</span>
                      <span className="font-mono tabular-nums" dir="ltr">{order.paymentCardPan}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {needsPayment ? (
                <Button
                  variant="gold"
                  className="mt-4 w-full"
                  disabled={paying}
                  onClick={handlePay}
                >
                  {paying ? (
                    <>
                      <Loader2 className="ms-2 size-4 animate-spin" aria-hidden />
                      در حال اتصال به درگاه...
                    </>
                  ) : (
                    `پرداخت ${formatPrice(order.total)}`
                  )}
                </Button>
              ) : null}
            </div>
          </section>

          {/* Shipping address */}
          <section className="rounded-2xl border border-border/40 bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="size-4 text-gold-dark" />
              <h3 className="text-sm font-bold text-text">آدرس ارسال</h3>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                {order.shippingAddress.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {order.shippingAddress.fullAddress}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {order.shippingAddress.city}، {order.shippingAddress.province}
                {order.shippingAddress.postalCode
                  ? ` — کدپستی: ${order.shippingAddress.postalCode}`
                  : ""}
              </p>
              {order.shippingAddress.receiverName ? (
                <p className="mt-1 text-xs text-text-muted">
                  گیرنده: {order.shippingAddress.receiverName}
                </p>
              ) : null}
            </div>
          </section>

          {/* Tracking code */}
          {order.trackNo ? (
            <section className="rounded-2xl border border-border/40 bg-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="size-4 text-gold-dark" />
                <h3 className="text-sm font-bold text-text">کد رهگیری پستی</h3>
              </div>
              <p dir="ltr" className="text-sm font-bold text-text text-left">
                {order.trackNo}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                سفارش شما ارسال شده و می‌توانید با این کد وضعیت مرسوله را پیگیری کنید.
              </p>
            </section>
          ) : null}

          {/* Customer note */}
          {order.customerNote ? (
            <section className="rounded-2xl border border-border/40 bg-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote className="size-4 text-gold-dark" />
                <h3 className="text-sm font-bold text-text">یادداشت</h3>
              </div>
              <p className="text-sm leading-6 text-text-secondary">
                {order.customerNote}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
