import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "سبد خرید | زیوو",
  description: "سبد خرید خود را مدیریت کنید و به تسویه حساب بروید.",
};

export default function CartPage() {
  return <CartPageClient />;
}
