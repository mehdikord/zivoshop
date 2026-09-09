"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { toEnglishDigits } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedMobile = toEnglishDigits(mobile);

    if (!normalizedMobile || !password) {
      toast.error("لطفاً شماره موبایل و گذرواژه را وارد کنید");
      return;
    }

    if (!/^09\d{9}$/.test(normalizedMobile)) {
      toast.error("شماره موبایل معتبر نیست");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: normalizedMobile, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("ورود موفقیت‌آمیز بود");
        window.location.href = "/admin";
        router.refresh();
      } else {
        toast.error(data.message || "خطا در ورود");
      }
    } catch {
      toast.error("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]">
            <span className="text-2xl font-bold text-white">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">پنل مدیریت</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            فروشگاه اینترنتی زیوو
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mobile */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                شماره موبایل
              </label>
              <div className="relative">
                <Smartphone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  dir="ltr"
                  value={mobile}
                  onChange={(e) => setMobile(toEnglishDigits(e.target.value))}
                  placeholder="09120000000"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-10 pl-4 text-left text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  maxLength={11}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                گذرواژه
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-10 pl-10 text-left text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                "ورود"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} زیوو | پنل مدیریت
        </p>
      </div>
    </div>
  );
}
