const STORAGE_KEY = "zivo-recent-searches";
const MAX_ITEMS = 6;

function safeGet(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_ITEMS)
      : [];
  } catch {
    return [];
  }
}

function safeSet(value: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function getRecentSearches(): string[] {
  return safeGet();
}

/** Add a search term (dedup, most-recent first). Returns the new list. */
export function addRecentSearch(query: string): string[] {
  const q = query.trim();
  if (!q) return safeGet();
  const next = [q, ...safeGet().filter((x) => x !== q)].slice(0, MAX_ITEMS);
  safeSet(next);
  return next;
}

export function removeRecentSearch(query: string): string[] {
  const next = safeGet().filter((x) => x !== query);
  safeSet(next);
  return next;
}

export function clearRecentSearches(): void {
  safeSet([]);
}
