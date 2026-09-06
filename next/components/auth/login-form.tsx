"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toEnglishDigits } from "@/lib/utils";

/**
 * Login form (PRD §28, §50, §55).
 * Mobile field in LTR, password with show/hide toggle,
 * inline error, loading spinner, redirect on success.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const next: typeof errors = {};
    const normalized = toEnglishDigits(mobile);
    if (!normalized) next.mobile = "شماره موبایل الزامی است";
    else if (!/^09\d{9}$/.test(normalized)) next.mobile = "شماره موبایل معتبر نیست";
    if (!password) next.password = "گذرواژه الزامی است";
    else if (password.length < 6) next.password = "گذرواژه باید حداقل ۶ کاراکتر باشد";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    const result = await login(toEnglishDigits(mobile), password);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      const redirect = searchParams.get("redirect");
      router.push((redirect || "/") as Route);
    } else {
      setServerError(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError ? (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      ) : null}

      {/* Mobile */}
      <div className="space-y-2">
        <Label htmlFor="login-mobile">شماره موبایل</Label>
        <div className="relative">
          <Input
            id="login-mobile"
            type="tel"
            dir="ltr"
            placeholder="09xxxxxxxxx"
            autoComplete="tel"
            maxLength={11}
            aria-invalid={!!errors.mobile}
            aria-describedby={errors.mobile ? "login-mobile-err" : undefined}
            value={mobile}
            onChange={(e) => {
              setMobile(toEnglishDigits(e.target.value));
              if (errors.mobile) setErrors((p) => ({ ...p, mobile: undefined }));
              if (serverError) setServerError("");
            }}
          />
        </div>
        {errors.mobile ? (
          <p id="login-mobile-err" className="text-xs text-destructive">
            {errors.mobile}
          </p>
        ) : null}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="login-password">گذرواژه</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="گذرواژه خود را وارد کنید"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-err" : undefined}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              if (serverError) setServerError("");
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
          <p id="login-password-err" className="text-xs text-destructive">
            {errors.password}
          </p>
        ) : null}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-primary font-bold text-surface hover:bg-primary/90"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ورود"}
      </Button>
    </form>
  );
}
