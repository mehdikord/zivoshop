"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe hydration check.
 * Returns `false` during SSR and the first client render,
 * then `true` once React has hydrated the component.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
