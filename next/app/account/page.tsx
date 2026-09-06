"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Heart,
  MapPin,
  ChevronLeft,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";

interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  shippingAddress: {
    id: string;
    title: string;
    province: string;
    city: string;
    fullAddress: string;
    receiverName?: string | null;
    receiverPhone?: string | null;
  };
  items: { id: string; name: string; image: string }[];
}

export default function AccountDashboard() {
  const user = useAuthStore((s) => s.user);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const hydrated = useHydrated();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex h-32 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const processingOrders = orders.filter((o) => o.status === "processing" || o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const recentOrders = orders.slice(0, 3);
  const defaultAddress = orders[0]?.shippingAddress;

  const statCards = [
    { label: "کل سفارش‌ها", value: totalOrders, icon: Package, color: "bg-primary/10 text-primary" },
    { label: "جاری / ارسال‌شده", value: processingOrders, icon: Clock, color: "bg-info-light text-info" },
    { label: "تحویل‌شده", value: deliveredOrders, icon: CheckCircle, color: "bg-success-light text-success" },
    { label: "علاقه‌مندی‌ها", value: wishlistIds.length, icon: Heart, color: "bg-destructive-light text-destructive" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="relative rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 sm:p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 size-48 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-10 left-10 size-32 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl font-extrabold text-surface sm:text-3xl">
              سلام، {user?.name?.split(" ")[0] ?? "کاربر"}!
            </p>
            <p className="mt-1 text-surface/80">
              به پنل کاربری زیوو خوش آمدید. چه کمکی از دستمان برمی‌آید؟
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/products" as={undefined}>
              <Button variant="secondary" size="sm" className="bg-surface text-primary hover:bg-surface/90">
                <ChevronLeft className="mr-1.5 size-4" />
                ادامه خرید
              </Button>
            </Link>
            <Link href="/cart" as={undefined}>
              <Button variant="gold" size="sm">
                <ShoppingBag className="ml-1.5 size-4" />
                سبد خرید
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          آمار سفارش‌ها
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-border/40 bg-surface p-4 sm:p-5 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={cn("flex size-10 items-center justify-center rounded-xl", card.color)}>
                  <card.icon className="size-5" aria-hidden />
                </div>
                <span className="text-2xl font-extrabold text-text shrink-0">
                  {card.value}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-text-secondary">
                {card.label}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Recent orders */}
      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recent-heading" className="text-base font-bold text-text">
            آخرین سفارش‌ها
          </h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            مشاهده همه
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 animate-pulse">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--surface-secondary)]" />
                  <div className="h-4 w-20 bg-[var(--surface-secondary)] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                <div className="rounded-2xl border border-border/40 bg-surface p-4 transition-all hover:border-gold-dark/30 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-surface-secondary shrink-0">
                        <Package className="size-6 text-text-muted" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p dir="ltr" className="font-bold text-text truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <OrderStatusBadge status={order.status as "processing" | "shipped" | "delivered" | "cancelled" | "returned"} />
                      <span dir="ltr" className="text-sm font-bold text-text whitespace-nowrap">
                        {formatPrice(order.total)}
                      </span>
                      <ChevronLeft className="size-4 text-text-muted shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-surface py-12 text-center">
            <Package className="mx-auto size-12 text-text-muted" />
            <p className="mt-4 text-sm font-semibold text-text-secondary">
              سفارشی ثبت نشده
            </p>
            <p className="mt-1 text-xs text-text-muted">
              اولین سفارش خود را ثبت کنید
            </p>
          </div>
        )}
      </section>

      {/* Default address */}
      <section aria-labelledby="address-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="address-heading" className="text-base font-bold text-text">
            آدرس پیش‌فرض
          </h2>
          <Link
            href="/account/addresses"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            مدیریت آدرس‌ها
          </Link>
        </div>
        {defaultAddress ? (
          <div className="rounded-2xl border border-border/40 bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gold-light/40">
                  <MapPin className="size-6 text-gold-dark" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-text">{defaultAddress.title}</p>
                  <p className="text-sm text-text-secondary">{defaultAddress.fullAddress}</p>
                  <p className="text-xs text-text-muted">
                    {defaultAddress.city}، {defaultAddress.province}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <Link href="/account/addresses">
                  <span className="text-sm font-medium text-text-secondary transition-colors hover:text-primary">
                    ویرایش
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-surface py-8 text-center">
            <MapPin className="mx-auto size-10 text-text-muted" />
            <p className="mt-3 text-sm font-semibold text-text-secondary">
              آدرس پیش‌فرضی تنظیم نشده
            </p>
            <p className="mt-1 text-xs text-text-muted">
              یک آدرس اضافه کنید تا در سفارش‌ها استفاده شود
            </p>
          </div>
        )}
      </section>
    </div>
  );
}