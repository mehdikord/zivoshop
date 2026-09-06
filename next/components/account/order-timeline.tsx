import { CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STEPS = [
  { status: "processing" as const, label: "آماده‌سازی", icon: Clock },
  { status: "shipped" as const, label: "ارسال", icon: Truck },
  { status: "delivered" as const, label: "تحویل", icon: CheckCircle },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  processing: 0,
  shipped: 1,
  delivered: 2,
  cancelled: -1,
  returned: -1,
};

/**
 * Visual order timeline — distinguishes completed vs pending steps (PRD §31).
 * Shows a vertical step progress on all screens.
 */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  const isFailed = status === "cancelled" || status === "returned";
  const currentIdx = STATUS_ORDER[status];

  return (
    <div className="relative">
      {isFailed ? (
        /* Cancelled / Returned: single highlighted step */
        <div className="flex items-center gap-4 rounded-2xl bg-destructive-light px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <XCircle className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-destructive">
              {status === "cancelled" ? "سفارش لغو شده" : "سفارش مرجوع شده"}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {status === "cancelled"
                ? "این سفارش توسط شما لغو شده است"
                : "این سفارش مرجوع شده است"}
            </p>
          </div>
        </div>
      ) : (
        /* Normal flow: 3-step vertical timeline */
        <div className="space-y-0">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={step.status} className="flex gap-4">
                {/* Line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isCompleted
                        ? "border-success bg-success text-white"
                        : isCurrent
                          ? "border-gold-dark bg-gold text-primary"
                          : "border-border bg-surface text-text-muted",
                    )}
                  >
                    <StepIcon className="size-4" />
                  </div>
                  {idx < STEPS.length - 1 ? (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-6 my-1",
                        isCompleted ? "bg-success" : "bg-border",
                      )}
                    />
                  ) : null}
                </div>

                {/* Text */}
                <div className="pb-6 pt-1.5">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isCompleted || isCurrent ? "text-text" : "text-text-muted",
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent ? (
                    <p className="mt-0.5 text-xs text-gold-dark">
                      در حال پردازش
                    </p>
                  ) : isCompleted ? (
                    <p className="mt-0.5 text-xs text-success">
                      تکمیل شده
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-text-muted">
                      در انتظار
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
