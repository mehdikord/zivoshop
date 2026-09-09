"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCheckoutStore } from "@/stores/checkout-store";

/**
 * Step 3 — Customer notes for the order (PRD §23).
 */
export function OrderNotesStep({ onNext }: { onNext: () => void }) {
  const notes = useCheckoutStore((s) => s.notes);
  const setNotes = useCheckoutStore((s) => s.setNotes);

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="order-notes" className="text-sm font-semibold text-text">
          توضیحات سفارش (اختیاری)
        </Label>
        <p className="mt-1 text-xs text-text-muted">
          موارد خاص مانند ساعت تحویل، رنگ بسته‌بندی و غیره
        </p>
        <textarea
          id="order-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="توضیحات خود را اینجا بنویسید..."
          className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="gold" onClick={onNext}>
          ادامه به پرداخت
        </Button>
      </div>
    </div>
  );
}
