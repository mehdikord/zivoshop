"use client";

import { Plus, ShoppingCart, Users, Star, ArrowLeft } from "lucide-react";

const actions = [
  {
    label: "محصول جدید",
    href: "/admin/products/new",
    icon: Plus,
    color: "var(--primary)",
  },
  {
    label: "مشاهده سفارشات",
    href: "/admin/orders",
    icon: ShoppingCart,
    color: "var(--info)",
  },
  {
    label: "مدیریت کاربران",
    href: "/admin/users",
    icon: Users,
    color: "var(--success)",
  },
  {
    label: "مدیریت نظرات",
    href: "/admin/reviews",
    icon: Star,
    color: "var(--gold-dark)",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h3 className="mb-4 font-semibold text-[var(--text)]">عملیات سریع</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] p-4 transition-all hover:border-[var(--primary)] hover:shadow-sm"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:scale-110"
              style={{
                backgroundColor: `${action.color}15`,
                color: action.color,
              }}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-center text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text)]">
              {action.label}
            </span>
            <ArrowLeft className="h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </div>
  );
}
