"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/components/checkout/address-card";
import { AddressForm } from "@/components/checkout/address-form";
import { EmptyState } from "@/components/feedback/empty-state";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useAuth } from "@/hooks/use-auth";

/**
 * Step 1 — Address selection and creation (PRD §23, §24).
 * Shows saved addresses + option to create new one.
 */
export function AddressStep({
  onNext,
}: {
  onNext: () => void;
}) {
  const addresses = useCheckoutStore((s) => s.addresses);
  const selectedId = useCheckoutStore((s) => s.selectedAddressId);
  const selectAddress = useCheckoutStore((s) => s.selectAddress);
  const addAddress = useCheckoutStore((s) => s.addAddress);
  const removeAddress = useCheckoutStore((s) => s.removeAddress);
  const loadAddresses = useCheckoutStore((s) => s.loadAddresses);
  const addressesLoaded = useCheckoutStore((s) => s.addressesLoaded);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!addressesLoaded) {
      loadAddresses();
    }
  }, [addressesLoaded, loadAddresses]);

  const canProceed = selectedId !== null;

  return (
    <div className="space-y-5">
      {addresses.length === 0 && !showForm ? (
        <EmptyState
          icon={MapPin}
          title="هنوز آدرسی ذخیره نشده"
          description="آدرس ارسال خود را وارد کنید تا بتوانیم سفارش شما را ارسال کنیم."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-text">آدرس‌های ذخیره‌شده</p>
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={selectedId === addr.id}
              onSelect={() => selectAddress(addr.id ?? "")}
              onDelete={() => removeAddress(addr.id ?? "")}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <div className="rounded-2xl border border-border/60 bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-text">آدرس جدید</p>
          <AddressForm
            defaultName={user?.name}
            defaultPhone={user?.mobile}
            onSave={(addr) => {
              addAddress(addr);
              selectAddress(addr.id ?? "");
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <Button
          variant="outline-gold"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="ms-1.5 size-4" aria-hidden />
          افزودن آدرس جدید
        </Button>
      )}

      <div className="flex justify-end pt-2">
        <Button variant="gold" disabled={!canProceed} onClick={onNext}>
          ادامه
        </Button>
      </div>
    </div>
  );
}
