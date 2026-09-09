"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Search, ChevronDown, ChevronUp, Plus, Trash2, CheckCircle, XCircle, Mail } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Newsletter {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string | null;
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: "",
    isActive: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    pageSize: "10",
  });
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const loadNewsletters = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: meta.page.toString(),
      pageSize: filters.pageSize.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.isActive !== "") params.set("isActive", filters.isActive);

    try {
      const res = await fetch(`/api/admin/newsletters?${params}`);
      const data = await res.json();
      if (data.success) {
        setNewsletters(data.data);
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
    loadNewsletters();
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

  const handleAdd = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAddEmail("");
        loadNewsletters();
      } else {
        alert(data.message || "خطا در افزودن");
      }
    } catch {
      alert("خطای شبکه");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) loadNewsletters();
    } catch {
      alert("خطای شبکه");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این ایمیل مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadNewsletters();
      else alert(data.message || "خطا در حذف");
    } catch {
      alert("خطای شبکه");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت خبرنامه</h1>
          <p className="text-muted-foreground">مشاهده و مدیریت ایمیل‌های خبرنامه</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در ایمیل..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && loadNewsletters()}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
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

        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-2 max-w-md">
            <Input
              type="email"
              placeholder="افزودن ایمیل جدید..."
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={adding}
            />
            <Button onClick={handleAdd} disabled={adding || !addEmail.trim()} size="sm">
              <Plus className="h-4 w-4 ml-1" />
              {adding ? "در حال افزودن..." : "افزودن"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                  ایمیل {filters.sortBy === "email" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("isActive")}>
                  وضعیت {filters.sortBy === "isActive" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  تاریخ عضویت {filters.sortBy === "createdAt" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead className="w-[140px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>در حال بارگذاری...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : newsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    ایمیلی ثبت نشده
                  </TableCell>
                </TableRow>
              ) : (
                newsletters.map((n) => (
                  <TableRow key={n.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{n.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.isActive ? "success" : "destructive"}>
                        {n.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {n.createdAt ? formatRelativeTime(n.createdAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(n.id, n.isActive)}
                          title={n.isActive ? "غیرفعال کردن" : "فعال کردن"}
                        >
                          {n.isActive ? <XCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} title="حذف" className="text-destructive hover:bg-destructive/10">
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
            نمایش {newsletters.length} از {meta.total} ایمیل
          </p>
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}