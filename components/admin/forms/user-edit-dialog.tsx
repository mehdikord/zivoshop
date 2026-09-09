"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface UserEditProps {
  user: {
    id: string;
    name: string;
    mobile: string;
    email: string | null;
    isActive: boolean;
  };
  onClose: () => void;
  onUpdated: () => void;
}

export function UserEditDialog({ user, onClose, onUpdated }: UserEditProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? "");
  const [isActive, setIsActive] = useState(user.isActive);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("نام الزامی است");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          isActive,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("کاربر با موفقیت به‌روزرسانی شد");
        onUpdated();
      } else {
        toast.error(data.message || "خطا در به‌روزرسانی");
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text)]">ویرایش کاربر</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
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
              placeholder="نام کاربر"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              موبایل
            </label>
            <input
              type="text"
              value={user.mobile}
              disabled
              dir="ltr"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--text-muted)]"
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

        {/* Footer */}
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
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}
