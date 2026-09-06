"use client";

import {
  useFilterStore,
  applyFilters,
  activeFilterCount,
} from "@/stores/filter-store";
import type { SortOption } from "@/stores/filter-store";

export function useFilters() {
  const state = useFilterStore();
  return {
    ...state,
    activeCount: activeFilterCount(state),
  };
}

export { applyFilters };
export type { SortOption };
