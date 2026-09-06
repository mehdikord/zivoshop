import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderSuccessContent } from "@/components/checkout/order-success-content";

export const metadata: Metadata = {
  title: "سفارش موفق | زیوو",
};

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:py-16">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <OrderSuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
