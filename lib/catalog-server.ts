// Server-only catalog functions - uses Prisma via storefront

export type CatalogOptions = {
  categories: { id: string; name: string; slug: string; description: string; count: number }[];
  brands: { id: string; name: string; slug: string; logo: string; count: number }[];
  sizes: { id: string; label: string; count: number }[];
  colors: { id: string; name: string; hex: string; count: number }[];
  priceRange: { min: number; max: number };
};

export async function getCatalogOptions(categoryId?: string): Promise<CatalogOptions> {
  const { getCatalogFacets } = await import("@/lib/storefront");
  return getCatalogFacets(categoryId);
}