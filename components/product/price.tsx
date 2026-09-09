import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Shared price block (PRD §14/§19). Discounted products show the final
 * price highlighted with the original struck through; otherwise only the
 * main price is rendered. Used by both the ProductCard and the PDP.
 */
export function Price({
  price,
  discountPrice,
  size = "sm",
  className,
}: {
  price: number;
  discountPrice?: number | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  if (discountPrice && discountPrice < price) {
    return (
      <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
        <p
          className={cn(
            "font-bold text-gold-dark",
            size === "lg" ? "text-2xl font-extrabold" : "text-sm",
          )}
        >
          {formatPrice(discountPrice)}
        </p>
        <p
          className={cn(
            "text-xs text-text-muted line-through",
            size === "lg" && "text-sm",
          )}
        >
          {formatPrice(price)}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p
        className={cn(
          "font-bold text-text",
          size === "lg" ? "text-2xl font-extrabold" : "text-sm",
        )}
      >
        {formatPrice(price)}
      </p>
    </div>
  );
}
