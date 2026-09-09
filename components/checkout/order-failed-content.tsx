"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { XCircle, RefreshCw, Loader2, Home, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Order failed page content.
 * Shows error message, retry payment for the existing pending order
 * (when orderId is present) and navigation buttons.
 */
export function OrderFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(false);

  const message =
    reason === "not_found"
      ? "پرداخت یافت نشد یا اطلاعات پرداخت ناقص است. لطفاً مجدداً اقدام کنید."
      : reason === "verify_failed"
        ? "پرداخت شما توسط درگاه بانکی تأیید نشد. لطفاً مجدداً تلاش کنید."
        : "متأسفانه در فرآیند پرداخت خطایی رخ داد. لطفاً مجدداً تلاش کنید.";

  const handleRetry = async () => {
    if (!orderId || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payment/zarinpal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setLoading(false);
        toast.error(data.message || "خطا در اتصال به درگاه پرداخت");
      }
    } catch {
      setLoading(false);
      toast.error("خطا در پردازش. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-50">
          <XCircle className="size-8 text-red-500" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-text sm:text-2xl">
          پرداخت ناموفق بود
        </h1>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">{message}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderId ? (
          <Button
            variant="gold"
            disabled={loading}
            onClick={handleRetry}
          >
            {loading ? (
              <>
                <Loader2 className="ms-1.5 size-4 animate-spin" aria-hidden />
                در حال اتصال به درگاه...
              </>
            ) : (
              <>
                <RefreshCw className="ms-1.5 size-4" aria-hidden />
                تلاش مجدد پرداخت
              </>
            )}
          </Button>
        ) : (
          <Button variant="gold" onClick={() => router.push("/checkout")}>
            <RefreshCw className="ms-1.5 size-4" aria-hidden />
            تلاش مجدد پرداخت
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="ms-1.5 size-4" aria-hidden />
            بازگشت به صفحه اصلی
          </Link>
        </Button>
        {orderId ? (
          <Button variant="ghost" asChild>
            <Link href={`/account/orders/${orderId}`}>
              <ArrowRight className="ms-1.5 size-4" aria-hidden />
              مشاهده سفارش
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}