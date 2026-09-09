"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Route } from "next";
import { Check, Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/sections/section";

type SpecialOfferData = {
  eyebrow: string | null;
  title: string;
  description: string | null;
  code: string;
  ctaLabel: string | null;
  href: string | null;
  image: string;
};

/** «پیشنهاد ویژه» panel (PRD §10, item 12) with a copyable promo code. */
export function SpecialOffer() {
  const [offer, setOffer] = useState<SpecialOfferData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/banners?position=special_offer")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const b = json.data[0];
          setOffer({
            eyebrow: b.eyebrow,
            title: b.title,
            description: b.subtitle,
            code: "",
            ctaLabel: b.ctaLabel,
            href: b.href,
            image: b.image,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!offer) return null;

  const copyCode = async () => {
    if (!offer.code) return;
    try {
      await navigator.clipboard.writeText(offer.code);
    } catch {
      // Clipboard API unavailable — fall back to a text selection hint.
    }
    setCopied(true);
    toast.success("کد تخفیف کپی شد");
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Section>
      <div className="overflow-hidden rounded-3xl border border-gold-dark/20 bg-gradient-to-l from-gold-light/60 via-surface to-surface">
        <div className="grid lg:grid-cols-2">
          <div className="order-2 flex flex-col justify-center p-6 sm:p-10 lg:order-1 lg:p-14">
            {offer.eyebrow && (
              <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-gold-dark">
                <Tag className="size-4" aria-hidden />
                {offer.eyebrow}
              </p>
            )}
            <h2 className="mt-3 text-2xl font-extrabold leading-snug text-primary sm:text-4xl">
              {offer.title}
            </h2>
            {offer.description && (
              <p className="mt-4 max-w-md text-sm leading-7 text-text-secondary">
                {offer.description}
              </p>
            )}

            {offer.code ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <code
                  dir="ltr"
                  className="rounded-xl border border-dashed border-gold-dark/50 bg-surface px-4 py-2.5 text-base font-extrabold tracking-[0.2em] text-gold-dark"
                >
                  {offer.code}
                </code>
                <Button
                  variant="outline-gold"
                  size="sm"
                  onClick={copyCode}
                  aria-label="کپی کردن کد تخفیف"
                >
                  {copied ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Copy className="size-4" aria-hidden />
                  )}
                  {copied ? "کپی شد" : "کپی کد"}
                </Button>
              </div>
            ) : null}

            <div className="mt-8">
              {offer.href && offer.ctaLabel && (
                <Button asChild>
                  <Link href={offer.href as Route}>{offer.ctaLabel}</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative order-1 min-h-[260px] lg:order-2 lg:min-h-[420px]">
            <Image
              src={offer.image}
              alt="پیشنهاد ویژه فروشگاه زیوو"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text/30 to-transparent lg:bg-gradient-to-r" />
          </div>
        </div>
      </div>
    </Section>
  );
}
