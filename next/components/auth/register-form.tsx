"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toEnglishDigits } from "@/lib/utils";

/**
 * Register form (PRD §28, §50, §55).
 * Name, mobile (LTR), password + confirm with show/hide toggle,
 * inline errors, loading spinner, auto-login on success, redirect.
 */
export function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "نام الزامی است";
    else if (name.trim().length < 2) next.name = "نام باید حداقل ۲ کاراکتر باشد";

    const normalizedMobile = toEnglishDigits(mobile);
    if (!normalizedMobile) next.mobile = "شماره موبایل الزامی است";
    else if (!/^09\d{9}$/.test(normalizedMobile)) next.mobile = "شماره موبایل معتبر نیست";

    if (!password) next.password = "گذرواژه الزامی است";
    else if (password.length < 6) next.password = "گذرواژه باید حداقل ۶ کاراکتر باشد";

    if (!confirmPassword) next.confirmPassword = "تأیید گذرواژه الزامی است";
    else if (password !== confirmPassword) next.confirmPassword = "گذرواژه‌ها مطابقت ندارند";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    const result = await register(name.trim(), toEnglishDigits(mobile), password);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.push("/" as Route);
    } else {
      setServerError(result.message);
    }
  }

  function clearField(field: keyof typeof errors) {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    if (serverError) setServerError("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError ? (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      ) : null}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="reg-name">نام</Label>
        <Input
          id="reg-name"
          type="text"
          placeholder="نام خود را وارد کنید"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "reg-name-err" : undefined}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearField("name");
          }}
        />
        {errors.name ? (
          <p id="reg-name-err" className="text-xs text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      {/* Mobile */}
      <div className="space-y-2">
        <Label htmlFor="reg-mobile">شماره موبایل</Label>
        <Input
          id="reg-mobile"
          type="tel"
          dir="ltr"
          placeholder="09xxxxxxxxx"
          autoComplete="tel"
          maxLength={11}
          aria-invalid={!!errors.mobile}
          aria-describedby={errors.mobile ? "reg-mobile-err" : undefined}
          value={mobile}
          onChange={(e) => {
            setMobile(toEnglishDigits(e.target.value));
            clearField("mobile");
          }}
        />
        {errors.mobile ? (
          <p id="reg-mobile-err" className="text-xs text-destructive">
            {errors.mobile}
          </p>
        ) : null}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="reg-password">گذرواژه</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="حداقل ۶ کاراکتر"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "reg-password-err" : undefined}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearField("password");
            }}
            className="h-11 pl-11"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? "مخفی کردن گذرواژه" : "نمایش گذرواژه"}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? (
          <p id="reg-password-err" className="text-xs text-destructive">
            {errors.password}
          </p>
        ) : null}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">تأیید گذرواژه</Label>
        <div className="relative">
          <Input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="گذرواژه را دوباره وارد کنید"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "reg-confirm-err" : undefined
            }
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearField("confirmPassword");
            }}
            className="h-11 pl-11"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showConfirm ? "مخفی کردن گذرواژه" : "نمایش گذرواژه"}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
            onClick={() => setShowConfirm((p) => !p)}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <p id="reg-confirm-err" className="text-xs text-destructive">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-primary font-bold text-surface hover:bg-primary/90"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ثبت‌نام"}
      </Button>
    </form>
  );
}
