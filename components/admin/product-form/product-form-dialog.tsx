"use client";

import { useState } from "react";
import { X, Loader2, Save, Upload, Trash2, Library } from "lucide-react";
import { toast } from "sonner";
import { toEnglishDigits } from "@/lib/utils";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import type { MediaItem } from "@/components/admin/media/media-helpers";

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }
interface Color { id: string; name: string; hex: string; }
interface Size { id: string; name: string; }

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Record<string, unknown>;
  categories: Category[];
  brands: Brand[];
  allColors: Color[];
  allSizes: Size[];
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormDialog({
  mode,
  product,
  categories,
  brands,
  allColors,
  allSizes,
  onClose,
  onSaved,
}: ProductFormProps) {
  const [name, setName] = useState((product?.name as string) ?? "");
  const [slug, setSlug] = useState((product?.slug as string) ?? "");
  const [description, setDescription] = useState((product?.description as string) ?? "");
  const [categoryId, setCategoryId] = useState((product?.categoryId as string) ?? "");
  const [brandId, setBrandId] = useState((product?.brandId as string) ?? "");
  const [price, setPrice] = useState((product?.price as string) ?? "");
  const [discountPrice, setDiscountPrice] = useState((product?.discountPrice as string) ?? "");
  const [discountPercent, setDiscountPercent] = useState((product?.discountPercent as string) ?? "");
  const [stock, setStock] = useState((product?.stock as number) ?? 0);
  const [status, setStatus] = useState((product?.status as string) ?? "active");
  const [isNew, setIsNew] = useState((product?.isNew as boolean) ?? false);
  const [isBestseller, setIsBestseller] = useState((product?.isBestseller as boolean) ?? false);
  const [seoTitle, setSeoTitle] = useState((product?.seoTitle as string) ?? "");
  const [seoDescription, setSeoDescription] = useState((product?.seoDescription as string) ?? "");
  const [sortOrder, setSortOrder] = useState((product?.sortOrder as number) ?? 0);
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>(
    (product?.colors as { id: string }[] | undefined)?.map((c) => c.id) ?? []
  );
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>(
    (product?.sizes as { id: string }[] | undefined)?.map((s) => s.id) ?? []
  );
  const [images, setImages] = useState<{ path: string; alt: string }[]>(
    (product?.images as { path: string; alt: string }[] | undefined) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  function toSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
  }

  const handleNameChange = (value: string) => {
    setName(value);
    if (autoSlug) setSlug(toSlug(value));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => [...prev, ...data.data]);
        toast.success(`${data.data.length} تصویر آپلود شد`);
      } else {
        toast.error(data.message || "خطا در آپلود");
      }
    } catch {
      toast.error("خطا در آپلود تصاویر");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleColor = (id: string) => {
    setSelectedColorIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleSize = (id: string) => {
    setSelectedSizeIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("نام الزامی است"); return; }
    if (!slug.trim()) { toast.error("Slug الزامی است"); return; }
    if (!categoryId) { toast.error("دسته‌بندی را انتخاب کنید"); return; }
    if (!brandId) { toast.error("برند را انتخاب کنید"); return; }
    if (!price || Number(toEnglishDigits(price)) <= 0) { toast.error("قیمت معتبر وارد کنید"); return; }

    setSaving(true);
    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description,
          categoryId,
          brandId,
          price: Number(toEnglishDigits(price)),
          discountPrice: discountPrice ? Number(toEnglishDigits(discountPrice)) : null,
          discountPercent: discountPercent ? Number(toEnglishDigits(discountPercent)) : null,
          stock: Number(toEnglishDigits(String(stock))),
          status,
          isNew,
          isBestseller,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          sortOrder: Number(toEnglishDigits(String(sortOrder))),
          colorIds: selectedColorIds,
          sizeIds: selectedSizeIds,
          images,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "create" ? "محصول ایجاد شد" : "محصول به‌روزرسانی شد");
        onSaved();
      } else {
        toast.error(data.message || "خطا در ذخیره");
      }
    } catch {
      toast.error("خطای ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]";
  const labelClass = "mb-1.5 block text-sm font-medium text-[var(--text)]";
  const sectionClass = "rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-3";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {mode === "create" ? "افزودن محصول" : "ویرایش محصول"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Basic Info */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[var(--text)]">اطلاعات پایه</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>نام <span className="text-[var(--destructive)]">*</span></label>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="نام محصول" />
              </div>
              <div>
                <label className={labelClass}>Slug <span className="text-[var(--destructive)]">*</span></label>
                <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }} className={inputClass} dir="ltr" placeholder="product-slug" />
              </div>
              <div>
                <label className={labelClass}>ترتیب</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(toEnglishDigits(e.target.value)))} className={inputClass} min={0} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>توضیحات</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass + " resize-none"} placeholder="توضیحات محصول..." />
              </div>
            </div>
          </div>

          {/* Category & Brand */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[var(--text)]">دسته‌بندی و برند</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>دسته‌بندی <span className="text-[var(--destructive)]">*</span></label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                  <option value="">انتخاب کنید</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>برند <span className="text-[var(--destructive)]">*</span></label>
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputClass}>
                  <option value="">انتخاب کنید</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Price & Stock */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[var(--text)]">قیمت و موجودی</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>قیمت (تومان) <span className="text-[var(--destructive)]">*</span></label>
                <input type="number" value={price} onChange={(e) => setPrice(toEnglishDigits(e.target.value))} className={inputClass} min={0} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>قیمت تخفیف (تومان)</label>
                <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(toEnglishDigits(e.target.value))} className={inputClass} min={0} placeholder="اختیاری" />
              </div>
              <div>
                <label className={labelClass}>درصد تخفیف</label>
                <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(toEnglishDigits(e.target.value))} className={inputClass} min={0} max={100} placeholder="%" />
              </div>
              <div>
                <label className={labelClass}>موجودی</label>
                <input type="number" value={stock} onChange={(e) => setStock(Number(toEnglishDigits(e.target.value)))} className={inputClass} min={0} />
              </div>
              <div>
                <label className={labelClass}>وضعیت</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                  <option value="active">فعال</option>
                  <option value="draft">پیش‌نویس</option>
                  <option value="archived">بایگانی</option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-[var(--text)]">
                  <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="h-4 w-4 rounded border-[var(--border)]" />
                  جدید
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--text)]">
                  <input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} className="h-4 w-4 rounded border-[var(--border)]" />
                  پرفروش
                </label>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[var(--text)]">رنگ‌ها</h3>
            <div className="flex flex-wrap gap-2">
              {allColors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleColor(c.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedColorIds.includes(c.id)
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)]"
                  }`}
                >
                  <div className="h-3 w-3 rounded-full border border-[var(--border)]" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[var(--text)]">سایزها</h3>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSize(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedSizeIds.includes(s.id)
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)]"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--text)]">تصاویر</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                >
                  <Library className="h-4 w-4" />
                  انتخاب از رسانه
                </button>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "آپلود..." : "افزودن تصویر"}
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="group relative">
                    <img src={img.path} alt={img.alt} className="h-24 w-full rounded-lg object-cover border border-[var(--border)]" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 left-1 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 right-1 rounded bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">اصلی</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">تصویری آپلود نشده</p>
            )}
          </div>

          {/* SEO */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[var(--text)]">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>عنوان SEO</label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} placeholder="عنوان صفحه در گوگل" />
              </div>
              <div>
                <label className={labelClass}>توضیحات SEO</label>
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className={inputClass + " resize-none"} placeholder="توضیحات متا" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]">
            انصراف
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "create" ? "ایجاد" : "ذخیره"}
          </button>
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple
        accept="image"
        title="انتخاب تصاویر محصول"
        onSelect={(items: MediaItem[]) => {
          if (items.length === 0) return;
          setImages((prev) => {
            const existing = new Set(prev.map((img) => img.path));
            const added = items
              .filter((item) => !existing.has(item.url))
              .map((item) => ({ path: item.url, alt: item.alt ?? item.originalName }));
            return [...prev, ...added];
          });
        }}
      />
    </div>
  );
}
