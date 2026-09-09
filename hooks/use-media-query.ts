"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Hydration-safe media query hook.
 * Returns false on the server and on the first client render to avoid
 * hydration mismatch, then re-evaluates once mounted.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True only after the component has mounted on the client. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    useCallback(() => () => {}, []),
    useCallback(() => true, []),
    () => false,
  );
}
