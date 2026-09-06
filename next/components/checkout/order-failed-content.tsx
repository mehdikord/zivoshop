"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Order failed page content (PRD §27).
 * Shows error message, retry and back buttons.
 */
export function OrderFailedContent() {
  const router = useRouter();

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-50">
          <XCircle className="size-8 text-red-500" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-text sm:text-2xl">
          پرداخت ناموفق بود
        </h1>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          متأسفانه در فرآیند پرداخت خطایی رخ داد. لطفاً مجدداً تلاش کنید
          یا از درگاه پرداخت دیگری استفاده نمایید.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="gold"
          onClick={() => router.push("/checkout")}
        >
          <RefreshCw className="ms-1.5 size-4" aria-hidden />
          تلاش مجدد پرداخت
        </Button>
        <Button variant="outline" asChild>
          <Link href="/checkout">
            <ArrowRight className="ms-1.5 size-4" aria-hidden />
            بازگشت به تسویه حساب
          </Link>
        </Button>
      </div>
    </div>
  );
}
