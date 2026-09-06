"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Search, ChevronDown, ChevronUp, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface ContactMessage {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  repliedAt: string | null;
  createdAt: string | null;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: "",
    isRead: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    pageSize: "10",
  });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: meta.page.toString(),
      pageSize: filters.pageSize.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.isRead !== "") params.set("isRead", filters.isRead);

    try {
      const res = await fetch(`/api/admin/contact-messages?${params}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
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
    loadMessages();
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

  const openDetail = async (msg: ContactMessage) => {
    if (!msg.isRead) {
      try {
        await fetch(`/api/admin/contact-messages/${msg.id}`, { method: "GET" });
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
        setSelectedMessage({ ...msg, isRead: true });
      } catch {
        setSelectedMessage(msg);
      }
    } else {
      setSelectedMessage(msg);
    }
    setDetailOpen(true);
  };

  const handleMarkReplied = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repliedAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (data.success) loadMessages();
    } catch {
      alert("خطای شبکه");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پیام مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadMessages();
      else alert(data.message || "خطا در حذف");
    } catch {
      alert("خطای شبکه");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">پیام‌های تماس</h1>
          <p className="text-muted-foreground">مدیریت پیام‌های دریافتی از فرم تماس با ما</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در نام، موبایل، ایمیل، موضوع..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && loadMessages()}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={filters.isRead} onValueChange={(v) => setFilters((f) => ({ ...f, isRead: v }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="وضعیت خواندن" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="true">خوانده شده</SelectItem>
                  <SelectItem value="false">خوانده نشده</SelectItem>
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
                <TableHead className="w-10"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  نام {filters.sortBy === "name" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>موبایل</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>موضوع</TableHead>
                <TableHead>پیام</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  تاریخ {filters.sortBy === "createdAt" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-[120px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>در حال بارگذاری...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    پیامی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id} className={`hover:bg-muted/50 ${!msg.isRead ? "bg-primary/5" : ""}`}>
                    <TableCell className="text-center">
                      {!msg.isRead && <div className="h-2.5 w-2.5 rounded-full bg-primary mx-auto" />}
                    </TableCell>
                    <TableCell className={`whitespace-nowrap ${!msg.isRead ? "font-semibold" : ""}`}>
                      {msg.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm" dir="ltr">
                      <a href={`tel:${msg.mobile}`} className="text-primary hover:underline">{msg.mobile}</a>
                    </TableCell>
                    <TableCell className="text-sm">
                      {msg.email ? (
                        <a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{msg.subject || "—"}</TableCell>
                    <TableCell className="text-sm max-w-[250px] truncate text-muted-foreground">{msg.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {msg.createdAt ? formatRelativeTime(msg.createdAt) : "—"}
                    </TableCell>
                    <TableCell>
                      {msg.repliedAt ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" /> پاسخ داده شده
                        </Badge>
                      ) : msg.isRead ? (
                        <Badge variant="secondary">خوانده شده</Badge>
                      ) : (
                        <Badge variant="warning">جدید</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(msg)} title="مشاهده">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!msg.repliedAt && (
                          <Button variant="ghost" size="icon" onClick={() => handleMarkReplied(msg.id)} title="علامت پاسخ" className="text-green-600 hover:bg-green-50">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)} title="حذف" className="text-destructive hover:bg-destructive/10">
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
            نمایش {messages.length} از {meta.total} پیام
          </p>
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {detailOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">جزئیات پیام</h2>
                {selectedMessage.repliedAt && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" /> پاسخ داده شده
                  </Badge>
                )}
              </div>
              <button onClick={() => setDetailOpen(false)} className="p-1 rounded hover:bg-muted">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">نام</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">موبایل</p>
                  <p className="font-medium" dir="ltr">{selectedMessage.mobile}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ایمیل</p>
                  <p className="font-medium">{selectedMessage.email || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">تاریخ</p>
                  <p className="font-medium">{selectedMessage.createdAt ? formatRelativeTime(selectedMessage.createdAt) : "—"}</p>
                </div>
              </div>

              {selectedMessage.subject && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-sm mb-1">موضوع</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm mb-1">متن پیام</p>
                <p className="whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}