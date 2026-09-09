import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Generic empty-state (PRD §41) used across the storefront:
 * empty cart, empty wishlist, no search results, etc.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-gold-light/60">
          <Icon
            className="size-7 text-gold-dark"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      ) : null}
      <h3 className="text-base font-bold text-text sm:text-lg">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-7 text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
