"use client";

import { useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Address } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Saved address card — shows address details with select/delete (PRD §24).
 */
export function AddressCard({
  address,
  selected,
  onSelect,
  onDelete,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!onDelete) {
    return (
      <div
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 p-4 transition-all",
          selected
            ? "border-gold-dark bg-gold-light/30"
            : "border-border hover:border-gold-dark/40",
        )}
        onClick={onSelect}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                selected ? "bg-gold-dark text-background" : "bg-surface-secondary text-text-muted",
              )}
            >
              <MapPin className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-text">{address.title}</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {address.fullAddress}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {address.city}، {address.province}
                {address.postalCode ? ` — کدپستی: ${address.postalCode}` : ""}
              </p>
              {address.receiverName ? (
                <p className="mt-1 text-xs text-text-muted">
                  گیرنده: {address.receiverName}
                  {address.receiverPhone ? ` — ${address.receiverPhone}` : ""}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 p-4 transition-all",
          selected
            ? "border-gold-dark bg-gold-light/30"
            : "border-border hover:border-gold-dark/40",
        )}
        onClick={onSelect}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                selected ? "bg-gold-dark text-background" : "bg-surface-secondary text-text-muted",
              )}
            >
              <MapPin className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-text">{address.title}</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {address.fullAddress}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {address.city}، {address.province}
                {address.postalCode ? ` — کدپستی: ${address.postalCode}` : ""}
              </p>
              {address.receiverName ? (
                <p className="mt-1 text-xs text-text-muted">
                  گیرنده: {address.receiverName}
                  {address.receiverPhone ? ` — ${address.receiverPhone}` : ""}
                </p>
              ) : null}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-text-muted hover:text-red-500"
            aria-label={`حذف آدرس ${address.title}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>حذف آدرس</DialogTitle>
          <DialogDescription>
            آیا مطمئن هستید که می‌خواهید آدرس «{address.title}» حذف شود؟ این کار غیرقابل بازگشت است.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={() => { onDelete(); setOpen(false); }}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
