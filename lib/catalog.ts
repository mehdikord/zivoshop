import type { SortOption } from "@/stores/filter-store";

export const PAGE_SIZE = 12;

export type CatalogQuery = {
  category: string;
  categorySlug: string;
  brands: string[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  onSale: boolean;
  minRating: number | null;
  sort: SortOption;
  keyword: string;
  page: number;
};

export function emptyCatalogQuery(): CatalogQuery {
  return {
    category: "",
    categorySlug: "",
    brands: [],
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 0,
    onSale: false,
    minRating: null,
    sort: "newest",
    keyword: "",
    page: 1,
  };
}

const SORT_ALIASES: Record<string, SortOption> = {
  bestseller: "popular",
  "top-rated": "top_rated",
  "most-expensive": "most_expensive",
};

function asList(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .flatMap((v) => v.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseCatalogParams(sp: URLSearchParams): CatalogQuery {
  const sortRaw = (sp.get("sort") ?? "newest").toLowerCase();
  const sort = SORT_ALIASES[sortRaw] ?? (sortRaw as SortOption);
  return {
    category: sp.get("category") ?? "",
    categorySlug: sp.get("category") ?? "",
    brands: asList(sp.get("brands")),
    sizes: asList(sp.get("sizes")),
    colors: asList(sp.get("colors")),
    minPrice: Number(sp.get("minPrice") ?? 0),
    maxPrice: Number(sp.get("maxPrice") ?? 0),
    onSale: sp.get("onSale") === "true",
    minRating: sp.get("minRating") ? Number(sp.get("minRating")) : null,
    sort,
    keyword: sp.get("keyword") ?? sp.get("q") ?? "",
    page: Math.max(1, parseInt(sp.get("page") ?? "1", 10)),
  };
}

export function serializeCatalogParams(query: CatalogQuery): URLSearchParams {
  const sp = new URLSearchParams();
  if (query.category) sp.set("category", query.category);
  if (query.brands.length) sp.set("brands", query.brands.join(","));
  if (query.sizes.length) sp.set("sizes", query.sizes.join(","));
  if (query.colors.length) sp.set("colors", query.colors.join(","));
  if (query.minPrice) sp.set("minPrice", String(query.minPrice));
  if (query.maxPrice) sp.set("maxPrice", String(query.maxPrice));
  if (query.onSale) sp.set("onSale", "true");
  if (query.minRating !== null) sp.set("minRating", String(query.minRating));
  if (query.sort !== "newest") sp.set("sort", query.sort);
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.page > 1) sp.set("page", String(query.page));
  return sp;
}

export type CatalogOptions = {
  categories: { id: string; name: string; slug: string; description: string; count: number }[];
  brands: { id: string; name: string; slug: string; logo: string; count: number }[];
  sizes: { id: string; label: string; count: number }[];
  colors: { id: string; name: string; hex: string; count: number }[];
  priceRange: { min: number; max: number };
};

export type CatalogResult = {
  items: import("@/types").Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function categoryLabel(query: CatalogQuery): string {
  if (query.category) {
    return query.categorySlug;
  }
  return "";
}

export function activeFiltersCount(query: CatalogQuery): number {
  let count = 0;
  if (query.category) count++;
  count += query.brands.length;
  count += query.sizes.length;
  count += query.colors.length;
  if (query.minPrice > 0) count++;
  if (query.maxPrice > 0) count++;
  if (query.onSale) count++;
  if (query.minRating !== null) count++;
  return count;
}