import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** "dark" = brown text on light surfaces, "light" = cream text on dark surfaces */
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Zivo wordmark — typographic logo. Since the brand has no logo asset yet,
 * the wordmark carries the identity: «زیوو» in Vazirmatn 800 with a
 * letter-spaced latin "ZIVO" accent underneath.
 */
export function Logo({ tone = "dark", size = "md", className }: LogoProps) {
  const sizes = {
    sm: { fa: "text-lg", latin: "text-[9px]", gap: "gap-0" },
    md: { fa: "text-2xl", latin: "text-[10px]", gap: "gap-0" },
    lg: { fa: "text-4xl", latin: "text-sm", gap: "gap-1" },
  } as const;

  return (
    <Link
      href="/"
      aria-label="زیوو — صفحه اصلی"
      className={cn(
        "group inline-flex flex-col items-center leading-none",
        className,
      )}
    >
      <span
        className={cn(
          "font-display font-extrabold tracking-tight transition-colors",
          sizes[size].fa,
          tone === "dark" ? "text-primary" : "text-background",
        )}
      >
        زیوو
      </span>
      <span
        className={cn(
          "font-display font-semibold tracking-[0.45em] transition-colors",
          sizes[size].latin,
          sizes[size].gap,
          tone === "dark" ? "text-gold-dark" : "text-gold",
        )}
      >
        ZIVO
      </span>
    </Link>
  );
}
