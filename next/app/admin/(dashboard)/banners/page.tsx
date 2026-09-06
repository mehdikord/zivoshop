"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Search, ChevronDown, ChevronUp, Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { BannerFormDialog } from "@/components/admin/forms/banner-form-dialog";

const POSITION_LABELS: Record<string, string> = {
  hero: "هرو (بالاترین)",
  campaign: "کمپین",
  special_offer: "پیشنهاد ویژه",
  footer: "فوتر",
  sidebar: "سایدبار",
};

const POSITION_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  hero: "default",
  campaign: "secondary",
  special_offer: "warning",
  footer: "outline",
  sidebar: "destructive",
};

const ALIGN_LABELS: Record<string, string> = {
  start: "چپ/راست",
  center: "وسط",
};

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  ctaLabel: string | null;
  href: string | null;
  image: string;
  position: string;
  align: string;
  sortOrder: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: "",
    position: "",
    isActive: "",
    sortBy: "sortOrder",
    sortOrder: "asc" as "asc" | "desc",
    pageSize: "10",
  });
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: meta.page.toString(),
      pageSize: filters.pageSize.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.position) params.set("position", filters.position);
    if (filters.isActive !== "") params.set("isActive", filters.isActive);

    try {
      const res = await fetch(`/api/admin/banners?${params}`);
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
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
    loadBanners();
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
    setSelectedBanner(null);
    setFormOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این بنر مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadBanners();
      else alert(data.message || "خطا در حذف");
    } catch {
      alert("خطای شبکه");
    }
  };

  const positionBadge = (position: string) => (
    <Badge variant={POSITION_COLORS[position] || "default"}>
      {POSITION_LABELS[position] || position}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت بنرها</h1>
          <p className="text-muted-foreground">ایجاد، ویرایش و مدیریت بنرهای تبلیغاتی</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-2" />
          افزودن بنر
        </Button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در عنوان، ساب‌تایتل..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && loadBanners()}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={filters.position} onValueChange={(v) => setFilters((f) => ({ ...f, position: v }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="موقعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-positions">همه</SelectItem>
                  <SelectItem value="hero">هرو</SelectItem>
                  <SelectItem value="campaign">کمپین</SelectItem>
                  <SelectItem value="special_offer">پیشنهاد ویژه</SelectItem>
                  <SelectItem value="footer">فوتر</SelectItem>
                  <SelectItem value="sidebar">سایدبار</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.isActive} onValueChange={(v) => setFilters((f) => ({ ...f, isActive: v }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">همه</SelectItem>
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
                <TableHead className="w-20">تصویر</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                  عنوان {filters.sortBy === "title" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("position")}>
                  موقعیت {filters.sortBy === "position" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>ترازبندی</TableHead>
                <TableHead className="cursor-pointer w-24" onClick={() => handleSort("sortOrder")}>
                  ترتیب {filters.sortBy === "sortOrder" && (filters.sortOrder === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-[120px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>در حال بارگذاری...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    بنری یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id} className="hover:bg-muted/50">
                    <TableCell>
                      <img src={banner.image} alt="" className="h-16 w-24 rounded object-cover" />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium max-w-xs truncate">{banner.title}</p>
                      {banner.eyebrow && <p className="text-xs text-muted-foreground">{banner.eyebrow}</p>}
                      {banner.subtitle && <p className="text-sm text-muted-foreground line-clamp-1">{banner.subtitle}</p>}
                    </TableCell>
                    <TableCell>{positionBadge(banner.position)}</TableCell>
                    <TableCell className="text-center text-sm">
                      {ALIGN_LABELS[banner.align] || banner.align}
                    </TableCell>
                    <TableCell className="text-center font-mono">{banner.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? "success" : "destructive"}>
                        {banner.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(banner)} title="ویرایش">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} title="حذف" className="text-destructive hover:bg-destructive/10">
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
            نمایش {banners.length} از {meta.total} بنر
          </p>
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {formOpen && (
        <BannerFormDialog
          banner={selectedBanner}
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={loadBanners}
        />
      )}
    </div>
  );
}
