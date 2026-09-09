"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";

/**
 * Empty cart state (PRD §41, §22) — shown when the cart has no items.
 */
export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="سبد خرید شما خالی است"
      description="محصولات مورد علاقه خود را به سبد اضافه کنید و خرید لذت‌بخشی را تجربه نمایید."
      action={
        <Button variant="gold" asChild>
          <Link href="/products">
            مشاهده محصولات
          </Link>
        </Button>
      }
    />
  );
}
