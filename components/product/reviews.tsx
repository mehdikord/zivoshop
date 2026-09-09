"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/format";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Star display + review count summary (shared by PDP sidebar + review tab).
 */
export function ReviewSummary({
  rating,
  reviewCount,
  distribution,
}: {
  rating: number;
  reviewCount: number;
  distribution: { stars: number; count: number; percent: number }[];
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
      <div className="flex flex-col items-center text-center">
        <span className="text-4xl font-extrabold text-text tabular-nums">
          {formatNumber(rating)}
        </span>
        <div className="mt-1 flex gap-0.5" aria-label={`${formatNumber(rating)} از ۵`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i < Math.round(rating)
                  ? "fill-gold-dark text-gold-dark"
                  : "text-border",
              )}
              aria-hidden
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {formatNumber(reviewCount)} دیدگاه
        </p>
      </div>
      <div className="flex-1 space-y-1.5">
        {distribution.map((row) => (
          <div key={row.stars} className="flex items-center gap-2 text-xs tabular-nums">
            <span className="w-3 text-end text-text-muted">{row.stars}</span>
            <Star className="size-3 fill-gold-dark text-gold-dark" aria-hidden />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full rounded-full bg-gold-dark transition-all"
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <span className="w-6 text-end text-text-muted">{row.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Single review card (PRD §21).
 */
function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="space-y-2 rounded-2xl border border-border/60 bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-surface-secondary text-xs font-bold text-text-muted">
            {review.userName.slice(0, 1)}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{review.userName}</p>
            <div className="flex gap-0.5" aria-label={`${review.rating} از ۵`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3",
                    i < review.rating
                      ? "fill-gold-dark text-gold-dark"
                      : "text-border",
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <time className="text-[11px] text-text-muted" dateTime={review.date}>
            {formatDate(review.date)}
          </time>
          {review.verifiedPurchase ? (
            <Badge variant="gold" className="px-1.5 py-0 text-[10px]">
              خرید تأییدشده
            </Badge>
          ) : null}
        </div>
      </div>
      {review.title ? (
        <p className="text-sm font-bold text-text">{review.title}</p>
      ) : null}
      <p className="text-sm leading-7 text-text-secondary">{review.content}</p>
      {review.images && review.images.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {review.images.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`تصویر دیدگاه ${i + 1}`}
              width={56}
              height={56}
              className="size-14 rounded-lg object-cover"
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

/** Full review list (PRD §21) — rendered in a PDP tab. */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        هنوز دیدگاهی ثبت نشده است.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
