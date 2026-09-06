"use client";

import { createContext, useContext } from "react";
import type { CatalogOptions, CatalogQuery } from "@/lib/catalog";

export type FilterHandlers = {
  onToggleCategory: (categoryId: string, slug: string) => void;
  onToggleBrand: (brandId: string) => void;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onSetPriceRange: (min: number, max: number) => void;
  onSetOnSale: (on: boolean) => void;
  onSetMinRating: (rating: number | null) => void;
  onClearAll: () => void;
};

const emptyOptions: CatalogOptions = {
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  priceRange: { min: 0, max: 0 },
};

type FilterContextValue = {
  query: CatalogQuery;
  options: CatalogOptions;
  handlers: FilterHandlers;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({
  value,
  children,
}: {
  value: FilterContextValue;
  children: React.ReactNode;
}) {
  const safeValue = {
    ...value,
    options: value.options ?? emptyOptions,
  };
  return <FilterContext.Provider value={safeValue}>{children}</FilterContext.Provider>;
}

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilterContext must be used within FilterProvider");
  }
  return ctx;
}
