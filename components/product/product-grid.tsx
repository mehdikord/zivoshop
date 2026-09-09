import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

const DEFAULT_GRID =
  "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4";

/**
 * Responsive product grid wrapper (PRD §7.1, §15).
 * Pass `gridClassName` to fully replace the default columns for
 * narrower containers (e.g. the PLP content area).
 */
export function ProductGrid({
  items,
  gridClassName,
  className,
  ariaLabel = "محصولات",
}: {
  items: Product[];
  gridClassName?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn(gridClassName ?? DEFAULT_GRID, className)}
    >
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
