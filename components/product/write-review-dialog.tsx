"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, Loader2, LogIn, PenLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/**
 * Write review dialog (PRD §21).
 * Guests see a message prompting login instead of the form.
 * Submitted reviews are stored as pending and appear only after admin approval.
 */
export function WriteReviewDialog({
  productId,
  compact = false,
  className,
}: {
  productId: string;
  /** Compact: a single full-width button for guests and members alike. */
  compact?: boolean;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating > 0 && content.trim().length >= 2;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, content: content.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("دیدگاه شما ثبت شد. پس از بازبینی نمایش داده خواهد شد.");
        setOpen(false);
        setRating(0);
        setContent("");
      } else {
        toast.error(data.message || "خطا در ثبت دیدگاه");
      }
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    const redirect = pathname || "/";
    if (compact) {
      return (
        <Button asChild variant="gold" className={cn("w-full", className)}>
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}>
            <LogIn className="size-4" aria-hidden />
            ورود و ثبت دیدگاه
          </Link>
        </Button>
      );
    }
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-secondary/40 px-6 py-10 text-center">
        <LogIn className="mb-3 size-8 text-gold-dark" aria-hidden />
        <p className="text-sm font-medium text-text">
          برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید
        </p>
        <Button asChild variant="gold" size="default" className="mt-4">
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}>
            ورود به حساب کاربری
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button variant="gold" className={cn("w-full", className)}>
            <PenLine className="size-4" aria-hidden />
            ثبت دیدگاه
          </Button>
        ) : (
          <Button variant="outline-gold" size="sm" className={className}>
            ثبت دیدگاه
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ثبت دیدگاه</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-text">
              امتیاز شما
            </p>
            <div className="flex gap-1" role="radiogroup" aria-label="امتیاز">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={rating === v}
                  aria-label={`${v} ستاره`}
                  onClick={() => setRating(v)}
                  onMouseEnter={() => setHover(v)}
                  onMouseLeave={() => setHover(0)}
                  className="p-0.5 focus-visible:ring-2 focus-visible:ring-gold-dark/50"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      (hover || rating) >= v
                        ? "fill-gold-dark text-gold-dark"
                        : "text-border",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="review-content"
              className="mb-1 block text-sm font-semibold text-text"
            >
              متن دیدگاه
            </label>
            <textarea
              id="review-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="تجربه خود را بنویسید..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
            />
          </div>
          <Button
            variant="gold"
            size="sm"
            className="w-full"
            disabled={!canSubmit || submitting}
            onClick={submit}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            ارسال دیدگاه
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}