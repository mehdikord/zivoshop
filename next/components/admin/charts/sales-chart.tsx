"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2 } from "lucide-react";

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

const monthNames: Record<string, string> = {
  "01": "فروردین",
  "02": "اردیبهشت",
  "03": "خرداد",
  "04": "تیر",
  "05": "مرداد",
  "06": "شهریور",
  "07": "مهر",
  "08": "آبان",
  "09": "آذر",
  "10": "دی",
  "11": "بهمن",
  "12": "اسفند",
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} میلیارد`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} میلیون`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} هزار`;
  }
  return amount.toLocaleString("fa-IR");
}

export function SalesChart() {
  const [data, setData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data.monthlyRevenue);
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

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text)]">درآمد ماهانه</h3>
        </div>
        <div className="flex h-48 items-center justify-center text-sm text-[var(--text-muted)]">
          داده‌ای موجود نیست
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="font-semibold text-[var(--text)]">درآمد ماهانه (6 ماه اخیر)</h3>
      </div>

      <div className="flex items-end gap-3" style={{ height: "200px" }}>
        {data.map((item) => {
          const monthParts = item.month.split("-");
          const monthNum = monthParts[1] ?? "01";
          const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

          return (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                {formatCurrency(item.revenue)}
              </span>
              <div className="relative w-full" style={{ height: "140px" }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    background: "linear-gradient(to top, var(--primary), var(--gold))",
                  }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {monthNames[monthNum] || monthNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
