"use client";

import { useState, useEffect, useCallback } from "react";
import { Truck, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ShippingProvinceRow {
  id: string;
  name: string;
  slug: string;
  shippingCost: number;
}

interface ShippingConfig {
  freeShippingThreshold: number;
  baseShippingFee: number;
  provinceCount: number;
  provinces: ShippingProvinceRow[];
}

export default function ShippingSettingsPage() {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [threshold, setThreshold] = useState("2000000");
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applyConfig = useCallback((data: ShippingConfig) => {
    setConfig(data);
    setThreshold(String(data.freeShippingThreshold));
    const next: Record<string, string> = {};
    for (const p of data.provinces) {
      next[p.id] = String(p.shippingCost);
    }
    setCosts(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/shipping-settings")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) applyConfig(data.data);
        else throw new Error(data.message || "خطا در دریافت تنظیمات ارسال");
      })
      .catch(() => {
        if (!cancelled) toast.error("خطای ارتباط با سرور");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyConfig]);

  const updateCost = (id: string, value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setCosts((prev) => ({ ...prev, [id]: digitsOnly }));
  };

  const handleSave = async () => {
    if (!config) return;

    const parsedThreshold = Number(threshold.replace(/\D/g, ""));
    if (!Number.isInteger(parsedThreshold) || parsedThreshold < 0) {
      toast.error("مبلغ آستانه ارسال رایگان باید عدد معتبر باشد");
      return;
    }

    const provinces = config.provinces.map((p) => {
      const value = Number(costs[p.id]);
      return { id: p.id, shippingCost: Number.isInteger(value) && value >= 0 ? value : p.shippingCost };
    });

    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeShippingThreshold: parsedThreshold,
          provinces,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "خطا در ذخیره تنظیمات");
        return;
      }
      toast.success("تنظیمات ارسال ذخیره شد");
      applyConfig(data.data);
    } catch {
      toast.error("خطای ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">تنظیمات ارسال</h1>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">تنظیمات ارسال</h1>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--text-muted)]">
          بارگذاری تنظیمات ممکن نشد.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Truck className="h-6 w-6 text-[var(--primary)]" />
        <h1 className="text-2xl font-bold text-[var(--text)]">تنظیمات ارسال</h1>
      </div>

      {/* Free shipping threshold */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-[var(--text)]">آستانه ارسال رایگان</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            سفارش‌هایی که مبلغ کل آن‌ها از این عدد بیشتر شود، رایگان ارسال می‌شوند.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-sm">
            <Label htmlFor="free-threshold" className="text-sm font-medium text-[var(--text-secondary)]">
              مبلغ آستانه ارسال رایگان (تومان)
            </Label>
            <Input
              id="free-threshold"
              inputMode="numeric"
              dir="ltr"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ""))}
              placeholder="مثلاً 2000000"
              className="mt-2"
            />
          </div>
          <Badge variant="success" className="shrink-0">
            {Number(threshold.replace(/\D/g, "") || 0).toLocaleString("fa-IR")} تومان
          </Badge>
        </div>
      </div>

      {/* Per-province shipping costs */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">هزینه ارسال استان‌ها</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              برای هر استان هزینه ارسال را تعیین کنید. این هزینه در صورت عدم مشمولیت ارسال رایگان به مبلغ کل اضافه می‌شود.
            </p>
          </div>
          <span className="text-sm text-[var(--text-muted)]">{config.provinceCount} استان</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {config.provinces.map((province) => (
            <div
              key={province.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <p className="mb-2 truncate text-sm font-semibold text-[var(--text)]" title={province.name}>
                {province.name}
              </p>
              <div>
                <Label
                  htmlFor={`shipping-cost-${province.id}`}
                  className="text-xs text-[var(--text-muted)]"
                >
                  هزینه ارسال (تومان)
                </Label>
                <Input
                  id={`shipping-cost-${province.id}`}
                  inputMode="numeric"
                  dir="ltr"
                  value={costs[province.id] ?? ""}
                  onChange={(e) => updateCost(province.id, e.target.value)}
                  placeholder="45000"
                  className="mt-1 h-9"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg">
        <p className="me-auto hidden text-sm text-[var(--text-muted)] sm:block">
          با ذخیره، آستانه ارسال رایگان و هزینه ارسال همه استان‌ها به‌روزرسانی می‌شود.
        </p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              ذخیره تغییرات
            </>
          )}
        </Button>
      </div>
    </div>
  );
}