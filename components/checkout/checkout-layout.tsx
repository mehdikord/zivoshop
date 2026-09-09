"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { AddressStep } from "@/components/checkout/address-step";
import { OrderSummaryStep } from "@/components/checkout/order-summary-step";
import { OrderNotesStep } from "@/components/checkout/order-notes-step";
import { PaymentStep } from "@/components/checkout/payment-step";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";
import { EmptyCart } from "@/components/cart/empty-cart";

const crumbItems = [
  { label: "خانه", href: "/" as const },
  { label: "سبد خرید", href: "/cart" as const },
  { label: "تسویه حساب" },
];

/**
 * Checkout layout — 4-step flow orchestrator (Phase spec §6, PRD §23).
 * Step 1: Address, Step 2: Summary, Step 3: Notes, Step 4: Payment.
 */
export function CheckoutLayout() {
  const router = useRouter();
  const step = useCheckoutStore((s) => s.step);
  const setStep = useCheckoutStore((s) => s.setStep);
  const items = useCartStore((s) => s.items);

  const goNext = useCallback(() => {
    setStep(Math.min(step + 1, 4) as 1 | 2 | 3 | 4);
  }, [step, setStep]);

  const goBack = useCallback(() => {
    if (step === 1) {
      router.push("/cart");
    } else {
      setStep(Math.max(step - 1, 1) as 1 | 2 | 3 | 4);
    }
  }, [step, setStep, router]);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
          <EmptyCart />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <Breadcrumb items={crumbItems} />

        <h1 className="mt-6 text-xl font-extrabold text-text sm:text-2xl">
          تسویه حساب
        </h1>

        <div className="mt-6">
          <CheckoutStepper current={step} onStepClick={(s) => setStep(s as 1 | 2 | 3 | 4)} />
        </div>

        <div className="mt-8">
          {step === 1 && <AddressStep onNext={goNext} />}
          {step === 2 && <OrderSummaryStep onNext={goNext} />}
          {step === 3 && <OrderNotesStep onNext={goNext} />}
          {step === 4 && <PaymentStep />}
        </div>

        {/* Back link */}
        {step < 4 ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              ← {step === 1 ? "بازگشت به سبد خرید" : "بازگشت به مرحله قبل"}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
