import type { Product } from "@/types";
import type { CatalogResult } from "@/lib/catalog";

/**
 * Client-side data layer — calls real public API routes backed by Prisma.
 * Every function mirrors the previous simulated signatures so components
 * don't need signature changes.
 */

export async function fetchNewestProducts(limit = 8): Promise<Product[]> {
  const res = await fetch(`/api/products?sort=newest&pageSize=${limit}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("خطا در دریافت محصولات");
  const json = await res.json();
  return json.data ?? [];
}

export async function fetchBestsellerProducts(limit = 8): Promise<Product[]> {
  const res = await fetch(`/api/products?sort=popular&pageSize=${limit}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("خطا در دریافت محصولات");
  const json = await res.json();
  return json.data ?? [];
}

export async function fetchDiscountedProducts(limit = 8): Promise<Product[]> {
  const res = await fetch(`/api/products?onSale=true&pageSize=${limit}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("خطا در دریافت محصولات");
  const json = await res.json();
  return json.data ?? [];
}

export function rejectProducts(): Promise<never> {
  return Promise.reject(new Error("simulated network failure"));
}

export async function fetchCatalogProducts(searchParams: URLSearchParams): Promise<CatalogResult> {
  const res = await fetch(`/api/products?${searchParams.toString()}`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("خطا در دریافت کاتالوگ");
  const json = await res.json();
  return {
    items: json.data ?? [],
    total: json.meta?.total ?? 0,
    page: json.meta?.page ?? 1,
    pageSize: json.meta?.pageSize ?? 12,
    totalPages: json.meta?.totalPages ?? 0,
  };
}
