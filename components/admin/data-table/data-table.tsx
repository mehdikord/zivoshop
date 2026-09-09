"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Search,
  X,
} from "lucide-react";

export interface Column<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  fetchData: (params: Record<string, string>) => Promise<{ data: T[]; meta: PaginationMeta }>;
  filterComponent?: React.ReactNode;
  searchPlaceholder?: string;
  extraParams?: Record<string, string>;
  refreshKey?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  fetchData,
  filterComponent,
  searchPlaceholder = "جستجو...",
  extraParams = {},
  refreshKey = 0,
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const extraParamsRef = useRef(extraParams);
  const filterKey = useMemo(
    () => JSON.stringify({ debouncedSearch, sortBy, sortOrder, pageSize, extraParams, refreshKey }),
    [debouncedSearch, sortBy, sortOrder, pageSize, extraParams, refreshKey]
  );
  const filterKeyRef = useRef(filterKey);

  useEffect(() => {
    extraParamsRef.current = extraParams;
    filterKeyRef.current = filterKey;
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    fetchData({
      page: String(page),
      pageSize: String(pageSize),
      search: debouncedSearch,
      sortBy,
      sortOrder,
      ...extraParamsRef.current,
    })
      .then((result) => {
        if (cancelled) return;
        setData(result.data);
        setMeta(result.meta);
      })
      .catch((error) => {
        console.error("DataTable fetch error:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey, fetchData, refreshKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filters change
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      setPage(1);
    }
  }, [filterKey]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const goToPage = (target: number) => {
    setPage(target);
  };

  const pageNumbers = (() => {
    const pages: (number | "...")[] = [];
    const total = meta.totalPages;
    const current = page;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  })();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pr-10 pl-8 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {filterComponent}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">نمایش:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setMeta((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] ${
                    col.sortable
                      ? "cursor-pointer select-none hover:text-[var(--text)]"
                      : ""
                  } ${col.className ?? ""}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sortBy === col.key ? (
                          sortOrder === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUp className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--text-muted)]" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-[var(--text-muted)]"
                >
                  داده‌ای یافت نشد
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="text-sm text-[var(--text-muted)]">
            نمایش {((page - 1) * meta.pageSize + 1).toLocaleString("fa-IR")} تا{" "}
            {Math.min(page * meta.pageSize, meta.total).toLocaleString("fa-IR")} از{" "}
            {meta.total.toLocaleString("fa-IR")} نتیجه
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={page === 1}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-[var(--text-muted)]">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium ${
                    p === page
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                  }`}
                >
                  {p.toLocaleString("fa-IR")}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === meta.totalPages}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(meta.totalPages)}
              disabled={page === meta.totalPages}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
