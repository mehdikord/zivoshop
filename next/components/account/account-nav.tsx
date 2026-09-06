"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  Heart,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { href: "/account", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "سفارش‌ها", icon: ShoppingBag },
  { href: "/account/profile", label: "اطلاعات حساب", icon: User },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href as Route}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-text-secondary hover:bg-surface-secondary hover:text-text",
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

/**
 * Account panel navigation — sidebar on desktop, horizontal tabs on mobile.
 * Highlights the active route and provides a logout button.
 */
export function AccountNav() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-64 shrink-0 lg:block" aria-label="منوی حساب کاربری">
        {/* User info card */}
        <div className="mb-6 rounded-2xl border border-border/50 bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
              {user?.name?.charAt(0) ?? "Z"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text">{user?.name}</p>
              <p dir="ltr" className="truncate text-xs text-text-muted">
                {user?.mobile}
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href, item.exact)}
            />
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive-light"
        >
          <LogOut className="size-5" aria-hidden />
          <span>خروج از حساب</span>
        </button>
      </nav>

      {/* Mobile tabs */}
      <nav className="mb-6 overflow-x-auto border-b border-border lg:hidden" aria-label="منوی حساب کاربری">
        <div className="flex gap-1 px-1 pb-px">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-3 text-sm font-medium transition-all",
                isActive(item.href, item.exact)
                  ? "border-b-2 border-primary bg-surface text-primary"
                  : "text-text-muted hover:text-text",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
