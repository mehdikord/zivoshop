"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Phone,
  MapPin,
  CreditCard,
  StickyNote,
  Loader2,
  ShoppingBag,
  CalendarDays,
  User,
  FileText,
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  formatJalaliDateFull,
} from "@/lib/jalali";
import { toast } from "sonner";

interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  discountTotal: string;
  shippingCost: string;
  couponDiscount: string;
  total: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  postalCode: string;
  fullAddress: string;
  customerNote: string | null;
  adminNote: string | null;
  trackNo: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  user: {
    id: string;
    name: string;
    mobile: string;
    email: string;
  } | null;
  coupon: {
    id: string;
    code: string;
    type: string;
    value: string;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string | null;
    productImage: string | null;
    size: string | null;
    color: string | null;
    quantity: number;
    unitPrice: string;
    unitDiscount: string;
    total: string;
  }>;
  statusHistories: Array<{
    id: string;
    status: string;
    note: string | null;
    adminName: string | null;
    createdAt: string | null;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    status: string;
    method: string;
    refId: string | null;
    createdAt: string | null;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
  returned: "مرجوعی",
};

const STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  pending: "warning",
  processing: "default",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
  returned: "outline",
};

const STATUS_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: RotateCcw,
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; variant: "success" | "destructive" | "warning" | "default" }
> = {
  successful: { label: "موفق", variant: "success" },
  pending: { label: "در انتظار", variant: "warning" },
  failed: { label: "ناموفق", variant: "destructive" },
  cancelled: { label: "لغو شده", variant: "default" },
  refunded: { label: "مسترد شده", variant: "default" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [data, setData] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  // Status change form state
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [trackNo, setTrackNo] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) {
          setData(json.data);
          setTrackNo(json.data.trackNo ?? "");
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!newStatus && !trackNo) return;

    setStatusLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus || undefined,
          trackNo: trackNo || undefined,
          note,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("وضعیت سفارش با موفقیت بروزرسانی شد");
        setNewStatus("");
        setNote("");
        // Re-fetch order data
        const freshRes = await fetch(`/api/admin/orders/${orderId}`);
        const freshJson = await freshRes.json();
        if (freshJson.success) setData(freshJson.data);
      } else {
        toast.error(result.message || "خطا در بروزرسانی وضعیت");
      }
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            در حال بارگذاری جزئیات سفارش...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Package className="h-16 w-16 text-muted-foreground opacity-40" />
        <p className="text-lg text-muted-foreground">سفارش یافت نشد</p>
        <Button asChild variant="outline">
          <Link href="/admin/orders">
            <ArrowRight className="h-4 w-4 ml-2" />
            بازگشت به لیست سفارشات
          </Link>
        </Button>
      </div>
    );
  }

  const allowedStatuses = VALID_TRANSITIONS[data.status] || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/admin/orders">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                سفارش {data.orderNumber}
              </h1>
              <Badge
                variant={STATUS_COLORS[data.status] || "default"}
                className="gap-1.5"
              >
                {STATUS_ICONS[data.status] &&
                  (() => {
                    const Icon = STATUS_ICONS[data.status]!;
                    return <Icon className="h-3.5 w-3.5" />;
                  })()}
                {STATUS_LABELS[data.status] || data.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ثبت شده در {formatJalaliDateFull(data.createdAt)} —{" "}
              {formatRelativeTime(data.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main Content - Left */}
        <div className="xl:col-span-2 space-y-5">
          {/* Products */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">
                  محصولات سفارش ({data.items.length})
                </h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              {data.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 sm:p-5">
                  <div className="shrink-0">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {item.productName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {item.color && (
                        <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                          رنگ: {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                          سایز: {item.size}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          قیمت واحد:{" "}
                          <span className="font-medium text-foreground">
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </span>
                        {Number(item.unitDiscount) > 0 && (
                          <span className="text-success">
                            تخفیف: {formatCurrency(item.unitDiscount)}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          تعداد:{" "}
                          <span className="font-medium text-foreground">
                            {item.quantity}
                          </span>
                        </span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(item.total)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ریال
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="border-t border-border bg-muted/20 p-4 sm:p-5">
              <div className="space-y-2 max-w-xs ms-auto text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مجموع اقلام:</span>
                  <span className="font-medium">
                    {formatCurrency(data.subtotal)} ریال
                  </span>
                </div>
                {Number(data.discountTotal) > 0 && (
                  <div className="flex justify-between text-success">
                    <span>تخفیف اقلام:</span>
                    <span className="font-medium">
                      - {formatCurrency(data.discountTotal)} ریال
                    </span>
                  </div>
                )}
                {Number(data.couponDiscount) > 0 && (
                  <div className="flex justify-between text-success">
                    <span>
                      تخفیف کوپن
                      {data.coupon && (
                        <span className="text-xs mr-1">
                          ({data.coupon.code})
                        </span>
                      )}
                      :
                    </span>
                    <span className="font-medium">
                      - {formatCurrency(data.couponDiscount)} ریال
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">هزینه ارسال:</span>
                  <span className="font-medium">
                    {Number(data.shippingCost) > 0
                      ? `${formatCurrency(data.shippingCost)} ریال`
                      : "رایگان"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-primary">
                    {formatCurrency(data.total)} ریال
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          {data.statusHistories.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">
                    تاریخچه وضعیت ({data.statusHistories.length})
                  </h2>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-0">
                  {data.statusHistories.map((h, i) => {
                    const Icon = STATUS_ICONS[h.status];
                    return (
                      <div key={h.id} className="flex gap-4">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0 z-10">
                            {Icon && (
                              <Icon className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          {i < data.statusHistories.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border min-h-[2rem]" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-6 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                STATUS_COLORS[h.status] || "default"
                              }
                            >
                              {STATUS_LABELS[h.status] || h.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {h.createdAt
                                ? formatJalaliDateFull(h.createdAt)
                                : ""}
                            </span>
                            {h.adminName && (
                              <span className="text-xs text-muted-foreground">
                                — توسط {h.adminName}
                              </span>
                            )}
                          </div>
                          {h.note && (
                            <p className="text-sm text-muted-foreground mt-1.5 flex items-start gap-1.5">
                              <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />
                              {h.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Payments */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">
                  اطلاعات پرداخت ({data.payments.length})
                </h2>
              </div>
            </div>
            {data.payments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                پرداختی ثبت نشده
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.payments.map((p) => {
                  const paymentInfo = PAYMENT_STATUS_MAP[p.status] || {
                    label: p.status,
                    variant: "default" as const,
                  };
                  return (
                    <div key={p.id} className="p-4 sm:px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold">
                            {formatCurrency(p.amount)}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              ریال
                            </span>
                          </div>
                          <Badge variant={paymentInfo.variant}>
                            {paymentInfo.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {p.method && (
                            <span className="text-muted-foreground">
                              روش: <span className="font-medium text-foreground">{p.method}</span>
                            </span>
                          )}
                          {p.refId && (
                            <span className="text-muted-foreground">
                              کد پیگیری:{" "}
                              <span className="font-mono font-medium text-foreground">
                                {p.refId}
                              </span>
                            </span>
                          )}
                          {p.createdAt && (
                            <span className="text-muted-foreground text-xs">
                              {formatJalaliDateFull(p.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Right */}
        <div className="space-y-5">
          {/* Status Change */}
          {(allowedStatuses.length > 0 || trackNo) && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  تغییر وضعیت سفارش
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {allowedStatuses.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      وضعیت جدید
                    </label>
                    <Select
                      value={newStatus}
                      onValueChange={setNewStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="انتخاب وضعیت جدید" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedStatuses.map((s) => {
                          const Icon = STATUS_ICONS[s];
                          return (
                            <SelectItem key={s} value={s}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                {STATUS_LABELS[s] || s}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    کد پیگیری پستی
                  </label>
                  <Input
                    value={trackNo}
                    onChange={(e) => setTrackNo(e.target.value)}
                    placeholder="کد رهگیری پستی را وارد کنید"
                    dir="ltr"
                    className="text-left"
                  />
                  {data.trackNo && !trackNo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      کد فعلی: {data.trackNo}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    یادداشت (اختیاری)
                  </label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="دلیل تغییر وضعیت..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={
                    statusLoading || (!newStatus && trackNo === (data.trackNo ?? ""))
                  }
                  className="w-full"
                >
                  {statusLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال بروزرسانی...
                    </>
                  ) : (
                    "بروزرسانی وضعیت"
                  )}
                </Button>

                {allowedStatuses.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    این سفارش در وضعیت نهایی است
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">
                  اطلاعات مشتری
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {data.receiverName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      گیرنده سفارش
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground" dir="ltr">
                      {data.receiverPhone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      شماره تماس
                    </p>
                  </div>
                </div>

                {data.user && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      حساب کاربری
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-medium">{data.user.name}</p>
                      <p className="text-muted-foreground" dir="ltr">
                        {data.user.mobile}
                      </p>
                      {data.user.email && (
                        <p className="text-muted-foreground" dir="ltr">
                          {data.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">
                  آدرس ارسال
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">استان:</span>
                <span className="font-medium">{data.province}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">شهر:</span>
                <span className="font-medium">{data.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">کد پستی:</span>
                <span className="font-mono font-medium">{data.postalCode}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground mb-1">آدرس کامل:</p>
                <p className="text-foreground leading-relaxed">
                  {data.fullAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Key Dates */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">
                  تاریخ‌های مهم
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">تاریخ ثبت سفارش:</span>
                <span className="font-medium">
                  {formatJalaliDateFull(data.createdAt)}
                </span>
              </div>
              {data.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاریخ پرداخت:</span>
                  <span className="font-medium text-success">
                    {formatJalaliDateFull(data.paidAt)}
                  </span>
                </div>
              )}
              {data.shippedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاریخ ارسال:</span>
                  <span className="font-medium text-info">
                    {formatJalaliDateFull(data.shippedAt)}
                  </span>
                </div>
              )}
              {data.deliveredAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاریخ تحویل:</span>
                  <span className="font-medium text-success">
                    {formatJalaliDateFull(data.deliveredAt)}
                  </span>
                </div>
              )}
              {data.cancelledAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاریخ لغو:</span>
                  <span className="font-medium text-destructive">
                    {formatJalaliDateFull(data.cancelledAt)}
                  </span>
                </div>
              )}
              {data.updatedAt && (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">
                    آخرین بروزرسانی:
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(data.updatedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(data.customerNote || data.adminNote) && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">یادداشت‌ها</h2>
                </div>
              </div>
              <div className="p-5 space-y-4 text-sm">
                {data.customerNote && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      یادداشت مشتری:
                    </p>
                    <p className="text-foreground bg-muted/50 rounded-lg p-3">
                      {data.customerNote}
                    </p>
                  </div>
                )}
                {data.adminNote && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      یادداشت ادمین:
                    </p>
                    <p className="text-foreground bg-muted/50 rounded-lg p-3">
                      {data.adminNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
