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
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import type { MediaItem } from "@/components/admin/media/media-helpers";
import { Image as ImageIcon, Trash2, Library } from "lucide-react";

const bannerSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").max(255),
  subtitle: z.string().max(500).optional().nullable(),
  eyebrow: z.string().max(255).optional().nullable(),
  ctaLabel: z.string().max(100).optional().nullable(),
  href: z.string().optional().nullable().or(z.literal("")),
  image: z.string().min(1, "تصویر الزامی است"),
  position: z.enum(["hero", "campaign", "special_offer", "footer", "sidebar"], { message: "موقعیت الزامی است" }),
  align: z.enum(["start", "center"], { message: "ترازبندی الزامی است" }),
  sortOrder: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

const POSITION_LABELS: Record<string, string> = {
  hero: "هرو (بالاترین)",
  campaign: "کمپین",
  special_offer: "پیشنهاد ویژه",
  footer: "فوتر",
  sidebar: "سایدبار",
};

const ALIGN_LABELS: Record<string, string> = {
  start: "چپ/راست",
  center: "وسط",
};

interface BannerFormDialogProps {
  banner: {
    id: string;
    title: string;
    subtitle: string | null;
    eyebrow: string | null;
    ctaLabel: string | null;
    href: string | null;
    image: string;
    position: string;
    align: string;
    sortOrder: number;
    isActive: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BannerFormDialog({ banner, open, onOpenChange, onSuccess }: BannerFormDialogProps) {
  const isEditing = !!banner;

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      eyebrow: "",
      ctaLabel: "",
      href: "",
      image: "",
      position: "hero",
      align: "center",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (banner) {
      form.reset({
        title: banner.title,
        subtitle: banner.subtitle || "",
        eyebrow: banner.eyebrow || "",
        ctaLabel: banner.ctaLabel || "",
        href: banner.href || "",
        image: banner.image,
        position: banner.position as "hero" | "campaign" | "special_offer" | "footer" | "sidebar",
        align: banner.align as "start" | "center",
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      });
    } else {
      form.reset({
        title: "",
        subtitle: "",
        eyebrow: "",
        ctaLabel: "",
        href: "",
        image: "",
        position: "hero",
        align: "center",
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [banner, form]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const imageValue = form.watch("image");

  const onSubmit = async (data: BannerFormData) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || undefined,
        eyebrow: data.eyebrow?.trim() || undefined,
        ctaLabel: data.ctaLabel?.trim() || undefined,
        href: data.href?.trim() || undefined,
        image: data.image.trim(),
        position: data.position,
        align: data.align,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      };

      const url = isEditing ? `/api/admin/banners/${banner!.id}` : "/api/admin/banners";
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "ویرایش بنر" : "افزودن بنر"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان *</FormLabel>
                      <FormControl>
                        <Input placeholder="عنوان بنر" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eyebrow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ایبرو (نوشته کوچک بالا)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: مجموعه جدید" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>متن کوچک بالای عنوان</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ساب‌تایتل</FormLabel>
                      <FormControl>
                        <Input placeholder="توضیح کوتاه" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ctaLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>متن دکمه (CTA)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: خرید اکنون" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>متن نمایشی روی دکمه اقدام</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="href"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لینک (اختیاری)</FormLabel>
                      <FormControl>
                        <Input placeholder="/category/shoes یا https://example.com" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>آدرس مقصد دکمه CTA (لینک داخلی یا خارجی)</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>تصویر *</FormLabel>
                      <div className="flex items-start gap-3">
                        <div className="relative flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                          {imageValue ? (
                            <img
                              src={imageValue}
                              alt="پیش‌نمایش بنر"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPickerOpen(true)}
                          >
                            <Library className="h-4 w-4 ml-2" />
                            انتخاب از رسانه
                          </Button>
                          {imageValue && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => form.setValue("image", "")}
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف تصویر
                            </Button>
                          )}
                          <p className="text-xs text-muted-foreground">
                            تصویر از بخش رسانه انتخاب می‌شود
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>موقعیت *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(POSITION_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="align"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ترازبندی *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ALIGN_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ترتیب نمایش</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(toEnglishDigits(e.target.value)) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 pt-6">
                        <FormControl>
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              field.value ? "bg-[var(--success)]" : "bg-[var(--border)]"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                field.value ? "translate-x-1" : "translate-x-6"
                              }`}
                            />
                          </button>
                        </FormControl>
                        <FormLabel className="cursor-pointer">{field.value ? "فعال" : "غیرفعال"}</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  انصراف
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "در حال ذخیره..." : isEditing ? "به‌روزرسانی" : "ایجاد"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple={false}
        accept="image"
        title="انتخاب تصویر بنر"
        onSelect={(items: MediaItem[]) => {
          if (items.length === 0) return;
          form.setValue("image", items[0]!.url);
        }}
      />
    </>
  );
}