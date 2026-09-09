"use client";

import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { EmptyState } from "@/components/feedback/empty-state";
import { WishlistSkeleton } from "@/components/feedback/skeleton-variants";
import { useHydrated } from "@/hooks/use-hydrated";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  videos?: string[];
  sizes: string[];
  colors: { name: string; hex: string; image?: string }[];
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  rating: number;
  reviewCount: number;
  reviews: unknown[];
  stock: number;
  status: string;
  createdAt: string;
  isNew: boolean;
  isBestseller: boolean;
}

export default function AccountWishlist() {
  const productIds = useWishlistStore((s) => s.productIds);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const hydrated = useHydrated();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    async function fetchProducts() {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/products/ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [hydrated, productIds.join(",")]);

  function handleAddToCart(product: ApiProduct) {
    const defaultSize = product.sizes[0] ?? "";
    const defaultColor = product.colors[0]?.name ?? "";
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? "",
      price: product.price,
      discountPrice: product.discountPrice,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
      stock: product.stock,
    });
    toast.success("به سبد خرید اضافه شد");
  }

  function handleRemove(productId: string) {
    remove(productId);
    toast.info("از علاقه‌مندی‌ها حذف شد");
  }

  if (!hydrated) {
    return <WishlistSkeleton />;
  }

  if (loading) {
    return <WishlistSkeleton />;
  }

  return (
    <div>
      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="علاقه‌مندی خالی است"
          description="محصولات مورد علاقه خود را اینجا ذخیره کنید"
          action={
            <Link href="/products" as={undefined}>
              <Button variant="gold">
                <ShoppingBag className="ml-1.5 size-4" />
                ورود به فروشگاه
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const mainImage = product.images[0] ?? "";
            return (
              <div
                key={product.id}
                className="group rounded-2xl border border-border/40 bg-surface p-4 transition-all hover:border-gold-dark/30 hover:shadow-sm"
              >
                {/* Image */}
                <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-xl bg-surface-secondary">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      sizes="100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-text-muted">
                      بدون تصویر
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2 left-2 flex size-8 items-center justify-center rounded-full bg-text/10 text-text-secondary backdrop-blur-sm transition-all hover:bg-text/20 hover:text-destructive"
                    aria-label="حذف از علاقه‌مندی‌ها"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>

                {/* Product info */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-text line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <Price
                      price={product.price}
                      discountPrice={product.discountPrice}
                      className="text-base font-extrabold text-text"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag className="size-3.5" aria-hidden />
                      افزودن
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}