"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/types";

/**
 * Order card for order history list (PRD §30).
 * Shows order number, date, amount, status, item count, and CTA.
 */
export function OrderCard({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="group rounded-2xl border border-border/50 bg-surface p-4 transition-all hover:border-gold-dark/30 hover:shadow-sm sm:p-5">
      {/* Top row: order number + status */}
      <div className="flex items-center justify-between gap-2">
        <p dir="ltr" className="text-sm font-bold text-text">
          {order.orderNumber}
        </p>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Middle: product preview + info */}
      <div className="mt-4 flex items-start gap-4">
        {/* Product thumbnail */}
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-secondary">
          {firstItem ? (
            <Image
              src={firstItem.image}
              alt={firstItem.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="text-xs text-text-muted">بدون تصویر</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text">
            {firstItem?.name}
            {itemCount > 1 ? ` + ${itemCount - 1} محصول دیگر` : ""}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {formatDate(order.createdAt)}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {itemCount} {itemCount === 1 ? "محصول" : "محصول"}
          </p>
        </div>
      </div>

      {/* Bottom: total + CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
        <div>
          <p className="text-xs text-text-muted">مبلغ کل</p>
          <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
        </div>
        <Link href={`/account/orders/${order.id}` as Route}>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-gold-dark/30 text-gold-dark hover:bg-gold-dark hover:text-surface"
          >
            مشاهده جزئیات
            <ChevronLeft className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
