"use client";

import { useEffect, useRef, useState } from "react";
import { Headset, RotateCcw, Truck } from "lucide-react";

const messages = [
  { icon: Truck, text: "ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان" },
  { icon: RotateCcw, text: "تا ۷ روز فرصت مرجوعی کالا" },
  { icon: Headset, text: "پشتیبانی ۲۴ ساعته — ۰۲۱-۲۶۲۹۰۰۰۰" },
];

/**
 * Slim announcement bar above the header. Rotates through the messages,
 * pauses on hover/focus and honors prefers-reduced-motion.
 */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion.current) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [paused]);

  const current = messages[index];

  return (
    <div
      role="region"
      aria-label="اطلاعیه‌های فروشگاه"
      className="bg-primary text-primary-foreground"
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {current ? (
          <div
            key={index}
            className="flex items-center gap-2 text-xs font-medium animate-zivo-fade-in sm:text-[13px]"
            aria-live="polite"
          >
            <current.icon className="size-4 shrink-0 text-gold" aria-hidden />
            <span>{current.text}</span>
            <span className="ms-1 hidden sm:inline">
              <span className="me-2 text-gold/60">|</span>
              <a
                href="tel:02126290000"
                className="text-gold underline-offset-2 hover:underline"
              >
                جزئیات بیشتر
              </a>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
