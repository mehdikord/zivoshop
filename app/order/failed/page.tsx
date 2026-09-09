import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderFailedContent } from "@/components/checkout/order-failed-content";

export const metadata: Metadata = {
  title: "پرداخت ناموفق | زیوو",
};

export default function OrderFailedPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:py-16">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <OrderFailedContent />
        </Suspense>
      </div>
    </main>
  );
}