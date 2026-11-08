"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBranding } from "@/components/layout/branding-provider";

type LogoProps = {
  /** "dark" = brown text on light surfaces, "light" = cream text on dark surfaces */
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const IMAGE_HEIGHT = {
  sm: "h-8 max-w-[120px]",
  md: "h-10 max-w-[160px]",
  lg: "h-14 max-w-[220px]",
} as const;

const WORDMARK = {
  sm: { fa: "text-lg", latin: "text-[9px]", gap: "gap-0" },
  md: { fa: "text-2xl", latin: "text-[10px]", gap: "gap-0" },
  lg: { fa: "text-4xl", latin: "text-sm", gap: "gap-1" },
} as const;

/**
 * Site logo. Renders the logo uploaded in «تنظیمات سایت» when one is set
 * (using the dark-surface variant for tone="light" if provided), and falls
 * back to the typographic «زیوو / ZIVO» wordmark otherwise.
 */
export function Logo({ tone = "dark", size = "md", className }: LogoProps) {
  const { siteName, logo, logoDark } = useBranding();
  const src = tone === "light" ? logoDark || logo : logo;
  const name = siteName || "زیوو";

  return (
    <Link
      href="/"
      aria-label={`${name} — صفحه اصلی`}
      className={cn(
        "group inline-flex flex-col items-center leading-none",
        className,
      )}
    >
      {src ? (
        // Plain <img>: logos may be SVG and have arbitrary aspect ratios.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn("w-auto object-contain", IMAGE_HEIGHT[size])}
          decoding="async"
        />
      ) : (
        <>
          <span
            className={cn(
              "font-display font-extrabold tracking-tight transition-colors",
              WORDMARK[size].fa,
              tone === "dark" ? "text-primary" : "text-background",
            )}
          >
            زیوو
          </span>
          <span
            className={cn(
              "font-display font-semibold tracking-[0.45em] transition-colors",
              WORDMARK[size].latin,
              WORDMARK[size].gap,
              tone === "dark" ? "text-gold-dark" : "text-gold",
            )}
          >
            ZIVO
          </span>
        </>
      )}
    </Link>
  );
}
