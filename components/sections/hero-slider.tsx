"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Route } from "next";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50;
const TRANSITION_DURATION = 700;

type HeroSlide = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  href: string | null;
  image: string;
  align: "start" | "center";
};

type SideBanner = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  href: string | null;
  image: string;
  align: "start" | "center";
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HeroSliderSkeleton() {
  return (
    <section className="relative isolate overflow-hidden bg-surface" aria-busy="true">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Main slider skeleton - 8 cols */}
        <div className="lg:col-span-8 relative h-[500px] min-h-[400px] sm:h-[520px] lg:h-[560px] animate-pulse bg-gradient-to-b from-surface-secondary to-surface rounded-3xl" />
        {/* Side banners skeleton - 4 cols */}
        <div className="lg:col-span-4 grid gap-4">
          <div className="relative h-[240px] min-h-[190px] animate-pulse bg-gradient-to-b from-surface-secondary to-surface rounded-2xl" />
          <div className="relative h-[240px] min-h-[190px] animate-pulse bg-gradient-to-b from-surface-secondary to-surface rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

/**
 * Hero Section with Slider + Side Banners
 * - Main slider takes 2/3 width on desktop, full width on mobile
 * - Two side banners stacked on right (1/3 width on desktop)
 * - Mobile: slider full width, side banners below as cards
 */
export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [sideBanners, setSideBanners] = useState<SideBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [heroRes, sideRes] = await Promise.all([
          fetch("/api/banners?position=hero"),
          fetch("/api/banners?position=sidebar"),
        ]);

        const [heroJson, sideJson] = await Promise.all([
          heroRes.json(),
          sideRes.json(),
        ]);

        if (cancelled) return;

        if (heroJson.success) {
          const heroSlides = heroJson.data
            .filter((b: Record<string, string>) => b.position === "hero")
            .map((b: Record<string, string>) => ({
              id: b.id,
              eyebrow: b.eyebrow,
              title: b.title,
              subtitle: b.subtitle,
              ctaLabel: b.ctaLabel,
              href: b.href,
              image: b.image,
              align: b.align ?? "start",
            }));
          setSlides(heroSlides);
        }

        if (sideJson.success) {
          const banners = sideJson.data
            .filter((b: Record<string, string>) => b.isActive)
            .slice(0, 2)
            .map((b: Record<string, string>) => ({
              id: b.id,
              eyebrow: b.eyebrow,
              title: b.title,
              subtitle: b.subtitle,
              ctaLabel: b.ctaLabel,
              href: b.href,
              image: b.image,
              align: b.align ?? "center",
            }));
          setSideBanners(banners);
        }
      } catch (e) {
        console.error("Hero slider fetch error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const count = slides.length;
  const paused = userPaused || hoverPaused || reducedMotion || count <= 1;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % count),
    [count],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count === 0) return;
    const timer = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, next, count]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    touchStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setIsDragging(true);
  };

  const onPointerMove = () => {
    if (!touchStart.current || !isDragging) return;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!touchStart.current) return;
    const dx = e.clientX - touchStart.current.x;
    const dy = e.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;
    touchStart.current = null;
    setIsDragging(false);

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;
    if (dt > 500) return;

    if (dx > 0) prev();
    else next();
  };

  const onPointerCancel = () => {
    touchStart.current = null;
    setIsDragging(false);
  };

  const goToSlide = useCallback((i: number) => {
    setIndex(i);
    setUserPaused(false);
  }, []);

  if (loading) return <HeroSliderSkeleton />;
  if (count === 0) return null;

  return (
    <section
      role="region"
      aria-roledescription="اسلایدر"
      aria-label="پیشنهادهای ویژه زیوو"
      className="relative isolate overflow-hidden bg-surface py-6 lg:py-8"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={() => setHoverPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerCancel}
      style={{ touchAction: "pan-y" }}
    >
      {/* Main Grid Layout */}
      <div className="grid gap-4 lg:grid-cols-12 items-stretch w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Slider - 8 cols on desktop, full width on mobile */}
        <div className="lg:col-span-8">
          <div className="relative h-full min-h-[400px] sm:min-h-[520px] lg:min-h-[560px] rounded-3xl overflow-hidden">
            {slides.map((slide, i) => {
              const active = i === index;
              const prevSlide = i === (index - 1 + count) % count;
              const nextSlide = i === (index + 1) % count;
              const isExiting = !active && (prevSlide || nextSlide);

              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="اسلاید"
                  aria-label={`اسلاید ${i + 1} از ${count}`}
                  aria-hidden={!active}
                  className={cn(
                    "absolute inset-0 rounded-3xl overflow-hidden",
                    "motion-safe:transition-[opacity,transform,filter]",
                    `motion-safe:duration-${TRANSITION_DURATION}`,
                    "motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
                    active
                      ? "opacity-100 scale-100 filter-none z-10 pointer-events-auto"
                      : isExiting
                      ? "opacity-0 scale-[0.98] blur-sm z-5 pointer-events-none"
                      : "opacity-0 scale-100 z-0 pointer-events-none",
                  )}
                  style={{ willChange: "opacity, transform, filter" }}
                >
                  {/* Image Layer */}
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 800px"
                      className={cn(
                        "object-cover transition-transform duration-[1200ms] ease-out",
                        active ? "scale-100" : "scale-[1.04]",
                      )}
                      quality={90}
                    />
                    {/* Subtle vignette for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    {/* Side gradients for edge blending */}
                    <div className="absolute inset-y-0 start-0 w-1/3 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 end-0 w-1/3 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* Content Overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center",
                      slide.align === "center" ? "justify-center" : "justify-start",
                    )}
                  >
                    <div className="mx-auto w-full max-w-5xl px-6 sm:px-8">
                      <div
                        className={cn(
                          "max-w-2xl sm:max-w-3xl",
                          slide.align === "center" ? "mx-auto text-center" : "",
                        )}
                      >
                        {/* Eyebrow / Category Tag */}
                        {slide.eyebrow && (
                          <div className="inline-flex items-center gap-2 mb-4">
                            <span className="h-px w-10 bg-gold-light/80" aria-hidden="true" />
                            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-gold-light uppercase">
                              {slide.eyebrow}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h1
                          className={cn(
                            "font-serif font-extrabold leading-[1.1] tracking-tight text-white",
                            "motion-safe:transition-[opacity,transform]",
                            "motion-safe:duration-500",
                            "motion-safe:ease-out",
                            active
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-4",
                            slide.align === "center" ? "mx-auto text-center" : "",
                          )}
                          style={{
                            fontFamily: "'Cormorant', 'Georgia', serif",
                            fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
                            lineHeight: "1.1",
                          }}
                        >
                          {slide.title}
                        </h1>

                        {/* Subtitle */}
                        {slide.subtitle && (
                          <p
                            className={cn(
                              "mt-3 font-normal leading-relaxed text-white/90 max-w-md",
                              "motion-safe:transition-[opacity,transform]",
                              "motion-safe:duration-500",
                              "motion-safe:delay-100",
                              "motion-safe:ease-out",
                              active
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4",
                              slide.align === "center" ? "mx-auto text-center" : "",
                            )}
                            style={{ fontFamily: "'Montserrat', 'system-ui', sans-serif", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}
                          >
                            {slide.subtitle}
                          </p>
                        )}

                        {/* CTA Button */}
                        {slide.href && slide.ctaLabel && (
                          <div
                            className={cn(
                              "mt-6",
                              "motion-safe:transition-[opacity,transform]",
                              "motion-safe:duration-500",
                              "motion-safe:delay-200",
                              "motion-safe:ease-out",
                              active
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4",
                              slide.align === "center" ? "flex justify-center" : "",
                            )}
                          >
                            <Button
                              variant="gold"
                              size="lg"
                              asChild
                              className="min-w-[160px] px-6 py-3 text-sm font-semibold tracking-wide shadow-gold hover:shadow-gold/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Link
                                href={slide.href as Route}
                                className="flex items-center gap-2"
                              >
                                {slide.ctaLabel}
                                <ChevronLeft className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows - Desktop only */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:px-2 pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 -z-10">
            <button
              onClick={prev}
              aria-label="اسلاید قبلی"
              className={cn(
                "pointer-events-auto flex size-12 items-center justify-center rounded-full",
                "bg-white/10 backdrop-blur-md border border-white/20",
                "text-white transition-all duration-300",
                "hover:bg-white/20 hover:scale-105",
                "focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:outline-none",
                "active:scale-95",
                "group"
              )}
            >
              <ChevronRight className="size-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="اسلاید بعدی"
              className={cn(
                "pointer-events-auto flex size-12 items-center justify-center rounded-full",
                "bg-white/10 backdrop-blur-md border border-white/20",
                "text-white transition-all duration-300",
                "hover:bg-white/20 hover:scale-105",
                "focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:outline-none",
                "active:scale-95",
                "group"
              )}
            >
              <ChevronLeft className="size-5 rtl:rotate-180 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
              <span className="flex items-center animate-ping">
                <ChevronLeft className="size-4" aria-hidden="true" />
              </span>
              <span>کشیده برای حرکت</span>
              <span className="flex items-center animate-ping" style={{ animationDelay: '300ms' }}>
                <ChevronRight className="size-4" aria-hidden="true" />
              </span>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="ناوبری اسلایدها">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(i)}
                  role="tab"
                  aria-label={`برو به اسلاید ${i + 1}`}
                  aria-selected={i === index}
                  aria-current={i === index ? "true" : "false"}
                  className={cn(
                    "relative flex h-2 w-2 rounded-full transition-all duration-500 ease-out",
                    "focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                    i === index
                      ? "w-7 bg-gold-light shadow-[0_0_12px_rgba(238,205,161,0.6)]"
                      : "bg-white/40 hover:bg-white/70",
                  )}
                >
                  <span className="sr-only">اسلاید {i + 1}</span>
                </button>
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setUserPaused((p) => !p)}
              aria-label={paused ? "پخش اسلایدها" : "توقف اسلایدها"}
              aria-pressed={paused}
              className={cn(
                "ml-2 flex size-10 items-center justify-center rounded-full",
                "bg-white/10 backdrop-blur-md border border-white/20",
                "text-white transition-all duration-300",
                "hover:bg-white/20 hover:scale-105",
                "focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:outline-none",
                "active:scale-95",
              )}
            >
              {paused ? (
                <Play className="size-4.5 translate-x-px" aria-hidden="true" />
              ) : (
                <Pause className="size-4.5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Slide Counter - Mobile */}
          <div className="lg:hidden absolute bottom-14 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
            {index + 1} / {count}
          </div>
        </div>

        {/* Side Banners - 4 cols on desktop, stacked below on mobile */}
        <div className="lg:col-span-4 grid gap-4 lg:grid-rows-[1fr_1fr] h-full">
          {sideBanners.map((banner) => (
            <SideBannerCard key={banner.id} banner={banner} />
          ))}
          {/* Fallback if no side banners */}
          {sideBanners.length === 0 && (
            <>
              <SideBannerPlaceholder />
              <SideBannerPlaceholder />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SideBannerCard({ banner }: { banner: SideBanner }) {
  return (
    <Link
      href={(banner.href ?? "/") as Route}
      className="relative flex h-full min-h-[220px] sm:min-h-[240px] overflow-hidden rounded-2xl group focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:outline-none"
      aria-label={banner.title}
    >
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        sizes="(max-width: 1024px) 50vw, 320px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-end p-5 sm:p-6">
        <div className="w-full">
          {banner.eyebrow && (
            <p className="text-xs font-bold tracking-[0.2em] text-gold-light mb-1.5">
              {banner.eyebrow}
            </p>
          )}
          <h3 className="font-serif font-bold leading-tight text-white mb-2" style={{ fontFamily: "'Cormorant', 'Georgia', serif", fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)" }}>
            {banner.title}
          </h3>
          {banner.subtitle && (
            <p className="text-sm leading-6 text-white/80 line-clamp-2 mb-3 max-w-xs">
              {banner.subtitle}
            </p>
          )}
          {banner.ctaLabel && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-gold-light transition-colors">
              {banner.ctaLabel}
              <ChevronLeft className="size-3.5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SideBannerPlaceholder() {
  return (
    <div className="relative flex h-full min-h-[220px] sm:min-h-[240px] overflow-hidden rounded-2xl bg-gradient-to-br from-surface-secondary to-surface">
      <div className="absolute inset-0 flex items-center justify-center text-text-muted">
        <span className="text-sm">بنر تبلیغاتی</span>
      </div>
    </div>
  );
}