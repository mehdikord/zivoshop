"use client";

import { useState } from "react";
import { X, Loader2, Save, Image, Trash2, Library } from "lucide-react";
import { toast } from "sonner";
import { toEnglishDigits } from "@/lib/utils";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import type { MediaItem } from "@/components/admin/media/media-helpers";

interface BrandFormDialogProps {
  mode: "create" | "edit";
  brand?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    sortOrder: number;
    isActive: boolean;
  };
  onClose: () => void;
  onSaved: () => void;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function BrandFormDialog({
  mode,
  brand,
  onClose,
  onSaved,
}: BrandFormDialogProps) {
  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [description, setDescription] = useState(brand?.description ?? "");
  const [logo, setLogo] = useState<string | null>(brand?.logo ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState(brand?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [saving, setSaving] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (autoSlug) {
      setSlug(toSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setAutoSlug(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("نام برند الزامی است");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug الزامی است");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "create" ? "/api/admin/brands" : `/api/admin/brands/${brand!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          logo: logo || null,
          sortOrder: Number(toEnglishDigits(String(sortOrder))),
          isActive,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(mode === "create" ? "برند ایجاد شد" : "برند به‌روزرسانی شد");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {mode === "create" ? "افزودن برند" : "ویرایش برند"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              نام <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="مثلاً زیوو"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              Slug <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              dir="ltr"
              placeholder="zivo"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">خودکار از نام ساخته می‌شود</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              توضیحات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              placeholder="توضیحات برند..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              لوگوی برند
            </label>
            <div className="flex items-start gap-3">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
                {logo ? (
                  <img
                    src={logo}
                    alt="پیش‌نمایش لوگوی برند"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image className="h-8 w-8 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                >
                  <Library className="h-4 w-4" />
                  انتخاب از رسانه
                </button>
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo(null)}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive-light)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف لوگو
                  </button>
                )}
                <p className="text-xs text-[var(--text-muted)]">
                  تصویر از بخش رسانه انتخاب می‌شود
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                ترتیب نمایش
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(toEnglishDigits(e.target.value)))}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                min={0}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? "bg-[var(--success)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
              <span className="text-sm text-[var(--text-secondary)]">
                {isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "create" ? "ایجاد" : "ذخیره"}
          </button>
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple={false}
        accept="image"
        title="انتخاب لوگوی برند"
        onSelect={(items: MediaItem[]) => {
          if (items.length === 0) return;
          setLogo(items[0]!.url);
        }}
      />
    </div>
  );
}