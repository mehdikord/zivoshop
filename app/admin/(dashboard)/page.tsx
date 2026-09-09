"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, DollarSign, ShoppingCart, Users, Package, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/admin/charts/stats-card";
import { SalesChart } from "@/components/admin/charts/sales-chart";
import { OrdersChart } from "@/components/admin/charts/orders-chart";
import { RecentOrdersTable } from "@/components/admin/charts/recent-orders-table";
import { RecentReviews } from "@/components/admin/charts/recent-reviews";
import { QuickActions } from "@/components/admin/charts/quick-actions";

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalUsers: number;
  usersChange: number;
  totalProducts: number;
  productsChange: number;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} میلیارد تومان`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} میلیون تومان`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} هزار تومان`;
  }
  return amount.toLocaleString("fa-IR") + " تومان";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStats(result.data.stats);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-[var(--primary)]" />
        <h1 className="text-2xl font-bold text-[var(--text)]">داشبورد</h1>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex h-32 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="درآمد (ماه جاری)"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueChange}
            icon={<DollarSign className="h-6 w-6" />}
            color="#16A34A"
          />
          <StatsCard
            title="سفارشات (ماه جاری)"
            value={stats.totalOrders.toLocaleString("fa-IR")}
            change={stats.ordersChange}
            icon={<ShoppingCart className="h-6 w-6" />}
            color="#3B82F6"
          />
          <StatsCard
            title="کاربران جدید (ماه جاری)"
            value={stats.totalUsers.toLocaleString("fa-IR")}
            change={stats.usersChange}
            icon={<Users className="h-6 w-6" />}
            color="#8B5CF6"
          />
          <StatsCard
            title="محصولات موجود"
            value={stats.totalProducts.toLocaleString("fa-IR")}
            change={stats.productsChange}
            icon={<Package className="h-6 w-6" />}
            color="#F97316"
          />
        </div>
      ) : null}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart />
        <OrdersChart />
      </div>

      {/* Recent Orders & Reviews */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrdersTable />
        <RecentReviews />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
