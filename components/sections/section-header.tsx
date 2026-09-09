import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: Route;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-bold tracking-wide text-gold-dark">
          {eyebrow}
        </p>
      ) : null}
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-x-6 gap-y-3",
          align === "center" && "justify-center",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-xl text-sm leading-7 text-text-secondary">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="group inline-flex shrink-0 items-center gap-1.5 border-b border-gold-dark/30 pb-0.5 text-sm font-semibold text-primary transition-colors hover:border-gold-dark hover:text-gold-dark"
          >
            {actionLabel}
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
