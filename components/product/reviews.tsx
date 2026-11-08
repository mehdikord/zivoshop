"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Camera, MessageSquareText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WriteReviewDialog } from "@/components/product/write-review-dialog";
import { formatDate, formatNumber } from "@/lib/format";
import { reviewDistribution, type DistributionEntry } from "@/lib/product-detail";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

type SortKey = "newest" | "highest" | "lowest";
type FilterKey = "all" | "photos" | "verified";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "جدیدترین" },
  { key: "highest", label: "بیشترین امتیاز" },
  { key: "lowest", label: "کمترین امتیاز" },
];

const RATING_LABEL: Record<number, string> = {
  5: "عالی",
  4: "خوب",
  3: "معمولی",
  2: "ضعیف",
  1: "خیلی ضعیف",
};

export function Stars({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const cls = size === "xs" ? "size-3" : size === "sm" ? "size-3.5" : "size-5";
  return (
    <span
      className={cn("inline-flex gap-0.5", className)}
      role="img"
      aria-label={`${formatNumber(Math.round(value * 10) / 10)} از ۵ ستاره`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            cls,
            i < Math.round(value)
              ? "fill-gold-dark text-gold-dark"
              : "fill-border/50 text-border",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** Real distribution when every review is loaded, otherwise an estimate. */
function useDistribution(
  reviews: Review[],
  rating: number,
  total: number,
): DistributionEntry[] {
  return useMemo(() => {
    if (reviews.length > 0 && reviews.length >= total) {
      return [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
        return {
          stars,
          count,
          percent: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
        };
      });
    }
    return reviewDistribution(rating, total);
  }, [reviews, rating, total]);
}

/**
 * Complete reviews block for the PDP: score summary with a clickable
 * star distribution, a call-to-action card, filter/sort controls and a
 * paginated list of review cards.
 */
export function ProductReviews({
  productId,
  rating,
  reviewCount,
  reviews,
}: {
  productId: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}) {
  const distribution = useDistribution(reviews, rating, reviewCount);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const withPhotos = reviews.filter((r) => r.images && r.images.length > 0).length;
  const verified = reviews.filter((r) => r.verifiedPurchase).length;
  const recommendPercent = reviews.length
    ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)
    : null;

  const list = useMemo(() => {
    let items = [...reviews];
    if (starFilter) items = items.filter((r) => Math.round(r.rating) === starFilter);
    if (filter === "photos") items = items.filter((r) => r.images && r.images.length > 0);
    if (filter === "verified") items = items.filter((r) => r.verifiedPurchase);
    items.sort((a, b) => {
      if (sort === "highest") return b.rating - a.rating;
      if (sort === "lowest") return a.rating - b.rating;
      return (b.date || "").localeCompare(a.date || "");
    });
    return items;
  }, [reviews, starFilter, filter, sort]);

  const resetPaging = () => setVisible(PAGE_SIZE);
  const hasReviews = reviews.length > 0;

  return (
    <div className="space-y-6">
      {/* ------------------------- Summary + CTA ------------------------- */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-6 rounded-3xl border border-border/70 bg-surface p-5 shadow-soft sm:grid-cols-[180px_minmax(0,1fr)] sm:p-6">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-gold-light/60 to-gold-light/10 px-4 py-6 text-center">
            <span className="font-display text-5xl font-extrabold leading-none text-primary tabular-nums">
              {hasReviews || rating ? formatNumber(Math.round(rating * 10) / 10) : "—"}
            </span>
            <span className="mt-1 text-xs text-text-muted">از ۵</span>
            <Stars value={rating} size="md" className="mt-3" />
            <span className="mt-2 text-xs text-text-secondary">
              بر اساس {formatNumber(reviewCount)} دیدگاه
            </span>
          </div>

          <div className="flex flex-col justify-center gap-2">
            {distribution.map((row) => {
              const active = starFilter === row.stars;
              const disabled = row.count === 0 && !active;
              return (
                <button
                  key={row.stars}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => {
                    setStarFilter(active ? null : row.stars);
                    resetPaging();
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-2 py-1 text-xs tabular-nums transition-colors",
                    active ? "bg-gold-light/50" : "hover:bg-surface-secondary/70",
                    disabled && "cursor-default opacity-50 hover:bg-transparent",
                  )}
                >
                  <span className="flex w-16 shrink-0 items-center gap-1 text-text-secondary">
                    <Star className="size-3 fill-gold-dark text-gold-dark" aria-hidden />
                    {formatNumber(row.stars)}
                    <span className="hidden text-text-muted sm:inline">· {RATING_LABEL[row.stars]}</span>
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-secondary">
                    <span
                      className="block h-full rounded-full bg-gradient-to-l from-gold to-gold-dark transition-[width] duration-500"
                      style={{ width: `${row.percent}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-end text-text-muted">
                    {formatNumber(row.percent)}٪
                  </span>
                </button>
              );
            })}
            {starFilter ? (
              <button
                type="button"
                onClick={() => setStarFilter(null)}
                className="self-start px-2 text-xs font-medium text-gold-dark hover:underline"
              >
                حذف فیلتر امتیاز
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-3xl border border-gold-dark/20 bg-primary p-6 text-primary-foreground shadow-soft">
          <div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
              <MessageSquareText className="size-5 text-gold" aria-hidden />
            </span>
            <p className="mt-4 text-base font-bold">نظر شما برای ما ارزشمند است</p>
            <p className="mt-1.5 text-xs leading-6 text-primary-foreground/70">
              تجربه خود از این محصول را با دیگران به اشتراک بگذارید و به انتخاب بهتر آن‌ها کمک کنید.
            </p>
            {recommendPercent !== null ? (
              <p className="mt-3 text-xs text-gold-light">
                {formatNumber(recommendPercent)}٪ از خریداران این محصول را پیشنهاد کرده‌اند
              </p>
            ) : null}
          </div>
          <WriteReviewDialog productId={productId} compact />
        </div>
      </div>

      {/* --------------------------- Toolbar ---------------------------- */}
      {hasReviews ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="فیلتر دیدگاه‌ها">
            <FilterChip active={filter === "all"} onClick={() => { setFilter("all"); resetPaging(); }}>
              همه <span className="text-text-muted">({formatNumber(reviews.length)})</span>
            </FilterChip>
            {withPhotos > 0 ? (
              <FilterChip active={filter === "photos"} onClick={() => { setFilter("photos"); resetPaging(); }}>
                <Camera className="size-3.5" aria-hidden />
                دارای تصویر <span className="text-text-muted">({formatNumber(withPhotos)})</span>
              </FilterChip>
            ) : null}
            {verified > 0 ? (
              <FilterChip active={filter === "verified"} onClick={() => { setFilter("verified"); resetPaging(); }}>
                <BadgeCheck className="size-3.5" aria-hidden />
                خریداران <span className="text-text-muted">({formatNumber(verified)})</span>
              </FilterChip>
            ) : null}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-surface p-1 text-xs" role="group" aria-label="مرتب‌سازی دیدگاه‌ها">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={sort === s.key}
                onClick={() => setSort(s.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 font-medium transition-colors",
                  sort === s.key
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:text-primary",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* ----------------------------- List ----------------------------- */}
      {!hasReviews ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-gold-light/50">
            <Star className="size-6 text-gold-dark" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-bold text-text">هنوز دیدگاهی ثبت نشده است</p>
          <p className="mt-1 text-xs text-text-muted">اولین نفری باشید که درباره این محصول نظر می‌دهد.</p>
        </div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-border/60 bg-surface py-10 text-center text-sm text-text-muted">
          دیدگاهی با این فیلتر یافت نشد.
        </p>
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {list.slice(0, visible).map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
          {list.length > visible ? (
            <div className="flex justify-center">
              <Button variant="outline-gold" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                نمایش دیدگاه‌های بیشتر
                <span className="text-text-muted">({formatNumber(list.length - visible)})</span>
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-gold-dark bg-gold-light/60 text-primary"
          : "border-border/70 bg-surface text-text-secondary hover:border-gold-dark/60",
      )}
    >
      {children}
    </button>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.content.length > 280;

  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-surface p-5 transition-shadow hover:shadow-soft">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold text-sm font-extrabold text-primary"
          >
            {review.userName.trim().slice(0, 1) || "ک"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text">{review.userName}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-muted">
              {review.date ? (
                <time dateTime={review.date}>{formatDate(review.date)}</time>
              ) : null}
              {review.verifiedPurchase ? (
                <span className="inline-flex items-center gap-0.5 font-medium text-success">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  خریدار محصول
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-light/50 px-2 py-1 text-xs font-bold text-primary tabular-nums">
          <Star className="size-3 fill-gold-dark text-gold-dark" aria-hidden />
          {formatNumber(review.rating)}
        </span>
      </header>

      {review.title ? <p className="text-sm font-bold text-text">{review.title}</p> : null}

      <p
        className={cn(
          "whitespace-pre-line text-sm leading-7 text-text-secondary",
          long && !expanded && "line-clamp-4",
        )}
      >
        {review.content}
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-xs font-semibold text-gold-dark hover:underline"
        >
          {expanded ? "بستن" : "ادامه مطلب"}
        </button>
      ) : null}

      {review.images && review.images.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {review.images.map((src, i) => (
            <a
              key={i}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden rounded-xl border border-border/60 transition-opacity hover:opacity-90"
            >
              <Image
                src={src}
                alt={`تصویر دیدگاه ${review.userName} ${i + 1}`}
                width={64}
                height={64}
                className="size-16 object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
