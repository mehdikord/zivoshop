"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/components/product/discount-badge";
import { Price } from "@/components/product/price";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";

/**
 * Product card — the storefront's most reused component (PRD §14).
 * Reveals a second image on hover (desktop), handles badges, wishlist
 * toggle and quick-add. Shared with the PDP through Price/DiscountBadge.
 */
export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const productIds = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  const isWishlisted = productIds.includes(product.id);
  const isOutOfStock = product.stock <= 0;
  const mainImage = product.images[0] ?? "";
  const hoverImage = product.images[1] ?? mainImage;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
    if (isWishlisted) {
      toast.info("از علاقه‌مندی‌ها حذف شد");
    } else {
      toast.success("به علاقه‌مندی‌ها اضافه شد");
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    const firstImage = product.images[0] ?? "";
    const firstSize = product.sizes[0] ?? "";
    const firstColor = product.colors[0]?.name ?? "";
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: firstImage,
      price: product.price,
      discountPrice: product.discountPrice,
      size: firstSize,
      color: firstColor,
      quantity: 1,
      stock: product.stock,
    });
    toast.success("به سبد خرید اضافه شد", {
      action: {
        label: "مشاهده سبد",
        onClick: () => useCartStore.getState().setDrawerOpen(true),
      },
    });
  };

  return (
    <Link
      href={`/products/${product.slug}` as Route}
      className={cn("group block", className)}
      aria-label={product.name}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border/60 bg-surface-secondary">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <Image
          src={hoverImage}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {product.isNew ? (
          <Badge
            variant="gold"
            className="absolute top-3 start-3 px-2.5 py-1 text-[11px]"
          >
            جدید
          </Badge>
        ) : null}
        {product.discountPrice ? (
          <DiscountBadge
            percent={
              product.discountPercent ??
              (1 - product.discountPrice / product.price) * 100
            }
            className="absolute top-3 end-3"
          />
        ) : product.isBestseller ? (
          <Badge
            variant="gold"
            className="absolute top-3 end-3 px-2.5 py-1 text-[11px]"
          >
            پرفروش
          </Badge>
        ) : null}

        <button
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? `حذف ${product.name} از علاقه‌مندی‌ها`
              : `افزودن ${product.name} به علاقه‌مندی‌ها`
          }
          aria-pressed={isWishlisted}
          className={cn(
            "absolute bottom-3 start-3 flex size-9 items-center justify-center rounded-full border border-border/60 bg-surface/90 text-text-secondary shadow-soft backdrop-blur transition-all hover:border-gold-dark hover:text-gold-dark",
            isWishlisted && "border-gold-dark text-gold-dark",
          )}
        >
          <Heart
            className={cn("size-4", isWishlisted && "fill-current")}
          />
        </button>

        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-text/25 backdrop-blur-[1px]">
            <Badge variant="secondary" className="px-3 py-1.5 text-xs">
              ناموجود
            </Badge>
          </div>
        ) : (
          <button
            onClick={handleQuickAdd}
            aria-label={`افزودن ${product.name} به سبد خرید`}
            className="absolute inset-x-3 bottom-3 flex h-10 items-center justify-center gap-2 rounded-full bg-primary/90 text-sm font-semibold text-primary-foreground opacity-100 backdrop-blur transition-all hover:bg-primary sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100"
          >
            <ShoppingBag className="size-4" />
            افزودن به سبد
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium tracking-wide text-text-muted">
            {product.brand}
          </p>
          {product.rating ? (
            <p className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
              <Star className="size-3 fill-gold-dark text-gold-dark" />
              <span className="font-semibold">{formatNumber(product.rating)}</span>
              {product.reviewCount ? (
                <span className="text-text-muted">
                  ({formatNumber(product.reviewCount)})
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-text transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <Price
          price={product.price}
          discountPrice={product.discountPrice}
        />
      </div>
    </Link>
  );
}
