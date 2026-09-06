import type { Metadata } from "next";
import { OrderFailedContent } from "@/components/checkout/order-failed-content";

export const metadata: Metadata = {
  title: "پرداخت ناموفق | زیوو",
};

export default function OrderFailedPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:py-16">
        <OrderFailedContent />
      </div>
    </main>
  );
}
