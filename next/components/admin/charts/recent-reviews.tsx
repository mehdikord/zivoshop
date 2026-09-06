"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, ExternalLink } from "lucide-react";

interface RecentReview {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  productName: string;
  userName: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function RecentReviews() {
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setReviews(result.data.recentReviews);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-[var(--gold)]" />
          <h3 className="font-semibold text-[var(--text)]">آخرین نظرات</h3>
        </div>
        <a
          href="/admin/reviews"
          className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
        >
          مشاهده همه
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {reviews.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)]">
          نظری ثبت نشده است
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {reviews.map((review) => (
            <div key={review.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">
                    {review.userName}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">در مورد</span>
                  <span className="text-sm text-[var(--primary)]">
                    {review.productName}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <div className="mb-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= review.rating
                        ? "fill-[var(--gold)] text-[var(--gold)]"
                        : "text-[var(--border)]"
                    }`}
                  />
                ))}
              </div>

              {review.title && (
                <p className="mb-1 text-sm font-medium text-[var(--text)]">
                  {review.title}
                </p>
              )}
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
