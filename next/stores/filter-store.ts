"use client";

import { create } from "zustand";
import type { Product } from "@/types";

export type SortOption =
  | "newest"
  | "popular"
  | "cheapest"
  | "most_expensive"
  | "discount"
  | "top_rated";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "most_expensive", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
  { value: "top_rated", label: "بالاترین امتیاز" },
];

export type FilterValues = {
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  onSale: boolean;
  minRating: number | null;
  sort: SortOption;
  keyword: string;
};

export type FilterState = FilterValues & {
  toggleCategory: (value: string) => void;
  toggleBrand: (value: string) => void;
  toggleSize: (value: string) => void;
  toggleColor: (value: string) => void;
  setPriceRange: (min: number, max: number) => void;
  setOnSale: (value: boolean) => void;
  setMinRating: (value: number | null) => void;
  setSort: (value: SortOption) => void;
  setKeyword: (value: string) => void;
  reset: () => void;
};

const initialState = {
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 0,
  onSale: false,
  minRating: null,
  sort: "newest" as SortOption,
  keyword: "",
};

/**
 * Global product-listing filter/sort state (PRD §15).
 * The URL is the source of truth on the PLP page; this store mirrors
 * it for instant client-side feedback.
 */
export const useFilterStore = create<FilterState>()((set) => ({
  ...initialState,

  toggleCategory: (value) =>
    set((s) => ({
      categories: s.categories.includes(value)
        ? s.categories.filter((v) => v !== value)
        : [...s.categories, value],
    })),

  toggleBrand: (value) =>
    set((s) => ({
      brands: s.brands.includes(value)
        ? s.brands.filter((v) => v !== value)
        : [...s.brands, value],
    })),

  toggleSize: (value) =>
    set((s) => ({
      sizes: s.sizes.includes(value)
        ? s.sizes.filter((v) => v !== value)
        : [...s.sizes, value],
    })),

  toggleColor: (value) =>
    set((s) => ({
      colors: s.colors.includes(value)
        ? s.colors.filter((v) => v !== value)
        : [...s.colors, value],
    })),

  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
  setOnSale: (value) => set({ onSale: value }),
  setMinRating: (value) => set({ minRating: value }),
  setSort: (value) => set({ sort: value }),
  setKeyword: (value) => set({ keyword: value }),
  reset: () => set({ ...initialState }),
}));

/** Number of active filters — used for the badge on the filter button. */
export function activeFilterCount(state: FilterState): number {
  let count = 0;
  if (state.categories.length > 0) count += 1;
  if (state.brands.length > 0) count += 1;
  if (state.sizes.length > 0) count += 1;
  if (state.colors.length > 0) count += 1;
  if (state.minPrice > 0 || state.maxPrice > 0) count += 1;
  if (state.onSale) count += 1;
  if (state.minRating !== null) count += 1;
  return count;
}

/**
 * Apply the active filters & sort to a product list.
 * Used by the PLP page and mock search until a real backend exists.
 */
export function applyFilters(
  products: Product[],
  state: FilterValues,
): Product[] {
  const result = products.filter((product) => {
    if (state.categories.length > 0 && !state.categories.includes(product.category)) {
      return false;
    }
    if (state.brands.length > 0 && !state.brands.includes(product.brand)) {
      return false;
    }
    if (state.sizes.length > 0 && !state.sizes.some((s) => product.sizes.includes(s))) {
      return false;
    }
    if (
      state.colors.length > 0 &&
      !state.colors.some((c) => product.colors.some((pc) => pc.name === c))
    ) {
      return false;
    }
    if (state.onSale && !product.discountPrice) {
      return false;
    }
    if (state.minRating !== null && product.rating < state.minRating) {
      return false;
    }

    const effectiveMax =
      state.maxPrice > 0 ? state.maxPrice : Number.POSITIVE_INFINITY;
    const productPrice = product.discountPrice ?? product.price;
    if (productPrice < state.minPrice || productPrice > effectiveMax) {
      return false;
    }

    if (state.keyword) {
      const q = state.keyword.trim().toLowerCase();
      const haystack = `${product.name} ${product.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const sortValue = (p: Product): number =>
    p.discountPrice ?? p.price;

  switch (state.sort) {
    case "newest":
      return [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "popular":
      return [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    case "cheapest":
      return [...result].sort((a, b) => sortValue(a) - sortValue(b));
    case "most_expensive":
      return [...result].sort((a, b) => sortValue(b) - sortValue(a));
    case "discount":
      return [...result].sort(
        (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
      );
    case "top_rated":
      return [...result].sort((a, b) => b.rating - a.rating);
    default:
      return result;
  }
}
