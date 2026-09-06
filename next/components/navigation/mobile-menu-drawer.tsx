"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Headset, LogOut, Percent } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/hooks/use-auth";
import type { Brand, Category } from "@/types";
import type { Route } from "next";

type MobileMenuDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileMenuDrawer({
  open,
  onOpenChange,
}: MobileMenuDrawerProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([catJson, brandJson]) => {
      if (catJson.success) setAllCategories(catJson.data);
      if (brandJson.success) setBrands(brandJson.data);
    }).catch(() => {});
  }, []);

  const topCategories = allCategories.filter((c) => c.parentId === null);
  const getSubcategories = (parentId: string) =>
    allCategories.filter((c) => c.parentId === parentId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-sm gap-0 overflow-y-auto p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="sr-only">منوی فروشگاه زیوو</SheetTitle>
          <SheetDescription className="sr-only">
            دسته‌بندی‌ها، برندها و دسترسی سریع به حساب کاربری
          </SheetDescription>
          <div className="flex items-center justify-between">
            <Logo size="sm" />
          </div>
        </SheetHeader>

        {/* Account quick access */}
        <div className="border-b border-border bg-surface-secondary/50 px-4 py-4">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text">{user.name}</p>
                <p className="text-xs text-text-secondary" dir="ltr">
                  {user.mobile}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  onOpenChange(false);
                }}
              >
                <LogOut className="size-4" aria-hidden />
                خروج
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">به زیوو خوش آمدید</p>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" asChild>
                  <Link href={"/login" as Route} onClick={() => onOpenChange(false)}>
                    ورود
                  </Link>
                </Button>
                <Button size="sm" variant="outline-gold" asChild>
                  <Link href={"/register" as Route} onClick={() => onOpenChange(false)}>
                    ثبت‌نام
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="px-4 py-4">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-text-muted">
            دسته‌بندی‌ها
          </p>
          <Accordion type="multiple" className="w-full">
            {topCategories.map((category) => {
              const subs = getSubcategories(category.id);
              return (
                <AccordionItem key={category.id} value={category.id} className="border-b-border/70">
                  <AccordionTrigger className="py-3 text-sm font-medium text-text">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 ps-1">
                      {subs.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/products?category=${sub.slug}` as Route}
                            onClick={() => onOpenChange(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
                          >
                            <ChevronLeft className="size-3.5 text-gold-dark" aria-hidden />
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={`/products?category=${category.slug}` as Route}
                          onClick={() => onOpenChange(false)}
                          className="inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold text-primary"
                        >
                          مشاهده همه {category.name}
                        </Link>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Brands */}
        <div className="border-t border-border px-4 py-4">
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-text-muted">
            برندها
          </p>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}` as Route}
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-gold-dark hover:text-primary"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Sale + support */}
        <div className="space-y-2 border-t border-border px-4 py-4">
          <Button
            variant="gold"
            className="w-full"
            asChild
          >
            <Link href={"/products?sort=discount" as Route} onClick={() => onOpenChange(false)}>
              <Percent className="size-4" aria-hidden />
              فروش ویژه
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={"/contact" as Route} onClick={() => onOpenChange(false)}>
              <Headset className="size-4" aria-hidden />
              پشتیبانی و تماس با ما
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
