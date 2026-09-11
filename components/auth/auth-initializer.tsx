"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * AuthInitializer - یک‌بار در حیاه‌برنامه fetchMe() را صدا می‌زند
 * تا وضعیت احراز هویت با سرور (cookie JWT) همگام‌سازی شود.
 * این مانع از loop ریدایرکت می‌شود که ناشی از state قدیمی localStorage است.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    let mounted = true;
    fetchMe().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
  }, [fetchMe]);

  return <>{children}</>;
}