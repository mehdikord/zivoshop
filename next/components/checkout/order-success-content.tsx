"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/format";

interface SuccessOrder {
  id: string;
  orderNumber: string;
  total: number;
  createdAt: string;
  status: string;
  city?: string;
  province?: string;
  items: Array<{
    id: string;
    name: string;
    size?: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    unitDiscount: number;
  }>;
}

/**
 * Order success page content (PRD §27).
 * Shows success message, order number, amount, and CTA.
 */
export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<SuccessOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setOrder(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-sm text-text-muted">سفارشی یافت نشد.</p>
        <Button variant="gold" asChild className="mt-4">
          <Link href="/">بازگشت به صفحه اصلی</Link>
        </Button>
      </div>
    );
  }

  const city = order.city;
  const province = order.province;

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="size-8 text-green-600" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-text sm:text-2xl">
          سفارش شما با موفقیت ثبت شد!
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          سفارش شما با موفقیت پرداخت و ثبت شد. به زودی آماده ارسال خواهد شد.
        </p>
      </div>

      {/* Order info card */}
      <div className="mx-auto max-w-sm rounded-2xl border border-border/60 bg-surface p-5 text-start">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">شماره سفارش</span>
            <span className="font-bold text-text tabular-nums">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">تاریخ ثبت</span>
            <span className="text-text-secondary">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">مبلغ کل</span>
            <span className="font-bold text-gold-dark tabular-nums">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">آدرس ارسال</span>
            <span className="text-end text-text-secondary">
              {city}، {province}
            </span>
          </div>
        </div>
      </div>

      {/* Items preview */}
      <div className="mx-auto max-w-sm rounded-2xl border border-border/60 bg-surface p-5">
        <div className="flex items-center gap-2 mb-3">
          <Package className="size-4 text-gold-dark" aria-hidden />
          <p className="text-sm font-semibold text-text">
            اقلام سفارش ({order.items.length} کالا)
          </p>
        </div>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {item.name} ({item.size}/{item.color}) × {item.quantity}
              </span>
              <span className="tabular-nums text-text-muted">
                {formatPrice((item.unitPrice - item.unitDiscount) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="gold" asChild>
          <Link href="/products">
            <ArrowLeft className="ms-1.5 size-4" aria-hidden />
            مشاهده محصولات
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">بازگشت به صفحه اصلی</Link>
        </Button>
      </div>
    </div>
  );
}
