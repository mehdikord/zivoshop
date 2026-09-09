"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Loader2, ExternalLink } from "lucide-react";

interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  userName: string;
  itemCount: number;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "در انتظار", color: "#6B7280", bg: "#F3F4F6" },
  processing: { label: "در حال آماده‌سازی", color: "#2563EB", bg: "#EFF6FF" },
  shipped: { label: "ارسال شده", color: "#7C3AED", bg: "#F5F3FF" },
  delivered: { label: "تحویل شده", color: "#16A34A", bg: "#F0FDF4" },
  cancelled: { label: "لغو شده", color: "#DC2626", bg: "#FEF2F2" },
  returned: { label: "مرجوع شده", color: "#EA580C", bg: "#FFF7ED" },
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fa-IR") + " تومان";
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setOrders(result.data.recentOrders);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text)]">آخرین سفارشات</h3>
        </div>
        <a
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
        >
          مشاهده همه
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)]">
          سفارشی ثبت نشده است
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                  شماره سفارش
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                  مشتری
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                  مبلغ
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                  تاریخ
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const config = statusConfig[order.status] || {
                  label: order.status,
                  color: "#6B7280",
                  bg: "#F3F4F6",
                };

                return (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-[var(--primary)] hover:underline"
                      >
                        {order.orderNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {order.userName}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text)]">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
