"use client";

import { useEffect, useRef, useState } from "react";
import { Headset, RotateCcw, Truck } from "lucide-react";
import { formatCompactNumber } from "@/lib/format";
import { toEnglishDigits } from "@/lib/utils";

interface AnnouncementConfig {
  contactPhone: string;
  freeShippingThreshold: number;
}

const DEFAULT_CONFIG: AnnouncementConfig = {
  contactPhone: "021-26290000",
  freeShippingThreshold: 2_000_000,
};

function digitsOnly(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}

/**
 * Slim announcement bar above the header. Rotates through the messages,
 * pauses on hover/focus and honors prefers-reduced-motion. Phone number and
 * the free-shipping threshold come from the admin site/shipping settings.
 */
export function AnnouncementBar() {
  const [config, setConfig] = useState<AnnouncementConfig>(DEFAULT_CONFIG);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useRef(false);

  const { contactPhone, freeShippingThreshold } = config;
  const messages = [
    {
      icon: Truck,
      text: `ارسال رایگان برای سفارش‌های بالای ${formatCompactNumber(freeShippingThreshold)} تومان`,
    },
    { icon: RotateCcw, text: "تا ۷ روز فرصت مرجوعی کالا" },
    { icon: Headset, text: `پشتیبانی ۲۴ ساعته — ${contactPhone}` },
  ];

  const phoneDigits = digitsOnly(contactPhone);
  const telHref = phoneDigits ? `tel:${phoneDigits}` : undefined;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/announcement-settings")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.success) return;
        const phone: string =
          typeof data.data?.contactPhone === "string" &&
          data.data.contactPhone.trim()
            ? data.data.contactPhone
            : DEFAULT_CONFIG.contactPhone;
        const threshold = Number(data.data?.freeShippingThreshold);
        setConfig({
          contactPhone: phone,
          freeShippingThreshold:
            Number.isFinite(threshold) && threshold > 0
              ? threshold
              : DEFAULT_CONFIG.freeShippingThreshold,
        });
      })
      .catch(() => {
        // Keep defaults when the settings endpoint is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [paused, messages.length]);

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
              {telHref ? (
                <a
                  href={telHref}
                  className="text-gold underline-offset-2 hover:underline"
                >
                  جزئیات بیشتر
                </a>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
