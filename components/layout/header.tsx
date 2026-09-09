"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/navigation/mega-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { formatNumber } from "@/lib/format";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

type HeaderProps = {
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  onOpenCart: () => void;
};

function CountBadge({ count, pulseKey }: { count: number; pulseKey: number | null }) {
  if (count <= 0) return null;
  return (
    <span
      key={pulseKey ?? "static"}
      className="absolute -start-0.5 -top-0.5 flex min-w-4.5 animate-zivo-zoom-in items-center justify-center rounded-full bg-gold-dark px-1 text-[10px] font-bold leading-4 text-background"
    >
      {formatNumber(count)}
    </span>
  );
}

export function Header({ onOpenSearch, onOpenMenu, onOpenCart }: HeaderProps) {
  const { itemCount, lastAddedAt } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const pathname = usePathname();

  const initials = user?.name.trim().slice(0, 2) ?? "";

  const handleLogout = () => {
    logout();
    toast.info("با موفقیت از حساب خارج شدید.");
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 shadow-soft backdrop-blur">
      {/* ---------- Desktop ---------- */}
      <div className="hidden lg:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
          <Logo size="md" className="shrink-0" />

          <button
            type="button"
            onClick={onOpenSearch}
            className="group flex h-11 max-w-xl flex-1 items-center gap-3 rounded-full border border-border bg-surface-secondary/60 px-4 text-start transition-colors hover:border-gold-dark hover:bg-surface-secondary"
          >
            <Search className="size-4.5 shrink-0 text-text-muted" aria-hidden />
            <span className="flex-1 truncate text-sm text-text-muted">
              جستجو در محصولات، برندها و دسته‌بندی‌ها…
            </span>
            <kbd className="hidden rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted xl:inline">
              /
            </kbd>
          </button>

          <div className="ms-auto flex shrink-0 items-center gap-1">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative"
              aria-label="علاقه‌مندی‌ها"
              asChild
            >
              <Link href={"/account/wishlist" as Route}>
                <Heart className="size-5" aria-hidden />
                <CountBadge count={wishlistCount} pulseKey={null} />
              </Link>
            </Button>

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative"
                  aria-label="حساب کاربری"
                >
                  {isAuthenticated && user ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {initials}
                    </span>
                  ) : (
                    <User className="size-5" aria-hidden />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-text">{user.name}</span>
                      <span className="text-xs font-normal text-text-secondary" dir="ltr">
                        {user.mobile}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={"/account" as Route}>حساب کاربری من</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={"/account/orders" as Route}>سفارش‌های من</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={"/account/wishlist" as Route}>علاقه‌مندی‌ها</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="size-4" aria-hidden />
                      خروج از حساب
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="pb-3 text-sm text-text-secondary">
                      به زیوو خوش آمدید
                    </DropdownMenuLabel>
                    <div className="flex gap-2 px-2 pb-2">
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={"/login" as Route}>ورود</Link>
                      </Button>
                      <Button size="sm" variant="outline-gold" className="flex-1" asChild>
                        <Link href={"/register" as Route}>ثبت‌نام</Link>
                      </Button>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={"/account/orders" as Route}>پیگیری سفارش</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={"/account/wishlist" as Route}>علاقه‌مندی‌ها</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative"
              aria-label="سبد خرید"
              onClick={onOpenCart}
            >
              <ShoppingBag className="size-5" aria-hidden />
              <CountBadge count={itemCount} pulseKey={lastAddedAt} />
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <MegaMenu />
        </div>
      </div>

      {/* ---------- Mobile ---------- */}
      <div className="relative flex h-16 items-center justify-between px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="باز کردن منو"
          onClick={onOpenMenu}
          className={cn(pathname === "/" && "text-primary")}
        >
          <Menu className="size-5" aria-hidden />
        </Button>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="جستجو"
            onClick={onOpenSearch}
          >
            <Search className="size-5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label="سبد خرید"
            onClick={onOpenCart}
          >
            <ShoppingBag className="size-5" aria-hidden />
            <CountBadge count={itemCount} pulseKey={lastAddedAt} />
          </Button>
        </div>
      </div>
    </header>
  );
}
