"use client";

import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalSpent: number;
  orderCount: number;
  orders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "در انتظار", color: "#6B7280", bg: "#F3F4F6" },
  processing: { label: "در حال آماده‌سازی", color: "#2563EB", bg: "#EFF6FF" },
  shipped: { label: "ارسال شده", color: "#7C3AED", bg: "#F5F3FF" },
  delivered: { label: "تحویل شده", color: "#16A34A", bg: "#F0FDF4" },
  cancelled: { label: "لغو شده", color: "#DC2626", bg: "#FEF2F2" },
  returned: { label: "مرجوع شده", color: "#EA580C", bg: "#FFF7ED" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fa-IR") + " تومان";
}

export function UserDetailDialog({
  user,
  onClose,
}: {
  user: UserDetail;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">{user.name}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                شناسه: #{user.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] p-3">
              <Phone className="h-4 w-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">موبایل</p>
                <p className="text-sm font-medium text-[var(--text)]" dir="ltr">
                  {user.mobile}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] p-3">
              <Mail className="h-4 w-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">ایمیل</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {user.email || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] p-3">
              <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">تاریخ ثبت‌نام</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] p-3">
              <Clock className="h-4 w-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">آخرین ورود</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {formatDate(user.lastLoginAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Status & Total */}
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-[var(--background)] p-3 text-center">
              <p className="text-xs text-[var(--text-muted)]">وضعیت</p>
              <div className="mt-1 flex items-center justify-center gap-1">
                {user.isActive ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                    <span className="text-sm font-medium text-[var(--success)]">فعال</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-[var(--destructive)]" />
                    <span className="text-sm font-medium text-[var(--destructive)]">غیرفعال</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 rounded-lg bg-[var(--background)] p-3 text-center">
              <p className="text-xs text-[var(--text-muted)]">کل خرید</p>
              <p className="mt-1 text-sm font-bold text-[var(--primary)]">
                {formatCurrency(user.totalSpent)}
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-[var(--background)] p-3 text-center">
              <p className="text-xs text-[var(--text-muted)]">تعداد سفارش</p>
              <p className="mt-1 text-sm font-bold text-[var(--text)]">
                {user.orderCount}
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          {user.orders.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">
                آخرین سفارشات
              </h3>
              <div className="space-y-2">
                {user.orders.map((order) => {
                  const config = statusConfig[order.status] || {
                    label: order.status,
                    color: "#6B7280",
                    bg: "#F3F4F6",
                  };
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          {order.orderNumber}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: config.bg, color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--text)]">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
