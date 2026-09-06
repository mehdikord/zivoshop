"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { OrderCard } from "@/components/account/order-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { cn } from "@/lib/utils";
import { OrdersSkeleton } from "@/components/feedback/skeleton-variants";
import { useState, useEffect } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import type { OrderStatus } from "@/types";

interface ApiOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  couponDiscount: number;
  total: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  postalCode: string;
  fullAddress: string;
  customerNote?: string | undefined;
  adminNote?: string | undefined;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    name: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    unitDiscount: number;
    total: number;
  }[];
  shippingAddress: {
    id: string;
    title: string;
    province: string;
    city: string;
    postalCode: string;
    fullAddress: string;
    receiverName?: string | undefined;
    receiverPhone?: string | undefined;
  };
}

const TABS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "processing", label: "جاری" },
  { key: "shipped", label: "ارسال‌شده" },
  { key: "delivered", label: "تحویل‌شده" },
  { key: "cancelled", label: "لغو / مرجوع" },
];

export default function AccountOrders() {
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const hydrated = useHydrated();
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders once
  useEffect(() => {
    if (!hydrated) return;
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setAllOrders(data.data);
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
    return <OrdersSkeleton />;
  }

  if (loading) {
    return <OrdersSkeleton />;
  }

  const filtered =
    activeTab === "all"
      ? allOrders
      : activeTab === "cancelled"
        ? allOrders.filter((o) => o.status === "cancelled" || o.status === "returned")
        : allOrders.filter((o) => o.status === activeTab);

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 overflow-x-auto border-b border-border/50">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "text-primary"
                  : "text-text-muted hover:text-text",
              )}
            >
              {tab.label}
              {activeTab === tab.key ? (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={activeTab === "all" ? "سفارشی یافت نشد" : "سفارشی با این وضعیت وجود ندارد"}
          description={
            activeTab === "all"
              ? "هنوز سفارشی ثبت نکرده‌اید"
              : "سفارش‌های شما در این بخش نمایش داده نمی‌شوند"
          }
          action={
            activeTab === "all" ? (
              <Link href="/products" as={undefined}>
                <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  شروع خرید
                </button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}