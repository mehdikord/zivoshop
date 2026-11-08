"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { toast } from "sonner";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Heart,
  ListChecks,
  MessageSquareText,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product/product-gallery";
import { SizeSelector } from "@/components/product/size-selector";
import { ColorSelector } from "@/components/product/color-selector";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Price } from "@/components/product/price";
import { DiscountBadge } from "@/components/product/discount-badge";
import { RichContent } from "@/components/product/rich-content";
import { ProductReviews, Stars } from "@/components/product/reviews";
import { RelatedProducts } from "@/components/product/related-products";
import { StickyCartBar } from "@/components/product/sticky-cart-bar";
import { mediaItems } from "@/lib/product-detail";
import { formatNumber, formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";
import type { Product, RichBlock } from "@/types";

type TableBlock = Extract<RichBlock, { type: "table" }>;

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "pdp-description", label: "معرفی محصول", icon: FileText },
  { id: "pdp-specs", label: "مشخصات", icon: ListChecks },
  { id: "pdp-reviews", label: "دیدگاه‌ها", icon: MessageSquareText },
];

const TRUST_ITEMS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: "ارسال رایگان", text: "برای خریدهای بالای ۲ میلیون تومان" },
  { icon: Undo2, title: "۷ روز ضمانت بازگشت", text: "تعویض و مرجوعی آسان" },
  { icon: ShieldCheck, title: "تضمین اصالت", text: "کالای اورجینال با کیفیت تضمینی" },
  { icon: Clock3, title: "ارسال سریع", text: "تحویل ۲ تا ۴ روز کاری" },
];

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

export function ProductDetailPage({ product }: { product: Product }) {
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
  const [successAdded, setSuccessAdded] = useState(false);
  const selectorsRef = useRef<HTMLDivElement>(null);

  // Per-size stock is optional: only treat sizes as sold out when the
  // store actually tracks stock per size.
  const productSizes = product.productSizes ?? [];
  const sizeStockTracked = productSizes.some((s) => s.stock > 0);
  const unavailableSizes = productSizes
    .filter((s) => !s.isActive || (sizeStockTracked && s.stock <= 0))
    .map((s) => s.name);

  const media = mediaItems(product);
  const discount =
    product.discountPrice && product.discountPrice < product.price
      ? (product.discountPercent ??
          Math.round((1 - product.discountPrice / product.price) * 100))
      : 0;
  const saving =
    product.discountPrice && product.discountPrice < product.price
      ? product.price - product.discountPrice
      : 0;

  const canAdd =
    !isOutOfStock &&
    (product.sizes.length === 0 || selectedSize !== null) &&
    (product.colors.length === 0 || selectedColor !== null);

  const handleAdd = () => {
    const missingSize = product.sizes.length > 0 && !selectedSize;
    const missingColor = product.colors.length > 0 && !selectedColor;
    if (missingSize || missingColor) {
      setSizeError(missingSize);
      setColorError(missingColor);
      selectorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error(missingSize ? "لطفاً سایز را انتخاب کنید" : "لطفاً رنگ را انتخاب کنید");
      return;
    }
    if (isOutOfStock) return;

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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("لینک محصول کپی شد");
    } catch {
      // user cancelled the share sheet
    }
  };

  const crumbItems = [
    { label: "همه محصولات", href: "/products" as const },
    ...(product.categoryName && product.categorySlug
      ? [{ label: product.categoryName, href: `/products?category=${product.categorySlug}` }]
      : []),
    { label: product.name },
  ];

  const descriptionBlocks = (product.details ?? []).filter((b) => b.type !== "table");
  const tableBlocks = (product.details ?? []).filter(
    (b): b is TableBlock => b.type === "table" && (b.rows.length > 0 || b.headers.length > 0),
  );

  return (
    <>
      <main className="min-h-screen bg-background pb-40 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <Breadcrumb items={crumbItems} />

          {/* ============================ Hero ============================ */}
          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <ProductGallery media={media} name={product.name} />

            <div className="space-y-6">
              {/* Title block */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {product.brandName ? (
                    product.brandSlug ? (
                      <Link
                        href={`/products?brand=${product.brandSlug}` as Route}
                        className="inline-flex items-center rounded-full border border-gold-dark/30 bg-surface px-3 py-1 text-xs font-semibold text-gold-dark transition-colors hover:bg-gold-light/50"
                      >
                        {product.brandName}
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-gold-dark">{product.brandName}</span>
                    )
                  ) : null}
                  {product.isNew ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                      <Sparkles className="size-3" aria-hidden />
                      جدید
                    </span>
                  ) : null}
                  {product.isBestseller ? (
                    <span className="inline-flex items-center rounded-full bg-gold-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                      پرفروش
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-3 text-2xl font-extrabold leading-snug text-text sm:text-[1.75rem]">
                  {product.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  {product.reviewCount > 0 ? (
                    <a
                      href="#pdp-reviews"
                      className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-primary"
                    >
                      <Stars value={product.rating} />
                      <span className="font-bold text-text tabular-nums">
                        {formatNumber(Math.round(product.rating * 10) / 10)}
                      </span>
                      <span className="text-text-muted underline-offset-4 hover:underline">
                        ({formatNumber(product.reviewCount)} دیدگاه)
                      </span>
                    </a>
                  ) : (
                    <a href="#pdp-reviews" className="text-xs text-text-muted hover:text-primary">
                      اولین دیدگاه را ثبت کنید
                    </a>
                  )}
                  {product.categoryName ? (
                    <span className="text-xs text-text-muted">
                      دسته‌بندی:{" "}
                      {product.categorySlug ? (
                        <Link
                          href={`/products?category=${product.categorySlug}` as Route}
                          className="font-medium text-text-secondary hover:text-primary"
                        >
                          {product.categoryName}
                        </Link>
                      ) : (
                        product.categoryName
                      )}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Price panel */}
              <div className="rounded-2xl border border-border/70 bg-surface p-4 shadow-soft sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
                    {discount > 0 ? <DiscountBadge percent={discount} /> : null}
                  </div>
                  <StockPill outOfStock={isOutOfStock} low={isLowStock} stock={product.stock} />
                </div>
                {saving > 0 ? (
                  <p className="mt-3 rounded-xl bg-success-light/70 px-3 py-2 text-xs font-medium text-success">
                    سود شما از این خرید: {formatPrice(saving)}
                  </p>
                ) : null}
              </div>

              {/* Selectors */}
              <div ref={selectorsRef} className="space-y-5">
                {product.sizes.length > 0 ? (
                  <div>
                    <SizeSelector
                      sizes={product.sizes}
                      unavailable={unavailableSizes}
                      value={selectedSize}
                      onChange={(s) => {
                        setSelectedSize(s);
                        setSizeError(false);
                      }}
                    />
                    {sizeError ? (
                      <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                        لطفاً سایز را انتخاب کنید
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {product.colors.length > 0 ? (
                  <div>
                    <ColorSelector
                      colors={product.colors}
                      unavailable={[]}
                      value={selectedColor}
                      onChange={(c) => {
                        setSelectedColor(c);
                        setColorError(false);
                      }}
                    />
                    {colorError ? (
                      <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                        لطفاً رنگ را انتخاب کنید
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={product.stock}
                  disabled={isOutOfStock}
                />
                <Button
                  variant="gold"
                  size="lg"
                  className={cn(
                    "min-w-44 flex-1 transition-all",
                    successAdded && "bg-success text-white hover:bg-success",
                  )}
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                >
                  {successAdded ? (
                    <>
                      <Check className="size-4" aria-hidden />
                      به سبد اضافه شد
                    </>
                  ) : isOutOfStock ? (
                    "ناموجود"
                  ) : (
                    <>
                      <ShoppingBag className="size-4" aria-hidden />
                      افزودن به سبد خرید
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline-gold"
                    size="icon-lg"
                    aria-pressed={isWishlisted}
                    aria-label={
                      isWishlisted
                        ? `حذف ${product.name} از علاقه‌مندی‌ها`
                        : `افزودن ${product.name} به علاقه‌مندی‌ها`
                    }
                    onClick={handleWishlist}
                    className={cn(isWishlisted && "border-gold-dark bg-gold-light/50 text-gold-dark")}
                  >
                    <Heart className={cn("size-5", isWishlisted && "fill-current")} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label="اشتراک‌گذاری محصول"
                    onClick={handleShare}
                  >
                    <Share2 className="size-5" />
                  </Button>
                </div>
              </div>

              {/* Trust grid */}
              <ul className="grid grid-cols-2 gap-3">
                {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/70 p-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold-light/50 text-gold-dark">
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-text">{title}</span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-text-muted">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ======================= Detail sections ======================= */}
          <SectionNav reviewCount={product.reviewCount} />

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-12">
              <DetailSection id="pdp-description" icon={FileText} title="معرفی محصول">
                <Collapsible>
                  {descriptionBlocks.length > 0 ? (
                    <RichContent blocks={descriptionBlocks} />
                  ) : product.description ? (
                    <p className="whitespace-pre-line text-sm leading-8 text-text-secondary">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted">توضیحاتی برای این محصول ثبت نشده است.</p>
                  )}
                </Collapsible>
              </DetailSection>

              <DetailSection id="pdp-specs" icon={ListChecks} title="مشخصات محصول">
                <SpecsList
                  product={product}
                  unavailableSizes={unavailableSizes}
                  tables={tableBlocks}
                />
              </DetailSection>

              <DetailSection
                id="pdp-reviews"
                icon={MessageSquareText}
                title="دیدگاه خریداران"
                plain
              >
                <ProductReviews
                  productId={product.id}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  reviews={product.reviews}
                />
              </DetailSection>
            </div>

            {/* Sticky buy box (desktop) */}
            <aside className="hidden lg:sticky lg:top-52 lg:block" aria-label="خرید سریع">
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-soft">
                <div className="flex items-center gap-3 border-b border-border/60 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt=""
                    className="size-16 shrink-0 rounded-xl bg-surface-secondary object-cover"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-bold leading-6 text-text">{product.name}</p>
                    {product.brandName ? (
                      <p className="mt-0.5 text-[11px] text-text-muted">{product.brandName}</p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
                    {discount > 0 ? <DiscountBadge percent={discount} /> : null}
                  </div>
                  {(product.sizes.length > 0 || product.colors.length > 0) ? (
                    <dl className="space-y-1.5 rounded-xl bg-surface-secondary/50 px-3 py-2.5 text-xs">
                      {product.sizes.length > 0 ? (
                        <div className="flex justify-between gap-2">
                          <dt className="text-text-muted">سایز</dt>
                          <dd className={cn("font-semibold", selectedSize ? "text-text" : "text-warning")}>
                            {selectedSize ?? "انتخاب نشده"}
                          </dd>
                        </div>
                      ) : null}
                      {product.colors.length > 0 ? (
                        <div className="flex justify-between gap-2">
                          <dt className="text-text-muted">رنگ</dt>
                          <dd className={cn("font-semibold", selectedColor ? "text-text" : "text-warning")}>
                            {selectedColor ?? "انتخاب نشده"}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                  <Button
                    variant="gold"
                    className="w-full"
                    disabled={isOutOfStock}
                    onClick={handleAdd}
                  >
                    <ShoppingBag className="size-4" aria-hidden />
                    {isOutOfStock ? "ناموجود" : canAdd ? "افزودن به سبد خرید" : "انتخاب ویژگی‌ها"}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
                    <BadgeCheck className="size-3.5 text-success" aria-hidden />
                    ضمانت اصالت و ۷ روز بازگشت کالا
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <RelatedProducts product={product} />
        </div>
      </main>

      <StickyCartBar
        price={product.price}
        discountPrice={product.discountPrice}
        onAdd={handleAdd}
        disabled={isOutOfStock}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Sub-parts                                  */
/* -------------------------------------------------------------------------- */

function StockPill({ outOfStock, low, stock }: { outOfStock: boolean; low: boolean; stock: number }) {
  const tone = outOfStock
    ? "bg-surface-secondary text-text-muted"
    : low
      ? "bg-warning-light text-warning"
      : "bg-success-light text-success";
  const dot = outOfStock ? "bg-text-muted" : low ? "bg-warning" : "bg-success";
  const label = outOfStock
    ? "ناموجود"
    : low
      ? `تنها ${formatNumber(stock)} عدد باقی مانده`
      : "موجود در انبار";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", tone)}>
      <span className={cn("size-1.5 rounded-full", dot, low && "animate-pulse")} aria-hidden />
      {label}
    </span>
  );
}

/** Sticky in-page navigation with scroll-spy. */
function SectionNav({ reviewCount }: { reviewCount: number }) {
  const [active, setActive] = useState(SECTIONS[0]!.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="بخش‌های صفحه محصول"
      className="sticky top-16 z-20 -mx-4 mt-14 mb-8 border-b border-border/60 bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:-mx-6 sm:px-6 lg:top-32"
    >
      <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActive(id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-colors",
                  isActive ? "text-primary" : "text-text-muted hover:text-text",
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-gold-dark" : "")} aria-hidden />
                {label}
                {id === "pdp-reviews" && reviewCount > 0 ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      isActive ? "bg-gold-light text-primary" : "bg-surface-secondary text-text-muted",
                    )}
                  >
                    {formatNumber(reviewCount)}
                  </span>
                ) : null}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold-dark transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DetailSection({
  id,
  icon: Icon,
  title,
  plain = false,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  /** Plain: no card wrapper (the content brings its own surfaces). */
  plain?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-36 lg:scroll-mt-52">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-gold">
          <Icon className="size-5" aria-hidden />
        </span>
        <h2 id={`${id}-title`} className="text-lg font-extrabold text-text">
          {title}
        </h2>
        <span className="h-px flex-1 bg-gradient-to-l from-border to-transparent" aria-hidden />
      </div>
      {plain ? (
        children
      ) : (
        <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-soft sm:p-7">
          {children}
        </div>
      )}
    </section>
  );
}

/** Clamps long content with a fade and a "show more" toggle. */
function Collapsible({ children, maxHeight = 420 }: { children: React.ReactNode; maxHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > maxHeight + 40);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxHeight]);

  const clamped = overflowing && !open;

  return (
    <div>
      <div
        ref={ref}
        className="relative overflow-hidden transition-[max-height] duration-500"
        style={{ maxHeight: clamped ? maxHeight : undefined }}
      >
        {children}
        {clamped ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface to-transparent"
          />
        ) : null}
      </div>
      {overflowing ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:text-primary"
        >
          {open ? "بستن" : "مشاهده بیشتر"}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{children}</dd>
    </div>
  );
}

/**
 * Key/value specification list. Two-column table blocks from the product
 * details are merged in as extra rows; wider tables render underneath.
 */
function SpecsList({
  product,
  unavailableSizes,
  tables,
}: {
  product: Product;
  unavailableSizes: string[];
  tables: TableBlock[];
}) {
  const { pairRows, wideTables } = useMemo(() => {
    const pairs: [string, string][] = [];
    const wide: TableBlock[] = [];
    for (const t of tables) {
      const isPairs = t.headers.length <= 2 && t.rows.every((r) => r.length === 2);
      if (isPairs) t.rows.forEach((r) => pairs.push([r[0] ?? "", r[1] ?? ""]));
      else wide.push(t);
    }
    return { pairRows: pairs, wideTables: wide };
  }, [tables]);

  const colors = product.productColors?.length
    ? product.productColors
    : product.colors.map((c, i) => ({ ...c, id: String(i) }));

  return (
    <div className="space-y-8">
      <dl className="divide-y divide-border/60">
        {product.brandName ? (
          <SpecRow label="برند">
            {product.brandSlug ? (
              <Link href={`/products?brand=${product.brandSlug}` as Route} className="text-gold-dark hover:underline">
                {product.brandName}
              </Link>
            ) : (
              product.brandName
            )}
          </SpecRow>
        ) : null}
        {product.categoryName ? (
          <SpecRow label="دسته‌بندی">
            {product.categorySlug ? (
              <Link href={`/products?category=${product.categorySlug}` as Route} className="text-gold-dark hover:underline">
                {product.categoryName}
              </Link>
            ) : (
              product.categoryName
            )}
          </SpecRow>
        ) : null}
        {colors.length > 0 ? (
          <SpecRow label="رنگ‌بندی">
            <ul className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <li
                  key={c.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background py-1 ps-1 pe-3 text-xs"
                >
                  <span
                    className="size-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden
                  />
                  {c.name}
                </li>
              ))}
            </ul>
          </SpecRow>
        ) : null}
        {product.sizes.length > 0 ? (
          <SpecRow label="سایزبندی">
            <ul className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const off = unavailableSizes.includes(s);
                return (
                  <li
                    key={s}
                    className={cn(
                      "flex h-8 min-w-10 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold",
                      off
                        ? "border-border/50 bg-surface-secondary/50 text-text-muted line-through"
                        : "border-border bg-background text-text",
                    )}
                  >
                    {s}
                  </li>
                );
              })}
            </ul>
          </SpecRow>
        ) : null}
        {pairRows.map(([k, v], i) => (
          <SpecRow key={`${k}-${i}`} label={k}>
            {v}
          </SpecRow>
        ))}
        <SpecRow label="وضعیت موجودی">
          {product.stock <= 0 ? (
            <span className="text-text-muted">ناموجود</span>
          ) : product.stock <= 5 ? (
            <span className="text-warning">موجودی محدود</span>
          ) : (
            <span className="text-success">موجود</span>
          )}
        </SpecRow>
      </dl>

      {wideTables.map((t, i) => (
        <div key={i} className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[480px] text-sm">
            {t.headers.length > 0 ? (
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  {t.headers.map((h, j) => (
                    <th key={j} className="px-4 py-3 text-start text-xs font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {t.rows.map((row, j) => (
                <tr key={j} className="border-t border-border/60 even:bg-surface-secondary/40">
                  {row.map((cell, k) => (
                    <td key={k} className={cn("px-4 py-2.5", k === 0 ? "font-medium text-text" : "text-text-secondary")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
