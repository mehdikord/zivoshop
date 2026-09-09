import { RefreshCw, Home, ArrowRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Primary action (e.g., retry) */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "gold" | "outline" | "destructive";
    icon?: React.ReactNode;
  };
  /** Secondary action (e.g., go home) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "gold" | "outline" | "destructive";
    icon?: React.ReactNode;
  };
  /** Custom icon for the error state */
  icon?: React.ReactNode;
  /** Additional className */
  className?: string;
};

/**
 * Generic error state (PRD §42) used across the storefront:
 * failed product fetch, checkout errors, payment failures, login errors, etc.
 */
export function ErrorState({
  title = "خطایی رخ داد",
  description = "متأسفانه در بارگذاری اطلاعات مشکلی پیش آمد. لطفاً مجدداً تلاش کنید.",
  primaryAction,
  secondaryAction,
  icon,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-destructive-light/60">
          {icon}
        </div>
      ) : (
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-destructive-light/60">
          <XCircle className="size-8 text-destructive" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-bold text-text sm:text-lg">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-7 text-text-secondary">
          {description}
        </p>
      ) : null}
      {(primaryAction || secondaryAction) ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {primaryAction ? (
            <Button
              variant={primaryAction.variant ?? "gold"}
              onClick={primaryAction.onClick}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              variant={secondaryAction.variant ?? "outline"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Common error state presets */
export const ErrorStatePresets = {
  /** Product fetch error */
  products: (retry: () => void) => (
    <ErrorState
      title="محصولات یافت نشد"
      description="در دریافت لیست محصولات خطایی رخ داد. اتصال اینترنت خود را بررسی کنید و دوباره تلاش نمایید."
      primaryAction={{ label: "تلاش مجدد", onClick: retry, icon: <RefreshCw className="ml-1.5 size-4" /> }}
      secondaryAction={{ label: "بازگشت به خانه", onClick: () => window.location.href = "/", icon: <Home className="ml-1.5 size-4" /> }}
    />
  ),

  /** Checkout error */
  checkout: (retry: () => void) => (
    <ErrorState
      title="خطا در تسویه حساب"
      description="در پردازش سفارش شما مشکلی پیش آمد. لطفاً اطلاعات خود را بررسی کرده و مجدداً تلاش کنید."
      primaryAction={{ label: "تلاش مجدد", onClick: retry, icon: <RefreshCw className="ml-1.5 size-4" /> }}
      secondaryAction={{ label: "بازگشت به سبد", onClick: () => window.location.href = "/cart", icon: <ArrowRight className="ml-1.5 size-4" /> }}
    />
  ),

  /** Payment error */
  payment: (retry: () => void) => (
    <ErrorState
      title="پرداخت ناموفق بود"
      description="متأسفانه در فرآیند پرداخت خطایی رخ داد. لطفاً مجدداً تلاش کنید یا از درگاه پرداخت دیگری استفاده نمایید."
      primaryAction={{ label: "تلاش مجدد پرداخت", onClick: retry, icon: <RefreshCw className="ml-1.5 size-4" /> }}
      secondaryAction={{ label: "بازگشت به تسویه حساب", onClick: () => window.location.href = "/checkout", icon: <ArrowRight className="ml-1.5 size-4" /> }}
    />
  ),

  /** Login error */
  login: (retry: () => void) => (
    <ErrorState
      title="ورود ناموفق"
      description="شماره موبایل یا گذرواژه نادرست است. لطفاً دوباره تلاش کنید."
      primaryAction={{ label: "تلاش مجدد", onClick: retry, icon: <RefreshCw className="ml-1.5 size-4" /> }}
    />
  ),

  /** Cart add error */
  cart: (retry: () => void) => (
    <ErrorState
      title="افزودن به سبد ناموفق بود"
      description="در افزودن محصول به سبد خرید خطایی رخ داد. لطفاً مجدداً تلاش کنید."
      primaryAction={{ label: "تلاش مجدد", onClick: retry, icon: <RefreshCw className="ml-1.5 size-4" /> }}
    />
  ),

  /** Generic server error */
  server: (retry: () => void) => (
    <ErrorState
      title="خطای سرور"
      description="در ارتباط با سرور مشکلی پیش آمد. تیم فنی ما در جریان است. لطفاً چند دقیقه دیگر تلاش کنید."
      primaryAction={{ label: "تلاش مجدد", onClick: retry, icon: <RefreshCw className="ml-1.5 size-4" /> }}
    />
  ),
};