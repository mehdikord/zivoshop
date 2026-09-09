"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-[var(--success)]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[var(--destructive)]" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive ? "text-[var(--success)]" : "text-[var(--destructive)]"
              )}
            >
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-xs text-[var(--text-muted)]">ماه گذشته</span>
          </div>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
