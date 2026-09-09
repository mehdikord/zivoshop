"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Route } from "next";
import {
  AtSign,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types";

const quickLinks: { label: string; href: string }[] = [
  { label: "صفحه اصلی", href: "/" },
  { label: "همه محصولات", href: "/products" },
  { label: "جدیدترین‌ها", href: "/products?sort=newest" },
  { label: "فروش ویژه", href: "/products?sort=discount" },
];

const customerService: { label: string; href: string }[] = [
  { label: "درباره زیوو", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
  { label: "قوانین و مقررات", href: "/rules" },
  { label: "شرایط ارسال", href: "/rules" },
  { label: "شرایط مرجوعی", href: "/rules" },
];

const socialLinks = [
  { label: "اینستاگرام", icon: AtSign, href: "https://instagram.com" },
  { label: "تلگرام", icon: Send, href: "https://t.me" },
  { label: "واتس‌اپ", icon: MessageCircle, href: "https://wa.me" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [topCategories, setTopCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setTopCategories(
            json.data
              .filter((c: Category) => c.parentId === null)
              .slice(0, 5),
          );
        }
      })
      .catch(() => {});
  }, []);

  const subscribe = async () => {
    const value = email.trim();
    if (!value) {
      setError("لطفاً ایمیل خود را وارد کنید.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("ایمیل واردشده معتبر نیست.");
      return;
    }
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "عضویت شما در خبرنامه زیوو با موفقیت ثبت شد.");
        setEmail("");
      } else {
        setError(data.message || "خطا در عضویت. لطفاً دوباره تلاش کنید.");
      }
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <footer className="mt-auto">
      {/* Newsletter band */}
      <div className="bg-gold-light/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 text-center sm:py-12 lg:flex-row lg:justify-between lg:text-start">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-primary sm:text-2xl">
              از کالکشن‌های جدید و تخفیف‌ها زودتر خبردار شوید
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              با عضویت در خبرنامه زیوو، از تخفیف‌های اختصاصی، کالکشن‌های فصلی و
              راهنمای انتخاب لباس زیر باخبر شوید.
            </p>
          </div>
          <form
            className="w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              subscribe();
            }}
            noValidate
          >
            <div className="flex w-full gap-2">
              <Input
                type="email"
                dir="ltr"
                inputMode="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                aria-label="ایمیل برای عضویت در خبرنامه"
                aria-invalid={error ? true : undefined}
                className="h-12 border-gold-dark/40 bg-surface"
              />
              <Button
                type="submit"
                size="lg"
                className="shrink-0 px-6"
                aria-label="عضویت در خبرنامه"
              >
                عضویت
              </Button>
            </div>
            {error ? (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo tone="light" size="md" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-primary-foreground/75">
              زیوو فروشگاهی آنلاین و تخصصی در حوزه پوشاک بانوان است؛ از سوتین و
              شورت گرفته تا لباس خواب و لباس شب. با انتخاب دقیق برندها و تمرکز بر
              کیفیت، تجربه‌ای لوکس و مطمئن را برای شما رقم می‌زنیم.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-10 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-gold hover:bg-gold hover:text-primary"
                >
                  <s.icon className="size-4.5" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gold">دسته‌بندی‌ها</h3>
            <ul className="mt-5 space-y-3">
              {topCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}` as Route}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-gold"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick access */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gold">دسترسی سریع</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href as Route}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gold">خدمات مشتریان</h3>
            <ul className="mt-5 space-y-3">
              {customerService.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href as Route}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gold">ارتباط با ما</h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/75">
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-gold" aria-hidden />
                <span dir="ltr">021-26290000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-gold" aria-hidden />
                <span dir="ltr">info@zivo.shop</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>تهران، خیابان ولیعصر، بالاتر از پارک ساعی</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-gold" aria-hidden />
                <span>همه‌روزه ۹ تا ۲۱</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
            <p className="text-xs text-primary-foreground/60">
              © ۱۴۰۳ فروشگاه زیوو — تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/60">
              <span className="rounded-md border border-primary-foreground/15 px-2.5 py-1">
                نماد اعتماد الکترونیکی
              </span>
              <span className="rounded-md border border-primary-foreground/15 px-2.5 py-1">
                پرداخت امن
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
