"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/types";

const GRID =
  "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4";

export function RelatedProducts({ product }: { product: Product }) {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/products/${product.slug}/related`, { next: { revalidate: 60 } });
        if (res.ok) {
          const json = await res.json();
          setRelated(json.data ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [product.slug]);

  if (loading) return null;
  if (!related.length) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2 id="related-heading" className="mb-6 text-lg font-extrabold text-text">
        محصولات مرتبط
      </h2>
      <ProductGrid items={related} gridClassName={GRID} />
    </section>
  );
}