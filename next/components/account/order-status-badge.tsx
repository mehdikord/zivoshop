import {
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  processing: {
    label: "در حال آماده‌سازی",
    icon: Clock,
    className: "bg-info-light text-info",
  },
  shipped: {
    label: "ارسال شده",
    icon: Truck,
    className: "bg-warning-light text-warning",
  },
  delivered: {
    label: "تحویل داده شده",
    icon: CheckCircle,
    className: "bg-success-light text-success",
  },
  cancelled: {
    label: "لغو شده",
    icon: XCircle,
    className: "bg-destructive-light text-destructive",
  },
  returned: {
    label: "مرجوع شده",
    icon: RotateCcw,
    className: "bg-warning-light text-warning",
  },
};

/**
 * Order status badge — semantic colors, distinct from brand palette (PRD §25, §30).
 */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {config.label}
    </Badge>
  );
}
