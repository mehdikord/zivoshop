"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { toEnglishDigits } from "@/lib/utils";

export type AttributeType = "color" | "size" | "feature";

interface AttributeFormProps {
  mode: "create" | "edit";
  type: AttributeType;
  item?: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void;
}

export function AttributeFormDialog({
  mode,
  type,
  item,
  onClose,
  onSaved,
}: AttributeFormProps) {
  const [name, setName] = useState((item?.name as string) ?? "");
  const [hex, setHex] = useState((item?.hex as string) ?? "#000000");
  const [title, setTitle] = useState((item?.title as string) ?? "");
  const [description, setDescription] = useState((item?.description as string) ?? "");
  const [icon, setIcon] = useState((item?.icon as string) ?? "");
  const [sortOrder, setSortOrder] = useState((item?.sortOrder as number) ?? 0);
  const [isActive, setIsActive] = useState((item?.isActive as boolean) ?? true);
  const [saving, setSaving] = useState(false);

  const typeLabels = {
    color: { name: "رنگ", create: "افزودن رنگ", edit: "ویرایش رنگ" },
    size: { name: "سایز", create: "افزودن سایز", edit: "ویرایش سایز" },
    feature: { name: "ویژگی", create: "افزودن ویژگی", edit: "ویرایش ویژگی" },
  };

  const labels = typeLabels[type];

  const handleSave = async () => {
    const displayName = type === "feature" ? title.trim() : name.trim();
    if (!displayName) {
      toast.error(`نام ${labels.name} الزامی است`);
      return;
    }

    setSaving(true);
    try {
      const endpoint = type === "feature" ? "features" : type === "color" ? "colors" : "sizes";
      const url =
        mode === "create"
          ? `/api/admin/${endpoint}`
          : `/api/admin/${endpoint}/${item!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      let payload: Record<string, unknown>;
      if (type === "color") {
        payload = { name: name.trim(), hex: hex || "#000000" };
      } else if (type === "size") {
        payload = { name: name.trim(), sortOrder: Number(toEnglishDigits(String(sortOrder))) };
      } else {
        payload = {
          title: title.trim(),
          description: description.trim() || "",
          icon: icon.trim() || null,
          sortOrder: Number(toEnglishDigits(String(sortOrder))),
          isActive,
        };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          mode === "create" ? `${labels.name} ایجاد شد` : `${labels.name} به‌روزرسانی شد`
        );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {mode === "create" ? labels.create : labels.edit}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Feature fields */}
          {type === "feature" ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                  عنوان <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="مثلاً جنس پارچه"
                />
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
                  placeholder="توضیحات ویژگی..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                  آیکون
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  dir="ltr"
                  placeholder="e.g. shield-check"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">ترتیب نمایش</label>
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
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-1" : "translate-x-6"}`} />
                  </button>
                  <span className="text-sm text-[var(--text-secondary)]">{isActive ? "فعال" : "غیرفعال"}</span>
                </div>
              </div>
            </>
          ) : type === "color" ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                  نام <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="مثلاً مشکی"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">کد رنگ</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => setHex(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-[var(--border)]"
                  />
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => setHex(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    dir="ltr"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                  نام <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="مثلاً L"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">ترتیب نمایش</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  min={0}
                />
              </div>
            </>
          )}
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
    </div>
  );
}
