"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import {
  ArrowLeft,
  History,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "@/lib/recent-search";
import { formatPrice } from "@/lib/format";
import type { Brand, Category, Product } from "@/types";

type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SuggestionGroup = {
  products: Product[];
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionGroup>({
    products: [],
    categories: [],
    brands: [],
  });
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([catJson, brandJson]) => {
      if (catJson.success) setAllCategories(catJson.data);
      if (brandJson.success) setAllBrands(brandJson.data);
    }).catch(() => {});
  }, []);

  const normalized = query.trim();

  // Reset search state each time the dialog opens (render-time adjustment,
  // the React-recommended pattern for "adjust state when a prop changes").
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setRecents(getRecentSearches());
    }
  }

  // Move focus into the input once the dialog has mounted.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  const topCategories = allCategories.filter((c) => c.parentId === null);

  // Debounced suggestion search — loading is toggled by the input handler.
  useEffect(() => {
    if (!open || !normalized) return;
    const timer = window.setTimeout(() => {
      const q = normalized.toLowerCase();

      fetch(`/api/search?q=${encodeURIComponent(normalized)}&limit=4`)
        .then((res) => res.json())
        .then((json) => {
          const products = json.success ? json.data : [];
          const categories = topCategories
            .filter((c) => c.name.toLowerCase().includes(q))
            .slice(0, 3)
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
          const brandsResult = allBrands
            .filter((b) => b.name.toLowerCase().includes(q))
            .slice(0, 2)
            .map((b) => ({ id: b.id, name: b.name, slug: b.slug }));
          setSuggestions({
            products,
            categories,
            brands: brandsResult,
          });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [normalized, open, topCategories, allBrands]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setLoading(false);
      setSuggestions({ products: [], categories: [], brands: [] });
    } else {
      setLoading(true);
    }
  };

  const hasResults =
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0;

  const submitSearch = (value: string) => {
    const v = value.trim();
    if (!v) return;
    addRecentSearch(v);
    onOpenChange(false);
    router.push(`/products?q=${encodeURIComponent(v)}` as Route);
  };

  const openProduct = (slug: string) => {
    addRecentSearch(normalized);
    onOpenChange(false);
    router.push(`/product/${slug}` as Route);
  };

  const openCategory = (slug: string) => {
    onOpenChange(false);
    router.push(`/products?category=${slug}` as Route);
  };

  const trendCount = 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-16 max-h-[82vh] w-[calc(100%-1.5rem)] max-w-3xl translate-y-0 overflow-y-auto rounded-2xl border-border bg-surface p-0 shadow-soft-lg sm:top-20"
        aria-label="جستجو"
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-6">
          <Search className="size-5 shrink-0 text-text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch(query);
            }}
            placeholder="جستجو در محصولات، برندها و دسته‌بندی‌ها…"
            className="h-9 w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted sm:text-base"
            aria-label="جستجو در فروشگاه"
            role="searchbox"
          />
          {normalized ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuery("")}
              aria-label="پاک کردن متن جستجو"
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          ) : null}
          <Button
            variant="default"
            size="sm"
            className="shrink-0"
            onClick={() => submitSearch(query)}
          >
            جستجو
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Idle: recent searches + trending categories */}
          {!normalized ? (
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-text">
                    <History className="size-4 text-gold-dark" aria-hidden />
                    جستجوهای اخیر
                  </span>
                  {recents.length > 0 ? (
                    <Button
                      variant="link"
                      size="xs"
                      className="h-auto p-0 text-xs text-text-muted"
                      onClick={() => {
                        clearRecentSearches();
                        setRecents([]);
                      }}
                    >
                      پاک کردن همه
                    </Button>
                  ) : null}
                </div>
                {recents.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recents.map((r) => (
                      <div
                        key={r}
                        className="flex items-center overflow-hidden rounded-full border border-border bg-surface transition-colors hover:border-gold-dark"
                      >
                        <button
                          onClick={() => setQuery(r)}
                          className="px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-primary"
                        >
                          {r}
                        </button>
                        <button
                          onClick={() => setRecents(removeRecentSearch(r))}
                          aria-label={`حذف ${r} از جستجوهای اخیر`}
                          className="flex h-full items-center justify-center px-1.5 text-text-muted transition-colors hover:text-gold-dark"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    هنوز جستجویی انجام نشده است.
                  </p>
                )}
              </div>

              <div>
                <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
                  <TrendingUp className="size-4 text-gold-dark" aria-hidden />
                  دسته‌های پرطرفدار
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {topCategories
                    .slice(0, trendCount)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => openCategory(c.slug)}
                        className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3 text-start text-sm font-medium text-text-secondary transition-colors hover:border-gold-dark hover:text-primary"
                      >
                        <Image
                          src={c.image}
                          alt={c.name}
                          width={40}
                          height={40}
                          className="size-10 rounded-lg object-cover"
                        />
                        <span className="line-clamp-2">{c.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Loading skeleton */}
          {normalized && loading ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/5" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Results */}
          {normalized && !loading && hasResults ? (
            <div className="space-y-6">
              {suggestions.products.length > 0 ? (
                <div>
                  <span className="mb-2 block text-xs font-semibold text-text-muted">
                    محصولات
                  </span>
                  <ul className="divide-y divide-border">
                    {suggestions.products.map((p) => {
                      const brand = allBrands.find((b) => b.id === p.brand);
                      return (
                        <li key={p.id}>
                          <button
                            onClick={() => openProduct(p.slug)}
                            className="flex w-full items-center gap-3 rounded-lg p-2 text-start transition-colors hover:bg-surface-secondary"
                          >
                            <Image
                              src={p.images[0] ?? ""}
                              alt={p.name}
                              width={48}
                              height={48}
                              className="size-12 shrink-0 rounded-lg object-cover"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-text">
                                {p.name}
                              </span>
                              <span className="block text-xs text-text-secondary">
                                {brand?.name ?? ""}
                              </span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-primary">
                              {formatPrice(p.discountPrice ?? p.price)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {suggestions.categories.length > 0 ? (
                <div>
                  <span className="mb-2 block text-xs font-semibold text-text-muted">
                    دسته‌بندی‌ها
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {suggestions.categories.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => openCategory(c.slug)}
                          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-gold-dark hover:text-primary"
                        >
                          {c.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {suggestions.brands.length > 0 ? (
                <div>
                  <span className="mb-2 block text-xs font-semibold text-text-muted">
                    برندها
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {suggestions.brands.map((b) => (
                      <li key={b.id}>
                        <button
                          onClick={() => openCategory(b.slug)}
                          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-gold-dark hover:text-primary"
                        >
                          {b.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button
                variant="outline-gold"
                className="w-full"
                onClick={() => submitSearch(query)}
              >
                مشاهده همه نتایج «{query}»
                <ArrowLeft className="size-4" aria-hidden />
              </Button>
            </div>
          ) : null}

          {/* No results */}
          {normalized && !loading && !hasResults ? (
            <EmptyState
              icon={Search}
              title="نتیجه‌ای پیدا نشد"
              description={`برای «${query}» محصول یا دسته‌بندی‌ای یافت نشد. عبارت دیگری را امتحان کنید.`}
              action={
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  بازگشت
                </Button>
              }
            />
          ) : null}

          {!normalized ? (
            <div className="flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
              <Sparkles className="size-3.5 text-gold-dark" aria-hidden />
              جستجو برای محصول، برند یا دسته‌بندی — مانند «سوتین توری» یا «لباس خواب»
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
