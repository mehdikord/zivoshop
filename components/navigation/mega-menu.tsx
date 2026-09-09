"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Brand, Category } from "@/types";

const CLOSE_DELAY_MS = 140;

function CategoryNavItem({
  category,
  subcategories,
  brands,
  active,
  onActivate,
  onToggle,
  onDeactivate,
}: {
  category: Category;
  subcategories: Category[];
  brands: Brand[];
  active: boolean;
  onActivate: () => void;
  onToggle: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div
      className="h-full"
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
    >
      <button
        type="button"
        onClick={onToggle}
        onFocus={onActivate}
        aria-expanded={active}
        aria-haspopup="true"
        className={cn(
          "flex h-full items-center gap-1 px-3 text-sm font-medium transition-colors hover:text-primary",
          active
            ? "text-primary"
            : "text-text-secondary",
        )}
      >
        {category.name}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            active && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {active ? (
        <div className="absolute inset-x-0 top-full z-50">
          <div className="mx-auto max-w-7xl border-t border-border bg-surface px-6 py-8 shadow-soft-lg">
            <div className="grid grid-cols-12 gap-8">
              {/* Subcategories */}
              <div className="col-span-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                  دسته‌بندی‌های {category.name}
                </p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/products?category=${sub.slug}` as Route}
                        className="group flex items-center gap-2 py-1.5 text-sm text-text-secondary transition-colors hover:text-primary"
                      >
                        <span className="size-1.5 rounded-full bg-gold-dark/50 transition-colors group-hover:bg-gold-dark" />
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/products?category=${category.slug}` as Route}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  مشاهده همه {category.name}
                </Link>
              </div>

              {/* Popular brands */}
              <div className="col-span-3 border-s border-border ps-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                  برندهای محبوب
                </p>
                <ul className="space-y-1">
                  {brands.slice(0, 4).map((b) => (
                    <li key={b.id}>
                      <Link
                        href={`/products?brand=${b.slug}` as Route}
                        className="block py-1.5 text-sm text-text-secondary transition-colors hover:text-primary"
                      >
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Campaign image */}
              <div className="col-span-4">
                <Link
                  href={`/products?category=${category.slug}` as Route}
                  className="group relative block h-48 overflow-hidden rounded-xl"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 1280px) 33vw, 400px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-sm font-bold text-background">
                      کالکشن جدید {category.name}
                    </p>
                    <p className="mt-1 text-xs text-background/80">
                      طراحی‌های لوکس و روزمره
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BrandsNavItem({
  brands,
  active,
  onActivate,
  onToggle,
  onDeactivate,
}: {
  brands: Brand[];
  active: boolean;
  onActivate: () => void;
  onToggle: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div
      className="h-full"
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
    >
      <button
        type="button"
        onClick={onToggle}
        onFocus={onActivate}
        aria-expanded={active}
        aria-haspopup="true"
        className={cn(
          "flex h-full items-center gap-1 px-3 text-sm font-medium transition-colors hover:text-primary",
          active ? "text-primary" : "text-text-secondary",
        )}
      >
        برندها
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            active && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {active ? (
        <div className="absolute inset-x-0 top-full z-50">
          <div className="mx-auto max-w-7xl border-t border-border bg-surface px-6 py-8 shadow-soft-lg">
            <p className="mb-5 text-xs font-bold uppercase tracking-wider text-text-muted">
              برندهای فروشگاه زیوو
            </p>
            <div className="grid grid-cols-3 gap-4">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}` as Route}
                  className="group flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-gold-dark hover:bg-gold-light/30"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-light/70 text-sm font-bold text-primary">
                    {b.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-text">
                      {b.name}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-text-secondary">
                      {b.description}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MegaMenu() {
  const [active, setActive] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
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

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setActive(null);
    }, CLOSE_DELAY_MS);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const activate = (key: string) => {
    cancelClose();
    setActive(key);
  };

  const deactivate = () => {
    scheduleClose();
  };

  const toggle = (key: string) => {
    cancelClose();
    setActive((cur) => (cur === key ? null : key));
  };

  // Close on click outside and on Escape (keyboard support).
  useEffect(() => {
    if (!active) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (navRef.current && !navRef.current.contains(target)) {
        setActive(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  const navItems: {
    key: string;
    label: string;
    type: "link" | "category" | "brands";
    href?: Route;
    gold?: boolean;
  }[] = [
    { key: "newest", label: "جدیدترین‌ها", type: "link", href: "/products?sort=newest" as Route },
    ...topCategories.map((c) => ({
      key: c.id,
      label: c.name,
      type: "category" as const,
    })),
    { key: "brands", label: "برندها", type: "brands" },
    {
      key: "sale",
      label: "فروش ویژه",
      type: "link",
      href: "/products?sort=discount" as Route,
      gold: true,
    },
  ];

  return (
    <nav ref={navRef} aria-label="دسته‌بندی اصلی">
      <div
        className="relative flex h-12 items-stretch justify-between border-t border-border"
        onMouseLeave={deactivate}
      >
        {navItems.map((item) => {
          const isActive = active === item.key;

          if (item.type === "link") {
            return (
              <Link
                key={item.key}
                href={item.href ?? "/"}
                onClick={() => setActive(null)}
                className={cn(
                  "flex h-full items-center px-3 text-sm font-medium transition-colors",
                  item.gold
                    ? "text-gold-dark hover:text-primary"
                    : "text-text-secondary hover:text-primary",
                )}
              >
                {item.label}
                {item.gold ? (
                  <span className="ms-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                ) : null}
              </Link>
            );
          }

          if (item.type === "brands") {
            return (
              <BrandsNavItem
                key={item.key}
                brands={brands}
                active={isActive}
                onActivate={() => activate(item.key)}
                onToggle={() => toggle(item.key)}
                onDeactivate={deactivate}
              />
            );
          }

          const category = allCategories.find((c) => c.id === item.key);
          if (!category) return null;

          return (
            <CategoryNavItem
              key={item.key}
              category={category}
              subcategories={getSubcategories(item.key)}
              brands={brands}
              active={isActive}
              onActivate={() => activate(item.key)}
              onToggle={() => toggle(item.key)}
              onDeactivate={deactivate}
            />
          );
        })}
      </div>
    </nav>
  );
}
