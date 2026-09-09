"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { toEnglishDigits } from "@/lib/utils";

interface AdminFormDialogProps {
  mode: "create" | "edit";
  admin?: {
    id: string;
    name: string;
    mobile: string;
    email: string | null;
    isActive: boolean;
  };
  onClose: () => void;
  onSaved: () => void;
}

export function AdminFormDialog({
  mode,
  admin,
  onClose,
  onSaved,
}: AdminFormDialogProps) {
  const [name, setName] = useState(admin?.name ?? "");
  const [mobile, setMobile] = useState(admin?.mobile ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(admin?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("نام الزامی است");
      return;
    }
    if (!mobile.trim()) {
      toast.error("شماره موبایل الزامی است");
      return;
    }
    if (mode === "create" && password.length < 6) {
      toast.error("گذرواژه باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "create" ? "/api/admin/admins" : `/api/admin/admins/${admin!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const payload: Record<string, unknown> = {
        name: name.trim(),
        mobile: toEnglishDigits(mobile).trim(),
        email: email.trim() || null,
        isActive,
      };
      if (password) payload.password = password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(mode === "create" ? "مدیر ایجاد شد" : "مدیر به‌روزرسانی شد");
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
            {mode === "create" ? "افزودن مدیر" : "ویرایش مدیر"}
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
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="نام مدیر"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              شماره موبایل <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(toEnglishDigits(e.target.value))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="09123456789"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              ایمیل
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              گذرواژه{" "}
              {mode === "create" && (
                <span className="text-[var(--destructive)]">*</span>
              )}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              placeholder={
                mode === "create" ? "حداقل ۶ کاراکتر" : "برای تغییر وارد کنید"
              }
              dir="ltr"
            />
            {mode === "edit" && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                اگر نمی‌خواهید تغییری دهید، خالی بگذارید
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--text)]">وضعیت:</label>
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
