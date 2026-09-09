"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toEnglishDigits } from "@/lib/utils";

const couponSchema = z.object({
  code: z.string().min(1, "کد کوپن الزامی است").max(50),
  type: z.enum(["fixed", "percent"], { message: "نوع تخفیف الزامی است" }),
  value: z.number().positive("مقدار باید مثبت باشد"),
  minOrderAmount: z.number().nonnegative().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.type === "percent" && data.value > 100) return false;
  return true;
}, {
  message: "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد",
  path: ["value"],
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormDialogProps {
  coupon: { id: string; code: string; type: string; value: string; minOrderAmount: string | null; maxUses: number | null; startsAt: string | null; expiresAt: string | null; isActive: boolean } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CouponFormDialog({ coupon, open, onOpenChange, onSuccess }: CouponFormDialogProps) {
  const isEditing = !!coupon;

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "fixed",
      value: 0,
      minOrderAmount: null,
      maxUses: null,
      startsAt: null,
      expiresAt: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        type: coupon.type as "fixed" | "percent",
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxUses: coupon.maxUses ?? null,
        startsAt: coupon.startsAt ? coupon.startsAt.split("T")[0] : null,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : null,
        isActive: coupon.isActive,
      });
    } else {
      form.reset({
        code: "",
        type: "fixed",
        value: 0,
        minOrderAmount: null,
        maxUses: null,
        startsAt: null,
        expiresAt: null,
        isActive: true,
      });
    }
  }, [coupon, form]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: CouponFormData) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        code: data.code.trim(),
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount ?? undefined,
        maxUses: data.maxUses ?? undefined,
        startsAt: data.startsAt ? `${data.startsAt}T00:00:00.000Z` : undefined,
        expiresAt: data.expiresAt ? `${data.expiresAt}T23:59:59.999Z` : undefined,
        isActive: data.isActive,
      };

      const url = isEditing ? `/api/admin/coupons/${coupon!.id}` : "/api/admin/coupons";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.message || "خطا در ذخیره");
      }
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "ویرایش کوپن" : "افزودن کوپن"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد کوپن</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: ZIVO20" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                    {!isEditing && <FormDescription>کد یکتا برای استفاده در سبد خرید</FormDescription>}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع تخفیف</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">مبلغ ثابت (ریال)</SelectItem>
                        <SelectItem value="percent">درصدی (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقدار تخفیف</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={form.watch("type") === "percent" ? 100 : undefined}
                        placeholder={form.watch("type") === "percent" ? "مثال: 20" : "مثال: 50000"}
                        value={field.value}
                        onChange={(e) => field.onChange(toEnglishDigits(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      {form.watch("type") === "percent"
                        ? "درصد تخفیف (۱ تا ۱۰۰)"
                        : "مبلغ ثابت به ریال"}
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minOrderAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حداقل مبلغ سفارش (اختیاری)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="مثال: 200000"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(toEnglishDigits(e.target.value)) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>کوپن فقط برای سفارش‌های بالای این مبلغ اعمال می‌شود</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حداکثر تعداد استفاده (اختیاری)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="مثال: 100"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(toEnglishDigits(e.target.value)) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>خالی بگذارید برای استفاده نامحدود</FormDescription>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شروع اعتبار</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>انقضا</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">فعال</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                انصراف
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "در حال ذخیره..." : isEditing ? "به‌روزرسانی" : "ایجاد"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}