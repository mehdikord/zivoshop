import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Shared discount badge (PRD §14/§19) — used on the ProductCard and PDP.
 */
export function DiscountBadge({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <Badge
      variant="destructive"
      className={cn("px-2.5 py-1 text-[11px]", className)}
    >
      {formatPercent(percent)}
    </Badge>
  );
}
