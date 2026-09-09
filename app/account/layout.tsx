"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { AccountNav } from "@/components/account/account-nav";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { PageSkeleton } from "@/components/feedback/skeleton-variants";

const BREADCRUMB_MAP: Record<string, string> = {
  account: "حساب کاربری",
  orders: "سفارش‌ها",
  profile: "اطلاعات حساب",
  addresses: "آدرس‌ها",
  wishlist: "علاقه‌مندی‌ها",
};

/**
 * Account panel layout — auth guard + responsive shell.
 * Desktop: sidebar + content. Mobile: tab bar + content.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  if (!hydrated) {
    return <PageSkeleton showSidebar={true} />;
  }
  if (!user) return null;

  // Build breadcrumbs — last item has no href (current page)
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const label = BREADCRUMB_MAP[seg] ?? (isLast ? "جزئیات سفارش" : seg);
    return {
      label,
      href: isLast ? undefined : "/" + segments.slice(0, i + 1).join("/"),
    };
  });

  const lastSeg = segments[segments.length - 1] ?? "";
  const pageTitle =
    BREADCRUMB_MAP[lastSeg] ??
    (segments.includes("orders") && segments.length > 2
      ? "جزئیات سفارش"
      : "حساب کاربری");

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {/* Page title */}
        <h1 className="mb-8 text-2xl font-extrabold text-text sm:text-3xl">
          {pageTitle}
        </h1>

        {/* Shell: nav + content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          <AccountNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}