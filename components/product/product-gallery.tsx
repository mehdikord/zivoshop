"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Play,
  ZoomIn,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-media-query";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/product-detail";

/**
 * Product gallery (PRD §19): zoom + thumbnails + fullscreen on desktop,
 * swipe carousel with dots on mobile, video support everywhere.
 */
export function ProductGallery({
  media,
  name,
}: {
  media: MediaItem[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  const current = media[Math.min(active, media.length - 1)] ?? media[0];
  const isSingle = media.length <= 1;
  const isVideo = current?.type === "video";

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(media.length - 1, index));
    setActive(clamped);
    const el = trackRef.current;
    if (el) {
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    }
  };

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(media.length - 1, Math.max(0, idx)));
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVideo) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const renderMedia = (item: MediaItem, className: string) => {
    if (item.type === "video") {
      return (
        <video
          src={item.src}
          poster={item.poster}
          controls
          playsInline
          preload="metadata"
          className={cn("h-full w-full bg-text/5 object-contain", className)}
        />
      );
    }
    return (
      <Image
        src={item.src}
        alt={item.alt ?? name}
        fill
        sizes="(max-width: 1024px) 100vw, (min-width: 1024px) 50vw"
        className={cn("object-cover", className)}
      />
    );
  };

  return (
    <div>
      {/* ---------- Desktop: thumbnails + main ---------- */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[96px_minmax(0,1fr)]">
        <div
          className="flex flex-col gap-3"
          role="tablist"
          aria-label="تصاویر محصول"
        >
          {media.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`نمایش ${item.alt}`}
              onClick={() => goTo(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 transition-colors",
                i === active
                  ? "border-gold-dark"
                  : "border-transparent hover:border-gold-dark/50",
              )}
            >
              {item.type === "image" ? (
                <Image src={item.src} alt="" fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-text/5">
                  <Play className="size-4 text-gold-dark" aria-hidden />
                </span>
              )}
            </button>
          ))}
        </div>

        <div
          className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-surface-secondary"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
        >
          {!isVideo && !isSingle ? (
            <span className="pointer-events-none absolute start-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 text-[11px] text-text-muted opacity-0 shadow-soft backdrop-blur transition-opacity group-hover:opacity-100">
              <ZoomIn className="size-3.5" aria-hidden />
              برای بزرگنمایی حرکت دهید
            </span>
          ) : null}
          <div
            className={cn(
              "h-full w-full transition-transform duration-200",
              !isVideo && zoom && "scale-[1.9] [transition-duration:80ms]",
            )}
            style={
              zoom && !isVideo
                ? { transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          >
            {current ? renderMedia(current, "") : null}
          </div>
          {!isSingle ? (
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-3">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="تصویر قبلی"
                className="flex size-9 items-center justify-center rounded-full bg-surface/90 text-text shadow-soft backdrop-blur transition-colors hover:text-gold-dark"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label="تصویر بعدی"
                className="flex size-9 items-center justify-center rounded-full bg-surface/90 text-text shadow-soft backdrop-blur transition-colors hover:text-gold-dark"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="نمایش تمام‌صفحه"
            className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-surface/90 text-text shadow-soft backdrop-blur transition-colors hover:text-gold-dark"
          >
            <Expand className="size-4.5" aria-hidden />
          </button>
        </div>
      </div>

      {/* ---------- Mobile: swipe carousel + dots ---------- */}
      <div className="lg:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
          aria-label="گالری محصول"
        >
          {media.map((item, i) => (
            <div
              key={`${item.src}-${i}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden rounded-2xl border border-border/60 bg-surface-secondary"
            >
              {renderMedia(item, "")}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex gap-1.5" aria-hidden>
            {media.map((item, i) => (
              <span
                key={`${item.src}-${i}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-5 bg-gold-dark" : "w-1.5 bg-border",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="نمایش تمام‌صفحه"
            className="flex size-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:text-gold-dark"
          >
            <Expand className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* ---------- Fullscreen ---------- */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-5xl p-3 sm:p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>گالری {name}</DialogTitle>
            <DialogDescription>
              مشاهده تصاویر و ویدیوهای محصول
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3">
            {!isSingle ? (
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="قبلی"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-text transition-colors hover:border-gold-dark hover:text-gold-dark"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            ) : null}
            <div className="relative flex aspect-[4/5] max-h-[75dvh] flex-1 items-center justify-center overflow-hidden rounded-xl bg-text/5">
              {current ? renderMedia(current, "object-contain") : null}
            </div>
            {!isSingle ? (
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label="بعدی"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-text transition-colors hover:border-gold-dark hover:text-gold-dark"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            ) : null}
          </div>
          {mounted ? (
            <p className="text-center text-xs text-text-muted">
              {formatNumber(active + 1)} / {formatNumber(media.length)}
              <span className="mx-2">•</span>
              {name}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
