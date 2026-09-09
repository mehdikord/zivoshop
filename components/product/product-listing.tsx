"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { RefreshCcw, SearchX, TriangleAlert } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { FilterActiveBar } from "@/components/product/filters/filter-active-bar";
import { FilterProvider, type FilterHandlers } from "@/components/product/filters/filter-context";
import { FilterSheet } from "@/components/product/filters/filter-sheet";
import { FilterSidebar } from "@/components/product/filters/filter-sidebar";
import { ProductsToolbar } from "@/components/product/products-toolbar";
import { CatalogPagination } from "@/components/product/catalog-pagination";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { type CatalogResult } from "@/lib/catalog";
import {
  activeFiltersCount,
  categoryLabel,
  PAGE_SIZE,
  parseCatalogParams,
  type CatalogQuery,
  type CatalogOptions,
} from "@/lib/catalog";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PLP_GRID = "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3";

export function ProductListing() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [options, setOptions] = useState<CatalogOptions | null>(null);
  const query = useMemo(() => parseCatalogParams(searchParams), [searchParams]);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [result, setResult] = useState<CatalogResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const prevPageRef = useRef(1);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/catalog/options${query.category ? `?categoryId=${query.category}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && data.data) {
          setOptions(data.data);
        }
      })
      .catch(() => {});

    const sp = new URLSearchParams();
    if (query.category) sp.set("category", query.category);
    if (query.brands.length) sp.set("brands", query.brands.join(","));
    if (query.sizes.length) sp.set("sizes", query.sizes.join(","));
    if (query.colors.length) sp.set("colors", query.colors.join(","));
    if (query.minPrice > 0) sp.set("minPrice", String(query.minPrice));
    if (query.maxPrice > 0) sp.set("maxPrice", String(query.maxPrice));
    if (query.onSale) sp.set("onSale", "true");
    if (query.minRating !== null) sp.set("minRating", String(query.minRating));
    if (query.sort !== "newest") sp.set("sort", query.sort);
    if (query.keyword) sp.set("keyword", query.keyword);
    sp.set("page", String(query.page));

    setStatus("loading"); // eslint-disable-line react-hooks/set-state-in-effect
    fetch(`/api/products?${sp.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت کاتالوگ");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setResult({
          items: json.data ?? [],
          total: json.meta?.total ?? 0,
          page: json.meta?.page ?? 1,
          pageSize: json.meta?.pageSize ?? 12,
          totalPages: json.meta?.totalPages ?? 0,
        });
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => { cancelled = true; };
  }, [query, pathname]);

  const updateUrl = useCallback(
    (patch: Partial<CatalogQuery>) => {
      const next: CatalogQuery = { ...query, ...patch };
      if (!("page" in patch)) next.page = 1;
      const sp = new URLSearchParams();
      if (next.category) sp.set("category", next.category);
      if (next.brands.length) sp.set("brands", next.brands.join(","));
      if (next.sizes.length) sp.set("sizes", next.sizes.join(","));
      if (next.colors.length) sp.set("colors", next.colors.join(","));
      if (next.minPrice > 0) sp.set("minPrice", String(next.minPrice));
      if (next.maxPrice > 0) sp.set("maxPrice", String(next.maxPrice));
      if (next.onSale) sp.set("onSale", "true");
      if (next.minRating !== null) sp.set("minRating", String(next.minRating));
      if (next.sort !== "newest") sp.set("sort", next.sort);
      if (next.keyword) sp.set("keyword", next.keyword);
      if (next.page > 1) sp.set("page", String(next.page));
      router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}` as Route, {
        scroll: false,
      });
    },
    [query, pathname, router],
  );

  const handlers: FilterHandlers = useMemo(
    () => ({
      onToggleCategory: (id, slug) =>
        updateUrl(
          query.category === id
            ? { category: "", categorySlug: "" }
            : { category: id, categorySlug: slug },
        ),
      onToggleBrand: (id) =>
        updateUrl({
          brands: query.brands.includes(id)
            ? query.brands.filter((b) => b !== id)
            : [...query.brands, id],
        }),
      onToggleSize: (size) =>
        updateUrl({
          sizes: query.sizes.includes(size)
            ? query.sizes.filter((s) => s !== size)
            : [...query.sizes, size],
        }),
      onToggleColor: (color) =>
        updateUrl({
          colors: query.colors.includes(color)
            ? query.colors.filter((c) => c !== color)
            : [...query.colors, color],
        }),
      onSetPriceRange: (min, max) => updateUrl({ minPrice: min, maxPrice: max }),
      onSetOnSale: (on) => updateUrl({ onSale: on }),
      onSetMinRating: (rating) => updateUrl({ minRating: rating }),
      onClearAll: () =>
        updateUrl({
          category: "",
          categorySlug: "",
          brands: [],
          sizes: [],
          colors: [],
          minPrice: 0,
          maxPrice: 0,
          onSale: false,
          minRating: null,
        }),
    }),
    [query, updateUrl],
  );

  const retry = () => {
    setStatus("loading");
  };

  const onPageChange = (page: number) => updateUrl({ page });

  useEffect(() => {
    if (result && result.page > 1 && result.page !== prevPageRef.current) {
      document
        .getElementById("catalog-top")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevPageRef.current = result?.page ?? 1;
  }, [result]);

  const title = categoryLabel(query) || (query.keyword ? `نتایج جستجو: ${query.keyword}` : "همه محصولات");
  const description =
    options?.categories.find((c) => c.id === query.category || c.slug === query.category)
      ?.description ??
    "کالکشن کامل سوتین، شورت، ست لباس زیر، لباس خواب و لباس شب با ضمانت اصالت کالا.";

  const breadcrumbItems = query.category
    ? [
        { label: "همه محصولات", href: "/products" as const },
        { label: categoryLabel(query) },
      ]
    : [{ label: "همه محصولات" }];

  const activeCount = activeFiltersCount(query);

  return (
    <FilterProvider value={{ query, options: options ?? { categories: [], brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } }, handlers }}>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mt-5">
            <h1 className="text-2xl font-extrabold text-text sm:text-3xl">
              {title}
            </h1>
            {query.keyword ? (
              <p className="mt-2 text-sm text-text-secondary">
                {formatNumber(result?.total ?? 0)} محصول برای «{query.keyword}» یافت شد
              </p>
            ) : (
              <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary">
                {description}
              </p>
            )}
          </header>

          <div className="mt-6">
            <ProductsToolbar
              activeCount={activeCount}
              sort={query.sort}
              onSortChange={(sort) => updateUrl({ sort })}
              onOpenFilters={() => setSheetOpen(true)}
            />
            <div className="mt-4">
              <FilterActiveBar />
            </div>
          </div>

          <div
            id="catalog-top"
            className="mt-6 grid scroll-mt-28 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]"
          >
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>

            <div className="min-w-0">
              {status === "loading" && !result ? (
                <ProductGridSkeleton count={PAGE_SIZE} gridClassName={PLP_GRID} />
              ) : status === "error" ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface-secondary/40 px-6 py-16 text-center">
                  <TriangleAlert className="size-8 text-warning" aria-hidden />
                  <div>
                    <h3 className="text-base font-bold text-text">
                      دریافت محصولات با خطا مواجه شد
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      کمی بعد دوباره تلاش کنید.
                    </p>
                  </div>
                  <Button variant="outline-gold" size="sm" onClick={retry}>
                    <RefreshCcw className="size-4" />
                    تلاش مجدد
                  </Button>
                </div>
              ) : result && result.items.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="نتیجه‌ای یافت نشد"
                  description="با این فیلترها محصولی پیدا نشد. فیلترها را تغییر دهید یا همه را پاک کنید."
                  action={
                    <Button variant="gold" size="sm" onClick={handlers.onClearAll}>
                      پاک کردن همه فیلترها
                    </Button>
                  }
                />
              ) : result ? (
                <>
                  <div
                    className={cn(
                      "transition-opacity duration-300",
                      status === "loading" && "opacity-40",
                    )}
                    aria-busy={status === "loading"}
                  >
                    <ProductGrid items={result.items} gridClassName={PLP_GRID} />
                  </div>
                  <div className="mt-10">
                    <CatalogPagination
                      page={result.page}
                      totalPages={result.totalPages}
                      onPageChange={onPageChange}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        total={result?.total ?? 0}
      />
    </FilterProvider>
  );
}
