"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, Phone } from "lucide-react";

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
  user: { id: string; name: string; mobile: string; email: string } | null;
  coupon: { id: string; code: string; type: string; value: string } | null;
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

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  pending: "warning",
  processing: "default",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
  returned: "outline",
};

const STATUS_ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: AlertCircle,
};

const getStatusIcon = (status: string) => STATUS_ICONS_MAP[status];

interface OrderDetailDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ orderId, open, onOpenChange }: OrderDetailDialogProps) {
  const [data, setData] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, orderId]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>جزئیات سفارش</span>
            <Badge variant={(data?.status && STATUS_COLORS[data.status]) || "default"}>
              {data?.status && getStatusIcon(data.status) && (() => { const Icon = getStatusIcon(data.status)!; return <Icon className="h-3 w-3 mr-1" />; })()}
              {data?.status ? STATUS_LABELS[data.status] : "—"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : data ? (
          <Tabs defaultValue="summary" className="h-[calc(100%-80px)] flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">خلاصه</TabsTrigger>
              <TabsTrigger value="items">اقلام ({data.items.length})</TabsTrigger>
              <TabsTrigger value="history">تاریخچه وضعیت ({data.statusHistories.length})</TabsTrigger>
              <TabsTrigger value="payments">پرداخت‌ها ({data.payments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="flex-1 overflow-auto p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg border-b pb-2">اطلاعات سفارش</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                      <dt className="text-muted-foreground">شماره سفارش:</dt>
                      <dd className="font-mono font-medium">{data.orderNumber}</dd>
                      <dt className="text-muted-foreground">تاریخ ثبت:</dt>
                      <dd>{formatRelativeTime(data.createdAt)}</dd>
                      <dt className="text-muted-foreground">آخرین بروزرسانی:</dt>
                      <dd>{data.updatedAt ? formatRelativeTime(data.updatedAt) : "—"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-lg border-b pb-2">مشتری</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                      <dt className="text-muted-foreground">نام گیرنده:</dt>
                      <dd className="font-medium">{data.receiverName}</dd>
                      <dt className="text-muted-foreground">تلفن:</dt>
                      <dd><Phone className="h-3 w-3 inline ml-1" /> {data.receiverPhone}</dd>
                      <dt className="text-muted-foreground">استان:</dt>
                      <dd>{data.province}</dd>
                      <dt className="text-muted-foreground">شهر:</dt>
                      <dd>{data.city}</dd>
                      <dt className="text-muted-foreground">کد پستی:</dt>
                      <dd className="font-mono">{data.postalCode}</dd>
                      <dt className="text-muted-foreground">کد رهگیری:</dt>
                      <dd className="font-mono">{data.trackNo ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-lg mb-3">آدرس کامل</h4>
                <p className="text-sm whitespace-pre-wrap">{data.fullAddress}</p>
              </div>

              {data.customerNote && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-lg mb-3">یادداشت مشتری</h4>
                  <p className="text-sm text-muted-foreground">{data.customerNote}</p>
                </div>
              )}

              {data.adminNote && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-lg mb-3">یادداشت ادمین</h4>
                  <p className="text-sm text-muted-foreground">{data.adminNote}</p>
                </div>
              )}

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {data.paidAt && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <dt className="text-xs text-green-700">پرداخت شده</dt>
                    <dd className="text-sm font-medium">{formatRelativeTime(data.paidAt)}</dd>
                  </div>
                )}
                {data.shippedAt && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <dt className="text-xs text-blue-700">ارسال شده</dt>
                    <dd className="text-sm font-medium">{formatRelativeTime(data.shippedAt)}</dd>
                  </div>
                )}
                {data.deliveredAt && (
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <dt className="text-xs text-emerald-700">تحویل داده شده</dt>
                    <dd className="text-sm font-medium">{formatRelativeTime(data.deliveredAt)}</dd>
                  </div>
                )}
                {data.cancelledAt && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <dt className="text-xs text-red-700">لغو شده</dt>
                    <dd className="text-sm font-medium">{formatRelativeTime(data.cancelledAt)}</dd>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="items" className="flex-1 overflow-auto p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>تصویر</TableHead>
                      <TableHead>محصول</TableHead>
                      <TableHead>رنگ / سایز</TableHead>
                      <TableHead className="text-left">قیمت واحد</TableHead>
                      <TableHead className="text-left">تخفیف واحد</TableHead>
                      <TableHead className="text-left">تعداد</TableHead>
                      <TableHead className="text-left">مجموع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.productImage && (
                            <img src={item.productImage} alt={item.productName} className="h-12 w-12 rounded object-cover" />
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{item.productName}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.color && <span className="inline-block px-2 py-0.5 rounded bg-muted mr-1">{item.color}</span>}
                          {item.size && <span className="inline-block px-2 py-0.5 rounded bg-muted">{item.size}</span>}
                        </TableCell>
                        <TableCell className="font-mono">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="font-mono text-green-600">
                          {Number(item.unitDiscount) > 0 ? formatCurrency(item.unitDiscount) : "—"}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="font-bold">
                      <TableCell colSpan={6} className="text-right">مجموع اقلام:</TableCell>
                      <TableCell>{formatCurrency(data.items.reduce((sum, i) => sum + Number(i.total), 0))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} className="text-right">مبلغ سفارش:</TableCell>
                      <TableCell>{formatCurrency(data.subtotal)}</TableCell>
                    </TableRow>
                    {Number(data.discountTotal) > 0 && (
                      <TableRow className="text-green-600">
                        <TableCell colSpan={6} className="text-right">تخفیف اقلام:</TableCell>
                        <TableCell>- {formatCurrency(data.discountTotal)}</TableCell>
                      </TableRow>
                    )}
                    {Number(data.couponDiscount) > 0 && (
                      <TableRow className="text-green-600">
                        <TableCell colSpan={6} className="text-right">تخفیف کوپن:</TableCell>
                        <TableCell>- {formatCurrency(data.couponDiscount)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={6} className="text-right">هزینه ارسال:</TableCell>
                      <TableCell>{formatCurrency(data.shippingCost)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold text-lg">
                      <TableCell colSpan={6} className="text-right">مبلغ قابل پرداخت:</TableCell>
                      <TableCell>{formatCurrency(data.total)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-auto p-4">
              <div className="space-y-3">
                {data.statusHistories.map((h, i) => (
                  <div key={h.id} className="flex items-start gap-4 relative">
                    {i < data.statusHistories.length - 1 && (
                      <div className="absolute right-5 top-10 bottom-0 w-0.5 bg-muted" />
                    )}
                    <div className="relative flex-shrink-0 w-10 h-10 rounded-full border-2 border-primary bg-background flex items-center justify-center z-10">
                      {getStatusIcon(h.status) && React.createElement(getStatusIcon(h.status)!, { className: "h-5 w-5 text-primary" })}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_COLORS[h.status] || "default"}>
                          {STATUS_LABELS[h.status] || h.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{h.createdAt ? formatRelativeTime(h.createdAt) : ""}</span>
                        {h.adminName && <span className="text-xs text-muted-foreground">توسط {h.adminName}</span>}
                      </div>
                      {h.note && <p className="text-sm text-muted-foreground">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="flex-1 overflow-auto p-4">
              {data.payments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">پرداختی ثبت نشده</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>مبلغ</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>روش</TableHead>
                      <TableHead>شناسه مرجع</TableHead>
                      <TableHead>تاریخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono">{formatCurrency(p.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "successful" ? "success" : p.status === "failed" ? "destructive" : "warning"}>
                            {p.status === "successful" && "موفق"}
                            {p.status === "pending" && "در انتظار"}
                            {p.status === "failed" && "ناموفق"}
                            {p.status === "cancelled" && "لغو شده"}
                            {p.status === "refunded" && "مسترد شده"}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="font-mono text-sm">{p.refId || "—"}</TableCell>
                        <TableCell>{p.createdAt ? formatRelativeTime(p.createdAt) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-muted-foreground py-8">خطا در بارگذاری اطلاعات</div>
        )}
      </DialogContent>
    </Dialog>
  );
}