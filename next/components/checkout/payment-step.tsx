"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { provinceShippingFee, shippingCost } from "@/lib/cart";
import { useShipping } from "@/hooks/use-shipping";

/**
 * Step 5 — Payment simulation (PRD §27).
 * Mock: random success/fail after a delay, then redirect.
 */
export function PaymentStep() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const selectedId = useCheckoutStore((s) => s.selectedAddressId);
  const addresses = useCheckoutStore((s) => s.addresses);
  const selectedAddress = addresses.find((a) => a.id === selectedId);
  const { freeShippingThreshold, baseShippingFee, provinces } = useShipping();
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
    0,
  );
  const destinationFee = provinceShippingFee(
    selectedAddress?.provinceId,
    selectedAddress?.province,
    provinces,
    baseShippingFee,
  );
  const total = subtotal + shippingCost(subtotal, freeShippingThreshold, destinationFee);

  const handlePay = async () => {
    if (loading) return;
    setLoading(true);

    // Simulate payment gateway delay
    await new Promise((r) => setTimeout(r, 2000));

    // Mock: ~70% success, 30% fail
    const success = Math.random() < 0.7;

    if (!success) {
      router.push("/order/failed");
      return;
    }

    try {
      const subtotal = items.reduce(
        (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
        0,
      );
      const discountTotal = items.reduce(
        (sum, i) =>
          sum + Math.max(0, i.price - (i.discountPrice ?? i.price)) * i.quantity,
        0,
      );
      const destinationFee = provinceShippingFee(
        selectedAddress?.provinceId,
        selectedAddress?.province,
        provinces,
        baseShippingFee,
      );
      const shippingCostVal = shippingCost(
        subtotal,
        freeShippingThreshold,
        destinationFee,
      );
      const total = subtotal + shippingCostVal;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            unitPrice: i.price,
            unitDiscount: Math.max(0, i.price - (i.discountPrice ?? i.price)),
          })),
          subtotal,
          discountTotal,
          shippingCost: shippingCostVal,
          total,
          address: {
            receiverName: selectedAddress?.receiverName,
            receiverPhone: selectedAddress?.receiverPhone,
            province: selectedAddress?.province,
            city: selectedAddress?.city,
            postalCode: selectedAddress?.postalCode,
            fullAddress: selectedAddress?.fullAddress,
          },
          customerNote: useCheckoutStore.getState().notes,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.id) {
        useCartStore.getState().clearCart();
        if (typeof window !== "undefined") sessionStorage.setItem("zivo-order-placed", "1");
        router.push(`/order/success?id=${data.data.id}`);
      } else {
        setLoading(false);
        toast.error(data.message || "خطا در ثبت سفارش");
      }
    } catch {
      setLoading(false);
      toast.error("خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Payment summary card */}
      <div className="rounded-2xl border border-border/60 bg-surface p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-gold-light/50">
            <CreditCard className="size-5 text-gold-dark" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-bold text-text">پرداخت آنلاین</p>
            <p className="text-xs text-text-muted">پرداخت از طریق درگاه بانکی (شبیه‌سازی)</p>
          </div>
        </div>

        <div className="rounded-xl bg-surface-secondary/50 p-4">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>مبلغ قابل پرداخت</span>
            <span className="text-lg font-extrabold text-gold-dark tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <Shield className="size-3.5 text-green-600" aria-hidden />
          پرداخت امن و رمزنگاری‌شده
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <svg className="size-3.5 text-green-600" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          تضمین بازگشت وجه
        </div>
      </div>

      <Button
        variant="gold"
        className="h-12 w-full text-base"
        disabled={loading}
        onClick={handlePay}
      >
        {loading ? (
          <>
            <Loader2 className="ms-2 size-4 animate-spin" aria-hidden />
            در حال پردازش...
          </>
        ) : (
          `پرداخت ${formatPrice(total)}`
        )}
      </Button>

      <p className="text-center text-xs text-text-muted">
        با کلیک روی دکمه پرداخت، شرایط و قوانین فروشگاه را می‌پذیرید.
      </p>
    </div>
  );
}
