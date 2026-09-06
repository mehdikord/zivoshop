"use client";

import { useState, useEffect } from "react";
import { PieChart, Loader2 } from "lucide-react";

interface StatusData {
  status: string;
  count: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "در انتظار", color: "#9CA3AF" },
  processing: { label: "در حال آماده‌سازی", color: "#3B82F6" },
  shipped: { label: "ارسال شده", color: "#8B5CF6" },
  delivered: { label: "تحویل شده", color: "#22C55E" },
  cancelled: { label: "لغو شده", color: "#EF4444" },
  returned: { label: "مرجوع شده", color: "#F97316" },
};

export function OrdersChart() {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data.ordersByStatus);
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

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text)]">وضعیت سفارشات</h3>
        </div>
        <div className="flex h-48 items-center justify-center text-sm text-[var(--text-muted)]">
          داده‌ای موجود نیست
        </div>
      </div>
    );
  }

  // Build conic gradient
  let accumulatedPercent = 0;
  const gradientParts: string[] = [];

  data.forEach((item) => {
    const percent = (item.count / total) * 100;
    const config = statusConfig[item.status] || { label: item.status, color: "#9CA3AF" };
    gradientParts.push(
      `${config.color} ${accumulatedPercent}% ${accumulatedPercent + percent}%`
    );
    accumulatedPercent += percent;
  });

  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-6 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="font-semibold text-[var(--text)]">وضعیت سفارشات</h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative h-40 w-40 shrink-0">
          <div
            className="h-full w-full rounded-full"
            style={{ background: gradient }}
          />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-[var(--surface)]">
            <span className="text-lg font-bold text-[var(--text)]">
              {total.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item) => {
            const config = statusConfig[item.status] || {
              label: item.status,
              color: "#9CA3AF",
            };
            const percent = ((item.count / total) * 100).toFixed(1);

            return (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">
                    {item.count.toLocaleString("fa-IR")}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    (%{percent})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
