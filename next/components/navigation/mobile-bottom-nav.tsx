"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  Heart,
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
};

/**
 * Fixed bottom navigation for mobile (PRD §7.2) — always reachable
 * across every page. Hidden on desktop (≥1024px).
 */
export function MobileBottomNav({
  onOpenMenu,
  onOpenSearch,
  onOpenCart,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const itemCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  const accountHref = (isAuthenticated ? "/account" : "/login") as Route;

  const isActive = (pattern: string): boolean =>
    pathname === pattern ||
    (pattern !== "/" && pathname.startsWith(pattern));

  const items: {
    label: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    active: boolean;
    onClick?: () => void;
    href?: Route;
    badge?: number;
  }[] = [
    { label: "خانه", icon: Home, active: isActive("/") && pathname === "/", href: "/" },
    { label: "دسته‌بندی‌ها", icon: LayoutGrid, active: false, onClick: onOpenMenu },
    { label: "جستجو", icon: Search, active: false, onClick: onOpenSearch },
    {
      label: "علاقه‌مندی‌ها",
      icon: Heart,
      active: isActive("/account/wishlist"),
      href: "/account/wishlist" as Route,
      badge: wishlistCount,
    },
    {
      label: "حساب",
      icon: User,
      active: isActive("/account") || isActive("/login"),
      href: accountHref,
    },
    {
      label: "سبد",
      icon: ShoppingBag,
      active: false,
      onClick: onOpenCart,
      badge: itemCount,
    },
  ];

  return (
    <nav
      aria-label="ناوبری پایین"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-soft lg:hidden w-full max-w-screen overflow-hidden"
    >
      <ul className="grid h-16 min-w-max grid-cols-6 overflow-x-auto scrollbar-hide">
        {items.map((item) => {
          const Inner = (
            <>
              <span className="relative flex items-center justify-center">
                <item.icon
                  className={cn(
                    "size-5 transition-colors",
                    item.active ? "text-primary" : "text-text-secondary",
                  )}
                  aria-hidden
                />
                {item.badge ? (
                  <span className="absolute -end-1.5 -top-1.5 flex min-w-4 animate-zivo-zoom-in items-center justify-center rounded-full bg-gold-dark px-1 text-[9px] font-bold leading-4 text-background">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  item.active ? "text-primary" : "text-text-secondary",
                )}
              >
                {item.label}
              </span>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 top-0 h-0.5 rounded-full bg-gold-dark transition-opacity",
                  item.active ? "opacity-100" : "opacity-0",
                )}
              />
            </>
          );

          const className = cn(
            "relative flex flex-col items-center justify-center gap-0.5 pt-0.5 transition-colors active:scale-95",
            item.active ? "text-primary" : "text-text-secondary",
          );

          return (
            <li key={item.label} className="relative">
              {item.href ? (
                <Link href={item.href} className={className}>
                  {Inner}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  aria-label={item.label}
                  className={cn(className, "w-full cursor-pointer")}
                >
                  {Inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
