"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Logo } from "@/components/layout/logo";

/**
 * Shared auth page layout (PRD §28, Phase 07).
 * Centered card with logo, form slot, and footer links.
 * Redirects to home if already authenticated.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footerLink,
  footerText,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerLink: { href: string; label: string };
  footerText: string;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  if (user) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-extrabold text-text sm:text-2xl">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-text-muted">
          {footerText}{" "}
          <Link
            href={footerLink.href as Route}
            className="font-semibold text-gold-dark transition-colors hover:underline"
          >
            {footerLink.label}
          </Link>
        </p>
      </div>
    </main>
  );
}
