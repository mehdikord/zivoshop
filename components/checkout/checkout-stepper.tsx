"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "آدرس ارسال", key: 1 },
  { label: "خلاصه سفارش", key: 2 },
  { label: "توضیحات", key: 3 },
  { label: "پرداخت", key: 4 },
] as const;

/**
 * Visual checkout stepper (Phase spec §6).
 * Horizontal on desktop, compact on mobile.
 */
export function CheckoutStepper({
  current,
  onStepClick,
}: {
  current: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <nav aria-label="مراحل تسویه حساب" className="w-full">
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const isCompleted = current > step.key;
          const isActive = current === step.key;
          const isClickable = isCompleted;

          return (
            <li
              key={step.key}
              className={cn("flex flex-1 items-center", i < STEPS.length - 1 && "relative")}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  isClickable && onStepClick && "cursor-pointer",
                )}
                onClick={() => isClickable && onStepClick?.(step.key)}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onStepClick?.(step.key);
                  }
                }}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                    isCompleted && "bg-gold-dark text-background",
                    isActive && "bg-gold-dark text-background ring-4 ring-gold-dark/20",
                    !isActive && !isCompleted && "border-2 border-border text-text-muted",
                  )}
                >
                  {isCompleted ? <Check className="size-4" aria-hidden /> : step.key}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-semibold sm:block",
                    isActive ? "text-text" : "text-text-muted",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 ? (
                <div className="ms-2 hidden h-px flex-1 bg-border sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>
      {/* Mobile: show current step label below */}
      <p className="mt-2 text-center text-xs text-text-muted sm:hidden">
        مرحله {current} از {STEPS.length}: {STEPS[current - 1]?.label}
      </p>
    </nav>
  );
}
