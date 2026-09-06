"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { JalaliCalendar } from "@/components/ui/jalali-calendar";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  RotateCcw,
  Filter,
  X,
  ArrowUpDown,
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { formatJalaliDatePersian } from "@/lib/jalali";
import { OrderStatusDialog } from "@/components/admin/forms/order-status-dialog";

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

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: RotateCcw,
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  receiverName: string;
  receiverPhone: string;
  city: string;
  trackNo: string | null;
  createdAt: string;
  userName: string | null;
  userMobile: string | null;
  itemCount: number;
  firstItems: Array<{
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    pageSize: "10",
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: meta.page.toString(),
      pageSize: filters.pageSize,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setMeta(data.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [meta.page, filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSort = (field: string) => {
    setFilters((f) => ({
      ...f,
      sortBy: field,
      sortOrder: f.sortBy === field && f.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const handlePageChange = (page: number) => {
    setMeta((m) => ({ ...m, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((f) => ({ ...f, pageSize: pageSize.toString() }));
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const openStatus = (order: Order, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrder(order);
    setStatusOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      pageSize: "10",
    });
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const hasActiveFilters =
    filters.search || filters.status || filters.startDate || filters.endDate;

  const handleStartDateChange = (date: Date | null) => {
    setFilters((f) => ({
      ...f,
      startDate: date ? date.toISOString() : "",
    }));
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setFilters((f) => ({
      ...f,
      endDate: date ? date.toISOString() : "",
    }));
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortBy !== field)
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return filters.sortOrder === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مدیریت سفارشات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            مشاهده، فیلتر و مدیریت وضعیت سفارشات
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            فیلتر و جستجو
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
              پاک کردن فیلترها
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* Search + Status + Date Range — single row on desktop */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1 block">
                جستجو
              </label>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="شماره سفارش، نام، تلفن..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && loadOrders()}
                  className="ps-9 h-9"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1 block">
                وضعیت
              </label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) =>
                  setFilters((f) => ({
                    ...f,
                    status: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="processing">در حال پردازش</SelectItem>
                  <SelectItem value="shipped">ارسال شده</SelectItem>
                  <SelectItem value="delivered">تحویل داده شده</SelectItem>
                  <SelectItem value="cancelled">لغو شده</SelectItem>
                  <SelectItem value="returned">مرجوعی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1 block">
                از تاریخ
              </label>
              <JalaliCalendar
                value={filters.startDate ? new Date(filters.startDate) : null}
                onChange={handleStartDateChange}
                placeholder="از تاریخ"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1 block">
                تا تاریخ
              </label>
              <JalaliCalendar
                value={filters.endDate ? new Date(filters.endDate) : null}
                onChange={handleEndDateChange}
                placeholder="تا تاریخ"
              />
            </div>
          </div>

          {/* Page Size */}
          <div className="flex justify-end">
            <Select
              value={filters.pageSize}
              onValueChange={(v) => handlePageSizeChange(Number(v))}
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue placeholder="نمایش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">۱۰ سفارش</SelectItem>
                <SelectItem value="20">۲۰ سفارش</SelectItem>
                <SelectItem value="50">۵۰ سفارش</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead
                  className="cursor-pointer select-none font-semibold text-foreground"
                  onClick={() => handleSort("orderNumber")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    شماره سفارش
                    <SortIcon field="orderNumber" />
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  مشتری
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none font-semibold text-foreground"
                  onClick={() => handleSort("total")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    مبلغ
                    <SortIcon field="total" />
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-foreground hidden md:table-cell">
                  شهر
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none font-semibold text-foreground"
                  onClick={() => handleSort("createdAt")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    تاریخ
                    <SortIcon field="createdAt" />
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  وضعیت
                </TableHead>
                <TableHead className="font-semibold text-foreground hidden lg:table-cell">
                  اقلام
                </TableHead>
                <TableHead className="w-[80px] font-semibold text-foreground">
                  عملیات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">
                        در حال بارگذاری سفارشات...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="h-10 w-10 opacity-40" />
                      <p className="text-sm">سفارشی یافت نشد</p>
                      {hasActiveFilters && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={clearFilters}
                          className="text-xs"
                        >
                          پاک کردن فیلترها
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const StatusIcon = STATUS_ICONS[order.status];
                  return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <TableCell className="font-mono font-semibold text-sm">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {order.receiverName || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.receiverPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {formatCurrency(order.total)}
                          <span className="text-xs font-normal text-muted-foreground mr-1">
                            ریال
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                          {order.city}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          <div>
                            <span className="text-sm">
                              {formatJalaliDatePersian(order.createdAt)}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {formatRelativeTime(order.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={STATUS_COLORS[order.status] || "default"}
                            className="gap-1"
                          >
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                          {order.itemCount} قلم
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => openStatus(order, e)}
                              title="تغییر وضعیت"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {orders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              نمایش{" "}
              <span className="font-medium text-foreground">{orders.length}</span>{" "}
              از{" "}
              <span className="font-medium text-foreground">{meta.total}</span>{" "}
              سفارش
            </p>
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Status Change Dialog */}
      {statusOpen && selectedOrder && (
        <OrderStatusDialog
          orderId={selectedOrder.id}
          currentStatus={selectedOrder.status}
          currentTrackNo={selectedOrder.trackNo}
          open={statusOpen}
          onOpenChange={setStatusOpen}
          onSuccess={loadOrders}
        />
      )}
    </div>
  );
}
