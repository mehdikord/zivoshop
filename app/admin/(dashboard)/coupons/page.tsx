"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Search, ChevronDown, ChevronUp, Plus, Edit, Trash2, Tag, Percent } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { CouponFormDialog } from "@/components/admin/forms/coupon-form-dialog";

const TYPE_LABELS: Record<string, string> = {
  fixed: "مبلغ ثابت",
  percent: "درصدی",
};

const TYPE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  fixed: "default",
  percent: "secondary",
};

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  minOrderAmount: string | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    isActive: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
pageSize: "10",
  });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: meta.page.toString(),
      pageSize: filters.pageSize.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.type) params.set("type", filters.type);
    if (filters.isActive !== "") params.set("isActive", filters.isActive);

    try {
      const res = await fetch(`/api/admin/coupons?${params}`);
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
        setMeta(data.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    loadCoupons();
  }, [filters, meta.page]);

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

  const openCreate = () => {
    setSelectedCoupon(null);
    setFormOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این کوپن مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadCoupons();
      else alert(data.message || "خطا در حذف");
    } catch {
      alert("خطای شبکه");
    }
  };

  const typeBadge = (type: string) => (
    <Badge variant={TYPE_COLORS[type] || "default"} className="gap-1">
      {type === "fixed" ? <Tag className="h-3 w-3" /> : <Percent className="h-3 w-3" />}
      {TYPE_LABELS[type] || type}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت کوپن‌ها</h1>
          <p className="text-muted-foreground">ایجاد، ویرایش و مدیریت کدهای تخفیف</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-2" />
          افزودن کوپن
        </Button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در کد کوپن..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && loadCoupons()}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="نوع تخفیف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  <SelectItem value="percent">درصدی</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.isActive} onValueChange={(v) => setFilters((f) => ({ ...f, isActive: v }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="true">فعال</SelectItem>
                  <SelectItem value="false">غیرفعال</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.pageSize} onValueChange={(v) => handlePageSizeChange(Number(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="نمایش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">۱۰</SelectItem>
                  <SelectItem value="20">۲۰</SelectItem>
                  <SelectItem value="50">۵۰</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("code")}>
                  کد {filters.sortBy === "code" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                  نوع {filters.sortBy === "type" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("value")}>
                  مقدار {filters.sortBy === "value" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>حداقل سفارش</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("maxUses")}>
                  حداکثر استفاده {filters.sortBy === "maxUses" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>استفاده شده</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("expiresAt")}>
                  انقضا {filters.sortBy === "expiresAt" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  ایجاد {filters.sortBy === "createdAt" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-[120px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>در حال بارگذاری...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    کوپنی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>{typeBadge(coupon.type)}</TableCell>
                    <TableCell className="font-mono">
                      {coupon.type === "percent" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {coupon.maxUses ? `${coupon.usedCount} / ${coupon.maxUses}` : `${coupon.usedCount} / ∞`}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{coupon.usedCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {coupon.expiresAt ? formatRelativeTime(coupon.expiresAt) : "بدون انقضا"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(coupon.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "success" : "destructive"}>
                        {coupon.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(coupon)} title="ویرایش">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} title="حذف" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="card-footer flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            نمایش {coupons.length} از {meta.total} کوپن
          </p>
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {formOpen && (
        <CouponFormDialog
          coupon={selectedCoupon}
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={loadCoupons}
        />
      )}
    </div>
  );
}