import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutLayout } from "@/components/checkout/checkout-layout";

export const metadata: Metadata = {
  title: "تسویه حساب | زیوو",
  description: "مراحل تسویه حساب و پرداخت سفارش خود را تکمیل کنید.",
};

function CheckoutFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <Skeleton className="h-4 w-48 rounded-full" />
        <Skeleton className="mt-6 h-8 w-32 rounded-xl" />
        <div className="mt-8 flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutLayout />
    </Suspense>
  );
}
