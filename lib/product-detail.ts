import type { Product } from "@/types";

/**
 * PDP helpers: related products (PRD §19), review distribution (PRD §21),
 * and deterministic per-variant availability so some sizes/colors read
 * as out of stock (PRD §17–18) without extra data fields.
 */

export type MediaItem = {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
};

export type DistributionEntry = {
  stars: number;
  count: number;
  percent: number;
};

/** Approximate star distribution matching `rating` and `total` reviews. */
export function reviewDistribution(
  rating: number,
  total: number,
): DistributionEntry[] {
  const r = Math.min(5, Math.max(1, rating));
  const k = 1.35;
  const weights = [5, 4, 3, 2, 1].map((s) => Math.exp(-k * (s - r) ** 2));
  const sumW = weights.reduce((a, b) => a + b, 0) || 1;

  const counts = weights.map((w) => (w / sumW) * total);
  const floor = counts.map(Math.floor);
  let remainder = total - floor.reduce((a, b) => a + b, 0);

  const order = [5, 4, 3, 2, 1].sort(
    (a, b) => Math.abs(a - r) - Math.abs(b - r),
  );
  for (const star of order) {
    if (remainder <= 0) break;
    const idx = 5 - star;
    floor[idx] = (floor[idx] ?? 0) + 1;
    remainder--;
  }

  return floor.map((count, i) => ({
    stars: 5 - i,
    count,
    percent: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

export function mediaItems(product: Product): MediaItem[] {
  const images = (product.images ?? []).map((src) => ({ type: "image" as const, src, alt: product.name }));
  const videos = (product.videos ?? []).map((src) => ({ type: "video" as const, src, poster: product.images?.[0] }));
  return [...images, ...videos];
}