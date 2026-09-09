"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  X,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  ShieldCheck,
  Globe,
  Monitor,
  Hash,
  FileText,
  Layers,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { JalaliCalendar } from "@/components/ui/jalali-calendar";

interface ActivityLog {
  id: string;
  userType: "admin" | "user";
  userId: string;
  actorName: string | null;
  actorMobile: string | null;
  action: string;
  actionLabel: string;
  subjectType: string | null;
  subjectTypeLabel: string | null;
  subjectId: string | null;
  properties: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | null;
}

interface ActivityStats {
  totalLogs: number;
  todayLogs: number;
  adminLogs: number;
  userLogs: number;
  thisWeekLogs: number;
}

const ACTION_GROUPS = [
  { label: "احراز هویت", actions: ["auth.login", "auth.logout", "auth.register", "auth.failed_login", "auth.password_change"] },
  { label: "محصولات", actions: ["product.created", "product.updated", "product.deleted"] },
  { label: "دسته‌بندی", actions: ["category.created", "category.updated", "category.deleted"] },
  { label: "سفارشات", actions: ["order.updated", "order.status_changed"] },
  { label: "کاربران", actions: ["user.created", "user.updated", "user.deleted", "user.toggled"] },
  { label: "مدیران", actions: ["admin.created", "admin.updated", "admin.deleted"] },
  { label: "برند", actions: ["brand.created", "brand.updated", "brand.deleted"] },
  { label: "کد تخفیف", actions: ["coupon.created", "coupon.updated", "coupon.deleted"] },
  { label: "بنر", actions: ["banner.created", "banner.updated", "banner.deleted"] },
  { label: "نظرات", actions: ["review.approved", "review.rejected", "review.deleted"] },
  { label: "تنظیمات", actions: ["settings.updated"] },
  { label: "پیام تماس", actions: ["contact.read", "contact.deleted"] },
  { label: "رنگ و سایز", actions: ["color.created", "color.updated", "color.deleted", "size.created", "size.updated", "size.deleted"] },
  { label: "ویژگی", actions: ["feature.created", "feature.updated", "feature.deleted"] },
  { label: "صفحات", actions: ["page.created", "page.updated", "page.deleted"] },
  { label: "فایل‌ها", actions: ["media.uploaded", "media.deleted"] },
];

function getActionColor(action: string): string {
  if (action.startsWith("auth.")) return "info";
  if (action.includes("created")) return "success";
  if (action.includes("deleted")) return "destructive";
  if (action.includes("updated") || action.includes("changed") || action.includes("toggled")) return "warning";
  if (action.includes("approved")) return "success";
  if (action.includes("rejected")) return "destructive";
  return "secondary";
}

function getActionIcon(action: string) {
  if (action.startsWith("auth.")) return <ShieldCheck className="h-3.5 w-3.5" />;
  if (action.includes("created")) return <TrendingUp className="h-3.5 w-3.5" />;
  if (action.includes("deleted")) return <X className="h-3.5 w-3.5" />;
  return <Activity className="h-3.5 w-3.5" />;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 0 });
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    userType: "",
    action: "",
    subjectType: "",
    dateFrom: null as string | null,
    dateTo: null as string | null,
    pageSize: "20",
  });
  // Separate concern: search input is debounced to avoid an API call per keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleDateFromChange = (date: Date | null) => {
    setFilters((f) => ({ ...f, dateFrom: date ? date.toISOString() : null }));
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const handleDateToChange = (date: Date | null) => {
    setFilters((f) => ({ ...f, dateTo: date ? date.toISOString() : null }));
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/activity-logs/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: meta.page.toString(),
      pageSize: filters.pageSize.toString(),
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.userType) params.set("userType", filters.userType);
    if (filters.action) params.set("action", filters.action);
    if (filters.subjectType) params.set("subjectType", filters.subjectType);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);

    try {
      const res = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setMeta(data.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [meta.page, filters.pageSize, filters.userType, filters.action, filters.subjectType, filters.dateFrom, filters.dateTo, debouncedSearch]);

  useEffect(() => {
    loadStats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadStats]);

  useEffect(() => {
    loadLogs(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadLogs]);

  useEffect(() => {
    setMeta((m) => ({ ...m, page: 1 })); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filters]);

  const handleRefresh = () => {
    loadLogs();
    loadStats();
  };

  const openDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const hasActiveFilters = filters.userType || filters.action || filters.subjectType || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            لاگ فعالیت‌ها
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            تمام فعالیت‌های کاربران و مدیران در سیستم
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            بروزرسانی
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            خروجی
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          icon={<Layers className="h-5 w-5" />}
          label="کل لاگ‌ها"
          value={stats?.totalLogs}
          loading={statsLoading}
          color="primary"
        />
        <StatsCard
          icon={<Calendar className="h-5 w-5" />}
          label="امروز"
          value={stats?.todayLogs}
          loading={statsLoading}
          color="info"
        />
        <StatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="این هفته"
          value={stats?.thisWeekLogs}
          loading={statsLoading}
          color="warning"
        />
        <StatsCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="فعالیت مدیران"
          value={stats?.adminLogs}
          loading={statsLoading}
          color="success"
        />
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          label="فعالیت کاربران"
          value={stats?.userLogs}
          loading={statsLoading}
          color="gold"
        />
      </div>

      {/* Filters & Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {/* Filter Bar */}
        <div className="border-b border-[var(--border)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder="جستجو در عملیات..."
                  aria-label="جستجو در عملیات"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pe-4 ps-10 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                {filters.search && (
                  <button
                    onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                    aria-label="پاک کردن جستجو"
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                فیلترها
                {hasActiveFilters && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-[var(--primary)]">
                    !
                  </span>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">نمایش:</span>
              <Select
                value={filters.pageSize}
                onValueChange={(v) => setFilters((f) => ({ ...f, pageSize: v }))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">۱۰</SelectItem>
                  <SelectItem value="20">۲۰</SelectItem>
                  <SelectItem value="50">۵۰</SelectItem>
                  <SelectItem value="100">۱۰۰</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">نوع کاربر</label>
                <Select
                  value={filters.userType || "all"}
                  onValueChange={(v) => setFilters((f) => ({ ...f, userType: v === "all" ? "" : v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="همه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="admin">مدیر</SelectItem>
                    <SelectItem value="user">کاربر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">نوع عملیات</label>
                <Select
                  value={filters.action || "all"}
                  onValueChange={(v) => setFilters((f) => ({ ...f, action: v === "all" ? "" : v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="همه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    {ACTION_GROUPS.map((group) =>
                      group.actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {group.label} — {action.split(".").pop()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">نوع موجودیت</label>
                <Select
                  value={filters.subjectType || "all"}
                  onValueChange={(v) => setFilters((f) => ({ ...f, subjectType: v === "all" ? "" : v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="همه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="Product">محصول</SelectItem>
                    <SelectItem value="Category">دسته‌بندی</SelectItem>
                    <SelectItem value="Order">سفارش</SelectItem>
                    <SelectItem value="User">کاربر</SelectItem>
                    <SelectItem value="Admin">مدیر</SelectItem>
                    <SelectItem value="Brand">برند</SelectItem>
                    <SelectItem value="Coupon">کد تخفیف</SelectItem>
                    <SelectItem value="Banner">بنر</SelectItem>
                    <SelectItem value="Review">نظر</SelectItem>
                    <SelectItem value="SiteSetting">تنظیمات</SelectItem>
                    <SelectItem value="Color">رنگ</SelectItem>
                    <SelectItem value="Size">سایز</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">تاریخ شروع</label>
                <JalaliCalendar
                  value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                  onChange={handleDateFromChange}
                  placeholder="تاریخ شروع"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">تاریخ پایان</label>
                <JalaliCalendar
                  value={filters.dateTo ? new Date(filters.dateTo) : null}
                  onChange={handleDateToChange}
                  placeholder="تاریخ پایان"
                />
              </div>

              {hasActiveFilters && (
                <div className="flex items-end sm:col-span-2 lg:col-span-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ search: "", userType: "", action: "", subjectType: "", dateFrom: null, dateTo: null, pageSize: filters.pageSize })}
                    className="gap-2 text-[var(--destructive)]"
                  >
                    <X className="h-4 w-4" />
                    پاک کردن فیلترها
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-busy={loading}>
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  کاربر
                </th>
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  عملیات
                </th>
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  موجودیت
                </th>
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    زمان
                  </div>
                </th>
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    IP
                  </div>
                </th>
                <th className="w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                      <span className="text-sm text-[var(--text-muted)]">در حال بارگذاری...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-secondary)]">
                        <Activity className="h-6 w-6 text-[var(--text-muted)]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--text)]">لاگی یافت نشد</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {hasActiveFilters
                          ? "فیلتر فعالی اعمال شده‌است. برای مشاهده همه لاگ‌ها فیلترها را پاک کنید."
                          : "هنوز فعالیتی در سیستم ثبت نشده است. با انجام یک عملیات، اولین لاگ ثبت می‌شود."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          log.userType === "admin"
                            ? "bg-[var(--info-light)] text-[var(--info)]"
                            : "bg-[var(--success-light)] text-[var(--success)]"
                        }`}>
                          {log.userType === "admin" ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text)]">
                            {log.actorName ?? "ناشناس"}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {log.userType === "admin" ? "مدیر" : "کاربر"}
                            {log.actorMobile && ` · ${log.actorMobile}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getActionColor(log.action) as "success" | "destructive" | "warning" | "info" | "secondary"} className="gap-1">
                        {getActionIcon(log.action)}
                        {log.actionLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {log.subjectTypeLabel ? (
                        <div>
                          <span className="text-[var(--text)]">{log.subjectTypeLabel}</span>
                          {log.subjectId && (
                            <span className="me-1 text-xs text-[var(--text-muted)]">
                              #{log.subjectId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                      {log.createdAt ? formatRelativeTime(log.createdAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)] font-mono">
                      {log.ipAddress ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDetail(log)}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3 sm:flex-row">
            <span className="text-sm text-[var(--text-muted)]">
              نمایش {((meta.page - 1) * meta.pageSize + 1).toLocaleString("fa-IR")} تا{" "}
              {Math.min(meta.page * meta.pageSize, meta.total).toLocaleString("fa-IR")} از{" "}
              {meta.total.toLocaleString("fa-IR")} لاگ
            </span>
            <div className="flex items-center gap-1">
              <PaginationButtons
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={(p) => setMeta((m) => ({ ...m, page: p }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailOpen && selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}

// ── Stats Card ─────────────────────────────────────────────────────────
function StatsCard({
  icon,
  label,
  value,
  loading,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  loading: boolean;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    info: "bg-[var(--info-light)] text-[var(--info)]",
    warning: "bg-[var(--warning-light)] text-[var(--warning)]",
    success: "bg-[var(--success-light)] text-[var(--success)]",
    gold: "bg-[var(--gold-light)] text-[var(--gold-dark)]",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color] ?? colorMap.primary}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--text-muted)] truncate">{label}</p>
          {loading ? (
            <div className="mt-1 h-6 w-16 animate-pulse rounded bg-[var(--surface-secondary)]" />
          ) : (
            <p className="text-lg font-bold text-[var(--text)]">
              {(value ?? 0).toLocaleString("fa-IR")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pagination Buttons ─────────────────────────────────────────────────
function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        «
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-[var(--text-muted)]">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium ${
              p === currentPage
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            }`}
          >
            {p.toLocaleString("fa-IR")}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        ›
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        »
      </button>
    </>
  );
}

// ── Log Detail Modal ───────────────────────────────────────────────────
function LogDetailModal({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  const properties = log.properties as Record<string, unknown> | null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="جزئیات لاگ"
        className="bg-[var(--surface)] rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-[var(--shadow-soft-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--text)]">جزئیات لاگ</h2>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Actor */}
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              log.userType === "admin"
                ? "bg-[var(--info-light)] text-[var(--info)]"
                : "bg-[var(--success-light)] text-[var(--success)]"
            }`}>
              {log.userType === "admin" ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-medium text-[var(--text)]">{log.actorName ?? "ناشناس"}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {log.userType === "admin" ? "مدیر" : "کاربر"}
                {log.actorMobile && ` · ${log.actorMobile}`}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailRow icon={<Activity className="h-4 w-4" />} label="عملیات" value={log.actionLabel} />
            <DetailRow icon={<Layers className="h-4 w-4" />} label="کد عملیات" value={log.action} mono />
            <DetailRow icon={<FileText className="h-4 w-4" />} label="نوع موجودیت" value={log.subjectTypeLabel ?? "—"} />
            <DetailRow icon={<Hash className="h-4 w-4" />} label="شناسه موجودیت" value={log.subjectId ?? "—"} mono />
            <DetailRow icon={<Clock className="h-4 w-4" />} label="زمان" value={log.createdAt ? new Date(log.createdAt).toLocaleString("fa-IR") : "—"} />
            <DetailRow icon={<Globe className="h-4 w-4" />} label="آدرس IP" value={log.ipAddress ?? "—"} mono />
          </div>

          {/* User Agent */}
          {log.userAgent && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                <Monitor className="h-3.5 w-3.5" />
                User Agent
              </div>
              <p className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs text-[var(--text-muted)] break-all font-mono">
                {log.userAgent}
              </p>
            </div>
          )}

          {/* Properties */}
          {properties && Object.keys(properties).length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                <BarChart3 className="h-3.5 w-3.5" />
                جزئیات اضافی
              </div>
              <div className="rounded-lg bg-[var(--background)] p-3">
                <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono">
                  {JSON.stringify(properties, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[var(--background)] p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-medium text-[var(--text)] ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
