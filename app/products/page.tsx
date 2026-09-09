import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductListing } from "@/components/product/product-listing";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { getCatalogOptions } from "@/lib/catalog-server";
import { parseCatalogParams } from "@/lib/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toSearchParams(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, v));
    } else if (value !== undefined) {
      sp.append(key, value);
    }
  }
  return sp;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = parseCatalogParams(toSearchParams(params));
  const options = await getCatalogOptions(query.category || undefined);
  const category = options.categories.find(
    (c) => c.id === query.category || c.slug === query.category
  );

  if (category) {
    return {
      title: category.name,
      description: category.description,
      alternates: { canonical: `/products?category=${query.categorySlug}` },
      openGraph: {
        title: `${category.name} | زیوو Zivo`,
        description: category.description,
      },
    };
  }

  if (query.keyword) {
    return {
      title: `جستجوی «${query.keyword}»`,
      description: `نتایج جستجوی «${query.keyword}» در فروشگاه زیوو.`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: "همه محصولات",
    description:
      "کالکشن کامل سوتین، شورت، ست لباس زیر، لباس خواب، لباس شب، بادی و گن با ضمانت اصالت کالا.",
    alternates: { canonical: "/products" },
  };
}

function CatalogFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>خانه</span>
          <span aria-hidden>/</span>
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-5 h-8 w-48 rounded-xl" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden space-y-4 lg:block">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <ProductGridSkeleton count={12} gridClassName="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3" />
        </div>
      </div>
    </main>
  );
}

export default async function ProductsPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <ProductListing />
    </Suspense>
  );
}
