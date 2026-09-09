"use client";

import { useState, useEffect } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/components/checkout/address-card";
import { AddressForm } from "@/components/checkout/address-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Address } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { EmptyState } from "@/components/feedback/empty-state";
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { AddressesSkeleton } from "@/components/feedback/skeleton-variants";

interface ApiAddress {
  id: string;
  title: string;
  provinceId: string;
  provinceName: string;
  provinceSlug: string;
  cityId: string;
  cityName: string;
  citySlug: string;
  postalCode: string;
  fullAddress: string;
  receiverName?: string | null;
  receiverPhone?: string | null;
  isDefault: boolean;
}

function mapApiAddress(a: ApiAddress): Address {
  return {
    id: a.id,
    title: a.title,
    province: a.provinceName,
    city: a.cityName,
    postalCode: a.postalCode,
    fullAddress: a.fullAddress,
    receiverName: a.receiverName ?? undefined,
    receiverPhone: a.receiverPhone ?? undefined,
    isDefault: a.isDefault,
  };
}

export default function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Address | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function fetchAddresses() {
      setLoading(true);
      try {
        const res = await fetch("/api/addresses");
        const data = await res.json();
        if (data.success) {
          setAddresses(data.data.map(mapApiAddress));
        } else {
          toast.error(data.message || "خطا در دریافت آدرس‌ها");
        }
      } catch {
        toast.error("خطای شبکه در دریافت آدرس‌ها");
      } finally {
        setLoading(false);
      }
    }
    fetchAddresses();
  }, []);

  async function refreshAddresses() {
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data.map(mapApiAddress));
      }
    } catch {
      // silent refresh failure
    }
  }

  if (!hydrated) {
    return <AddressesSkeleton />;
  }

  if (loading) {
    return <AddressesSkeleton />;
  }

  async function handleSave(addr: Omit<Address, "id"> & { id?: string }) {
    const apiAddr = {
      title: addr.title,
      provinceId: addr.provinceId,
      cityId: addr.cityId,
      postalCode: addr.postalCode,
      fullAddress: addr.fullAddress,
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      isDefault: addr.isDefault,
    };
    if (editing) {
      const res = await fetch(`/api/addresses/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiAddr),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("آدرس بروزرسانی شد");
        await refreshAddresses();
      } else {
        toast.error(data.message || "خطا در بروزرسانی");
      }
    } else {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiAddr),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("آدرس جدید اضافه شد");
        await refreshAddresses();
      } else {
        toast.error(data.message || "خطا در ایجاد آدرس");
      }
    }
    setShowForm(false);
    setEditing(undefined);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/addresses/${deleteTarget.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      toast.success("آدرس حذف شد");
      await refreshAddresses();
    } else {
      toast.error(data.message || "خطا در حذف");
    }
    setDeleteTarget(undefined);
  }

  async function handleSetDefault(addrId: string) {
    const addr = addresses.find((a) => a.id === addrId);
    if (!addr) return;
    const res = await fetch(`/api/addresses/${addrId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addr, isDefault: true }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("آدرس پیش‌فرض تغییر کرد");
      await refreshAddresses();
    } else {
      toast.error(data.message || "خطا در تغییر پیش‌فرض");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-text-muted">{addresses.length} آدرس ذخیره شده</p>
        <Button
          variant="gold"
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setShowForm(true);
          }}
        >
          <Plus className="ml-1.5 size-4" />
          افزودن آدرس
        </Button>
      </div>

      {/* Address list */}
      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="آدرسی ذخیره نشده"
          description="آدرس جدیدی اضافه کنید تا در سفارش‌ها استفاده شود"
          action={
            <Button
              variant="gold"
              size="sm"
              onClick={() => {
                setEditing(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="ml-1.5 size-4" />
              افزودن اولین آدرس
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="space-y-2">
              <AddressCard
                address={addr}
                selected={!!addr.isDefault}
                onSelect={() => handleSetDefault(addr.id ?? "")}
                onDelete={() => setDeleteTarget(addr)}
              />
              {addr.isDefault ? (
                <p className="pr-4 text-xs font-medium text-gold-dark">
                  آدرس پیش‌فرض
                </p>
              ) : null}
              <div className="flex gap-2 pr-4">
                <button
                  onClick={() => {
                    setEditing(addr);
                    setShowForm(true);
                  }}
                  className="text-xs font-medium text-text-secondary transition-colors hover:text-primary"
                >
                  ویرایش
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false);
            setEditing(undefined);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش آدرس" : "افزودن آدرس جدید"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "اطلاعات آدرس را ویرایش کنید"
                : "آدرس جدیدی برای ارسال سفارش‌ها اضافه کنید"}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            initial={editing}
            defaultName={user?.name}
            defaultPhone={user?.mobile}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditing(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <ConfirmationDialog
          open={true}
          onOpenChange={() => setDeleteTarget(undefined)}
          title="حذف آدرس"
          description={`آیا مطمئن هستید که می‌خواهید «${deleteTarget.title}» را حذف کنید؟ این کار قابل بازگشت نیست.`}
          confirmLabel="حذف"
          confirmVariant="destructive"
          icon="destructive"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}