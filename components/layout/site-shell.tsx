"use client";

import { useEffect, useState } from "react";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { MobileMenuDrawer } from "@/components/navigation/mobile-menu-drawer";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { useCartStore } from "@/stores/cart-store";

/**
 * Client shell that composes the storefront chrome around the page
 * content: announcement bar, sticky header (desktop + mobile), footer,
 * mobile bottom dock and the shared overlays (search, menu, cart).
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openCart = () => useCartStore.getState().setDrawerOpen(true);

  // "/" opens the search dialog from anywhere (PRD §7.1), unless the user
  // is already typing inside a form field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target?.closest(
        "input, textarea, [contenteditable='true'], select",
      );
      if (
        e.key === "/" &&
        !isTyping &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenCart={openCart}
      />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav
        onOpenMenu={() => setMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCart={openCart}
      />
      <MobileMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer />
    </div>
  );
}
