"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Profile edit page (PRD §32).
 * Edit name, email, password. Mobile is read-only.
 */
export default function AccountProfile() {
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    newPass?: string;
    confirm?: string;
  }>({});

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setNameError("نام باید حداقل ۲ کاراکتر باشد");
      return;
    }
    setNameError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // Mock: update user name in auth store
    if (user) {
      useAuthStore.setState({ user: { ...user, name: name.trim(), email: email.trim() || null } });
      toast.success("اطلاعات حساب بروزرسانی شد");
    }
    setLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof passwordErrors = {};
    if (!currentPassword) errs.current = "گذرواژه فعلی الزامی است";
    if (!newPassword) errs.newPass = "گذرواژه جدید الزامی است";
    else if (newPassword.length < 6) errs.newPass = "حداقل ۶ کاراکتر";
    if (newPassword !== confirmNew) errs.confirm = "گذرواژه‌ها مطابقت ندارند";

    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("گذرواژه با موفقیت تغییر کرد");
      } else {
        if (data.message === "گذرواژه فعلی اشتباه است") {
          setPasswordErrors({ current: data.message });
        } else {
          toast.error(data.message || "خطا در تغییر گذرواژه");
        }
      }
    } catch {
      toast.error("خطای شبکه");
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNew("");
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Profile info */}
      <section className="rounded-2xl border border-border/40 bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-base font-bold text-text">اطلاعات حساب</h2>

        <form onSubmit={handleProfileSave} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name">نام</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "profile-name-err" : undefined}
            />
            {nameError ? (
              <p id="profile-name-err" className="text-xs text-destructive">
                {nameError}
              </p>
            ) : null}
          </div>

          {/* Mobile — readonly */}
          <div className="space-y-2">
            <Label htmlFor="profile-mobile">شماره موبایل</Label>
            <Input
              id="profile-mobile"
              dir="ltr"
              value={user?.mobile ?? ""}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-text-muted">شماره موبایل قابل تغییر نیست</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="profile-email">ایمیل (اختیاری)</Label>
            <Input
              id="profile-email"
              type="email"
              dir="ltr"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" variant="gold" disabled={loading}>
            {loading ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Save className="ml-2 size-4" />}
            ذخیره تغییرات
          </Button>
        </form>
      </section>

      {/* Password change */}
      <section className="rounded-2xl border border-border/40 bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-base font-bold text-text">تغییر گذرواژه</h2>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          {/* Current password */}
          <div className="space-y-2">
            <Label htmlFor="pw-current">گذرواژه فعلی</Label>
            <div className="relative">
              <Input
                id="pw-current"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordErrors.current) setPasswordErrors((p) => ({ ...p, current: undefined }));
                }}
                aria-invalid={!!passwordErrors.current}
                aria-describedby={passwordErrors.current ? "pw-current-err" : undefined}
                className="h-11 pl-11"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                onClick={() => setShowCurrent((p) => !p)}
                aria-label={showCurrent ? "مخفی کردن" : "نمایش"}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordErrors.current ? (
              <p id="pw-current-err" className="text-xs text-destructive">
                {passwordErrors.current}
              </p>
            ) : null}
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="pw-new">گذرواژه جدید</Label>
            <div className="relative">
              <Input
                id="pw-new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordErrors.newPass) setPasswordErrors((p) => ({ ...p, newPass: undefined }));
                }}
                aria-invalid={!!passwordErrors.newPass}
                aria-describedby={passwordErrors.newPass ? "pw-new-err" : undefined}
                className="h-11 pl-11"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? "مخفی کردن" : "نمایش"}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordErrors.newPass ? (
              <p id="pw-new-err" className="text-xs text-destructive">
                {passwordErrors.newPass}
              </p>
            ) : null}
          </div>

          {/* Confirm new password */}
          <div className="space-y-2">
            <Label htmlFor="pw-confirm">تکرار گذرواژه جدید</Label>
            <div className="relative">
              <Input
                id="pw-confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmNew}
                onChange={(e) => {
                  setConfirmNew(e.target.value);
                  if (passwordErrors.confirm) setPasswordErrors((p) => ({ ...p, confirm: undefined }));
                }}
                aria-invalid={!!passwordErrors.confirm}
                aria-describedby={passwordErrors.confirm ? "pw-confirm-err" : undefined}
                className="h-11 pl-11"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? "مخفی کردن" : "نمایش"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordErrors.confirm ? (
              <p id="pw-confirm-err" className="text-xs text-destructive">
                {passwordErrors.confirm}
              </p>
            ) : null}
          </div>

          <Button type="submit" variant="gold" disabled={loading}>
            {loading ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Save className="ml-2 size-4" />}
            تغییر گذرواژه
          </Button>
        </form>
      </section>
    </div>
  );
}
