"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { Section } from "@/components/sections/section";
import { SectionHeader } from "@/components/sections/section-header";
import {
  fetchBestsellerProducts,
  fetchDiscountedProducts,
  fetchNewestProducts,
  rejectProducts,
} from "@/lib/api";
import type { Route } from "next";
import type { Product } from "@/types";

type ProductKind = "newest" | "bestseller" | "discounted";

const fetchers: Record<ProductKind, (limit?: number) => Promise<Product[]>> = {
  newest: fetchNewestProducts,
  bestseller: fetchBestsellerProducts,
  discounted: fetchDiscountedProducts,
};

/**
 * A homepage product strip with a simulated fetch lifecycle so the
 * loading (PRD §40) and error + retry (PRD §42) states are real.
 * Phase 03 reuses the same pattern for the catalog page.
 */
export function ProductSection({
  kind,
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  limit = 8,
  simulateError = false,
  id,
}: {
  kind: ProductKind;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: Route;
  limit?: number;
  simulateError?: boolean;
  id?: string;
}) {
  const [items, setItems] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (simulateError && attempt === 0) {
      rejectProducts().catch(() => {
        if (!cancelled) setStatus("error");
      });
      return;
    }
    fetchers[kind](limit)
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [kind, limit, attempt, simulateError]);

  const retry = () => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  };

  return (
    <Section id={id}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />
      {status === "loading" ? (
        <ProductGridSkeleton count={Math.min(limit, 8)} />
      ) : status === "error" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface-secondary/40 px-6 py-16 text-center">
          <TriangleAlert className="size-8 text-warning" aria-hidden />
          <div>
            <h3 className="text-base font-bold text-text">
              دریافت محصولات با خطا مواجه شد
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              کمی بعد دوباره تلاش کنید.
            </p>
          </div>
          <Button variant="outline-gold" size="sm" onClick={retry}>
            <RefreshCcw className="size-4" />
            تلاش مجدد
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          محصولی برای نمایش در این بخش وجود ندارد.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Section>
  );
}
