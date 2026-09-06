"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Heart, Shield, Truck, Undo2, Star, HelpCircle } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGallery } from "@/components/product/product-gallery";
import { SizeSelector } from "@/components/product/size-selector";
import { ColorSelector } from "@/components/product/color-selector";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Price } from "@/components/product/price";
import { DiscountBadge } from "@/components/product/discount-badge";
import { RichContent } from "@/components/product/rich-content";
import { ReviewSummary, ReviewList } from "@/components/product/reviews";
import { WriteReviewDialog } from "@/components/product/write-review-dialog";
import { RelatedProducts } from "@/components/product/related-products";
import { StickyCartBar } from "@/components/product/sticky-cart-bar";
import {
  mediaItems,
  reviewDistribution,
} from "@/lib/product-detail";
import { formatNumber } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";
import type { Product, ProductColorWithImage, ProductSizeWithStock } from "@/types";

interface ProductWithRelations extends Product {
  productColors?: ProductColorWithImage[];
  productSizes?: ProductSizeWithStock[];
}

export function ProductDetailPage({ product }: { product: ProductWithRelations }) {
  const addItem = useCartStore((s) => s.addItem);
  const productIds = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const isWishlisted = productIds.includes(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes.length === 1 ? (product.sizes[0] ?? null) : null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors.length === 1 ? (product.colors[0]?.name ?? null) : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [tab, setTab] = useState("description");
  const [successAdded, setSuccessAdded] = useState(false);

  const uSizes: string[] = [];
  const uColors: string[] = [];
  const media = mediaItems(product);
  const discount =
    product.discountPrice && product.discountPrice < product.price
      ? (product.discountPercent ??
          Math.round((1 - product.discountPrice / product.price) * 100))
      : 0;

  const canAdd =
    !isOutOfStock &&
    (product.sizes.length === 0 || selectedSize !== null) &&
    (product.colors.length === 0 || selectedColor !== null);

  const onSelectSize = (size: string) => {
    setSelectedSize(size);
    setSizeError(false);
  };
  const onSelectColor = (color: string) => {
    setSelectedColor(color);
    setColorError(false);
  };

  const handleAdd = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      setColorError(true);
      return;
    }
    if (!canAdd) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? "",
      price: product.price,
      discountPrice: product.discountPrice,
      size: selectedSize ?? "-Free",
      color: selectedColor ?? "—",
      quantity,
      stock: product.stock,
    });
    setSuccessAdded(true);
    setTimeout(() => setSuccessAdded(false), 2000);
    toast.success("به سبد خرید اضافه شد", {
      action: {
        label: "مشاهده سبد",
        onClick: () => useCartStore.getState().setDrawerOpen(true),
      },
    });
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    toast.info(isWishlisted ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد");
  };

  const distribution = reviewDistribution(product.rating, product.reviewCount || 0);

  const specBlocks = (product.details ?? []).filter((b) => b.type === "table");

  const crumbItems = [
    { label: "همه محصولات", href: "/products" as const },
    { label: product.name },
  ];

  // --- Derived data for specs tab ---
  const availableColors = product.productColors
    ?.filter((pc) => pc.hex)
    .map((pc) => ({
      id: pc.id,
      name: pc.name,
      hex: pc.hex,
      image: pc.image,
    })) ?? [];

  const availableSizes = product.productSizes
    ?.filter((ps) => ps.isActive)
    .map((ps) => ({
      id: ps.id,
      name: ps.name,
      stock: ps.stock,
      isAvailable: ps.isAvailable,
    })) ?? [];

  const hasSpecTable = (product.details ?? []).some((b) => b.type === "table");

  return (
    <>
      <main className="min-h-screen bg-background pb-40 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <Breadcrumb items={crumbItems} />

          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* ---- Gallery ---- */}
            <ProductGallery media={media} name={product.name} />

            {/* ---- Info ---- */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-text-muted">
                  {product.brand}
                </p>
                <h1 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">
                  {product.name}
                </h1>
                {product.rating ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                    <span className="font-semibold text-text tabular-nums">
                      {formatNumber(product.rating)}
                    </span>
                    <span className="text-text-muted">از ۵</span>
                    <span className="text-text-muted">•</span>
                    <span>{formatNumber(product.reviewCount)} دیدگاه</span>
                  </div>
                ) : null}
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-center gap-2">
                <Price
                  price={product.price}
                  discountPrice={product.discountPrice}
                  size="lg"
                />
                {discount > 0 ? (
                  <DiscountBadge percent={discount} />
                ) : null}
              </div>

              {/* Selectors */}
              {product.sizes.length > 0 ? (
                <SizeSelector
                  sizes={product.sizes}
                  unavailable={uSizes}
                  value={selectedSize}
                  onChange={onSelectSize}
                />
              ) : null}
              {sizeError && (
                <p className="text-xs text-red-500">لطفاً سایز را انتخاب کنید</p>
              )}

              {product.colors.length > 0 ? (
                <ColorSelector
                  colors={product.colors}
                  unavailable={uColors}
                  value={selectedColor}
                  onChange={onSelectColor}
                />
              ) : null}
              {colorError && (
                <p className="text-xs text-red-500">لطفاً رنگ را انتخاب کنید</p>
              )}

              {/* Quantity + Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={product.stock}
                  disabled={isOutOfStock}
                />
                <div className="flex gap-2">
                  <Button
                    variant="gold"
                    className={cn(
                      "min-w-44 transition-all",
                      successAdded && "bg-green-600 hover:bg-green-600",
                    )}
                    disabled={!canAdd}
                    onClick={handleAdd}
                  >
                    {successAdded ? (
                      <>
                        <Check className="ms-1.5 size-4" aria-hidden />
                        افزوده شد
                      </>
                    ) : (
                      "افزودن به سبد"
                    )}
                  </Button>
                  <Button
                    variant="outline-gold"
                    size="icon"
                    aria-label={
                      isWishlisted
                        ? `حذف ${product.name} از علاقه‌مندی‌ها`
                        : `افزودن ${product.name} به علاقه‌مندی‌ها`
                    }
                    onClick={handleWishlist}
                    className={cn(isWishlisted && "text-gold-dark")}
                  >
                    <Heart
                      className={cn("size-4", isWishlisted && "fill-current")}
                    />
                  </Button>
                </div>
              </div>

              {/* Stock status */}
              {isOutOfStock ? (
                <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                  ناموجود
                </Badge>
              ) : isLowStock ? (
                <p className="text-xs text-warning">
                  تنها {formatNumber(product.stock)} عدد باقی مانده
                </p>
              ) : null}

              {/* Trust bar */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-surface-secondary/40 p-4 text-xs text-text-secondary sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Truck className="size-4 shrink-0 text-gold-dark" aria-hidden />
                  ارسال رایگان بالای ۲ میلیون تومان
                </div>
                <div className="flex items-center gap-2">
                  <Undo2 className="size-4 shrink-0 text-gold-dark" aria-hidden />
                  تعویض و مرجوعی ۷ روزه
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="size-4 shrink-0 text-gold-dark" aria-hidden />
                  تضمین اصالت کالا
                </div>
                <div className="flex items-center gap-2">
                  <svg className="size-4 shrink-0 text-gold-dark" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                  ارسال ۲ تا ۴ روز کاری
                </div>
              </div>
            </div>
          </div>

          {/* ---- Modern Tabs Section ---- */}
          <section className="mt-16" aria-labelledby="tabs-heading">
            <h2 id="tabs-heading" className="sr-only">جزئیات محصول</h2>
            
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              {/* Custom Styled Tabs List */}
              <div className="border-b border-border/60">
                <TabsList className="grid grid-cols-3 w-full bg-transparent p-0.5 rounded-xl bg-surface-secondary/30" role="tablist" aria-label="بخش‌های محصول">
                  <TabsTrigger
                    value="description"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-text data-[state=active]:border-none rounded-xl px-5 py-3.5 text-sm font-semibold text-text-muted transition-all duration-200 hover:bg-white/50 focus-visible:ring-2 focus-visible:ring-gold-light"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="size-4" aria-hidden />
                      توضیحات
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="specs"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-text data-[state=active]:border-none rounded-xl px-5 py-3.5 text-sm font-semibold text-text-muted transition-all duration-200 hover:bg-white/50 focus-visible:ring-2 focus-visible:ring-gold-light"
                  >
                    <span className="flex items-center gap-2">
                      <Star className="size-4" aria-hidden />
                      مشخصات و سایزها
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-text data-[state=active]:border-none rounded-xl px-5 py-3.5 text-sm font-semibold text-text-muted transition-all duration-200 hover:bg-white/50 focus-visible:ring-2 focus-visible:ring-gold-light"
                  >
                    <span className="flex items-center gap-2">
                      <Star className="size-4 fill-gold-dark text-gold-dark" aria-hidden />
                      دیدگاه‌ها
                      <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-[11px]">
                        {formatNumber(product.reviewCount)}
                      </Badge>
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Panels with smooth transitions */}
              <div className="relative min-h-[300px]">
                <TabsContent value="description" className="pt-6 animate-in fade-in duration-300">
                  {product.details && product.details.length > 0 ? (
                    <RichContent blocks={product.details} />
                  ) : (
                    <div className="prose-zivo text-sm leading-7 text-text-secondary">
                      <p className="whitespace-pre-line">{product.description}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="specs" className="pt-6 animate-in fade-in duration-300">
                  <div className="space-y-8">
                    {/* Colors Section */}
                    {product.productColors && product.productColors.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-base font-bold text-text">
                          <span className="size-5 text-gold-dark" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          </span>
                          رنگ‌های موجود
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {availableColors.map((color) => (
                            <div
                              key={color.id}
                              className="flex items-center gap-2 rounded-xl border-2 border-border/40 bg-surface-secondary/30 px-3 py-2"
                            >
                              <span
                                className="size-6 shrink-0 rounded-full border border-border/30"
                                style={{
                                  backgroundColor: color.hex,
                                  backgroundImage: color.image ? `url(${color.image})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                                aria-hidden="true"
                              />
                              <span className="text-sm font-medium text-text">
                                {color.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizes Section */}
                    {product.productSizes && product.productSizes.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-base font-bold text-text">
                          <span className="size-5 text-gold-dark" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V6a2 2 0 0 0-2-2h-4"/><path d="M17 6h.01"/><path d="M3 14h6a2 2 0 0 0 2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2"/><path d="M18 22a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4"/></svg>
                          </span>
                          سایزهای موجود
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {availableSizes.map((size) => (
                            <div
                              key={size.id}
                              className={cn(
                                "relative flex h-12 min-w-[52px] shrink-0 items-center justify-center rounded-xl border-2 px-4 text-sm font-semibold",
                                size.isAvailable
                                  ? "border-border/60 bg-surface text-text"
                                  : "border-border/30 bg-surface-secondary/50 text-text-muted/50 line-through",
                              )}
                            >
                              {size.name}
                              {size.isAvailable && size.stock <= 5 && size.stock > 0 && (
                                <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white">
                                  {size.stock}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spec Table from details */}
                    {hasSpecTable && (
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-base font-bold text-text">
                          <span className="size-5 text-gold-dark" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
                          </span>
                          جدول مشخصات فنی
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-border">
                          <RichContent blocks={specBlocks} />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="pt-6 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <ReviewSummary
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      distribution={distribution}
                    />
                    <div className="flex justify-end">
                      <WriteReviewDialog productId={product.id} />
                    </div>
                    <ReviewList reviews={product.reviews} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </section>

          {/* ---- Related ---- */}
          <RelatedProducts product={product} />
        </div>
      </main>

      <StickyCartBar
        price={product.price}
        discountPrice={product.discountPrice}
        onAdd={handleAdd}
        disabled={!canAdd}
      />
    </>
  );
}