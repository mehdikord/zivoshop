"use client";

import Link from "next/link";
import {
  Heart,
  Star,
  Shield,
  Leaf,
  Award,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TEAM = [
  { name: "نیلوفر کاظمی", role: "بنیان‌گذار و مدیرعامل", initial: "ن" },
  { name: "الهام رضایی", role: "مدیر طراحی", initial: "ا" },
  { name: "مریم حسینی", role: "مدیر محصول", initial: "م" },
  { name: "زهرا عباسی", role: "مدیر بازاریابی", initial: "ز" },
];

const VALUES = [
  {
    icon: Shield,
    title: "کیفیت بی‌compromise",
    description:
      "هر محصول پیش از قرار گرفتن در فروشگاه، چندین مرحله کنترل کیفیت را پشت سر می‌گذارد. ما فقط برندهایی را همکاری می‌کنیم که استانداردهای سخت‌گیرانه ما را رعایت کنند.",
  },
  {
    icon: Heart,
    title: "راحتی در اولویت",
    description:
      "زیبایی بدون راحتی معنی ندارد. هر طراحی ما با در نظر گرفتن آناتومی بدن زن ایرانی و استفاده از پارچه‌های درجه یک انجام می‌شود.",
  },
  {
    icon: Leaf,
    title: "پایداری و مسئولیت",
    description:
      "از انتخاب مواد اولیه تا بسته‌بندی، به محیط زیست فکر می‌کنیم. بسته‌بندی‌های ما از مواد بازیافتی ساخته شده‌اند.",
  },
  {
    icon: Star,
    title: "تجربه لوکس",
    description:
      "خرید آنلاین لباس زیر باید تجربه‌ای راحت، امن و لذت‌بخش باشد. از انتخاب محصول تا تحویل بسته، همه چیز با دقت طراحی شده است.",
  },
];

const MILESTONES = [
  { year: "۱۳۹۸", title: "تاسیس زیوو", description: "شروع با ۱۲ محصول و یک وب‌سایت ساده" },
  { year: "۱۳۹۹", title: "گردش مالی ۱ میلیاردی", description: "رسیدن به ۱۰۰۰ مشتری فعال" },
  { year: "۱۴۰۰", title: "همکاری با ۵ برند", description: "扩充 به بیش از ۱۰۰ محصول متنوع" },
  { year: "۱۴۰۱", title: "انبار اختصاصی", description: "راه‌اندازی انبار و تیم لجستیک حرفه‌ای" },
  { year: "۱۴۰۲", title: "۵۰۰۰ مشتری", description: "رضایت ۹۸٪ مشتریان و ۱۲۰۰۰ سفارش موفق" },
  { year: "۱۴۰۳", title: "فروشگاه جدید", description: "طراحی مجدد وب‌سایت با تجربه کاربری نسل جدید" },
];

/**
 * About page (PRD §35).
 * Brand story, mission/vision, values, milestones, team, CTA.
 */
export function AboutClient() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 size-64 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-10 left-10 size-48 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="mb-4 text-sm font-semibold tracking-widest text-gold">
            داستان زیوو
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-relaxed text-surface sm:text-4xl lg:text-5xl">
            زیبایی را احساس کنید
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-surface/80 sm:text-lg">
            زیوو از یک ایده ساده شروع شد: زن ایرانی لایق بهترین لباس زیر
            است؛ با کیفیت بالا، طراحی زیبا و قیمت منصفانه.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold text-gold-dark">
              داستان ما
            </p>
            <h2 className="text-2xl font-extrabold text-text sm:text-3xl">
              از یک آرزو تا یک برند
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-text-secondary">
              <p>
                در سال ۱۳۹۸، وقتی نیلوفر کاظمی برای خرید یک سوتین ساده
                ساعت‌ها در فروشگاه‌های مختلف جستجو کرد و نتوانست محصولی پیدا
                کند که همزمان زیبا، راحت و با قیمت منصفانه باشد، تصمیم
                گرفت تغییری ایجاد کند.
              </p>
              <p>
                زیوو با هدف ایجاد تجربه‌ای متفاوت از خرید لباس زیر برای زن
                ایرانی متولد شد. ما باور داریم که هر زنی حق دارد احساس
                زیبایی و راحتی را همزمان تجربه کند.
              </p>
              <p>
                امروز زیوو با بیش از ۲۰۰ محصول از ۸ برند معتبر ایرانی و
                بین‌المللی، به بیش از ۵۰۰۰ مشتری فعال خدمات ارائه می‌دهد و
                رضایت ۹۸٪ مشتریان گواه کیفیت کار ماست.
              </p>
            </div>
          </div>

          {/* Decorative image placeholder */}
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl bg-surface-secondary">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-light/40 to-transparent" />
            <div className="relative text-center">
              <span className="font-display text-6xl font-extrabold text-primary/20 sm:text-7xl">
                Z
              </span>
              <p className="mt-2 text-sm text-text-muted">از ۱۳۹۸</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border/40 p-6 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Award className="size-6 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-text">ماموریت ما</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                فراهم کردن تجربه‌ای لوکس، راحت و قابل اعتماد از خرید لباس زیر
                برای هر زن ایرانی؛ با تمرکز بر کیفیت، تنوع و رضایت مشتری.
                ما می‌خواهیم خرید لباس زیر را از یک دغدغه به یک لذت تبدیل کنیم.
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 p-6 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gold/20">
                <Star className="size-6 text-gold-dark" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-text">چشم‌انداز ما</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                تبدیل شدن به محبوب‌ترین و معتبرترین فروشگاه آنلاین لباس زیر
                زنانه در ایران تا سال ۱۴۰۸؛ با بیش از ۲۰,۰۰۰ مشتری فعال و
                گستره محصولات شامل برندهای اختصاصی و بین‌المللی.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="mb-3 text-sm font-semibold text-gold-dark">
            ارزش‌های ما
          </p>
          <h2 className="text-2xl font-extrabold text-text sm:text-3xl">
            چه چیزی زیوو را متفاوت می‌کند؟
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="group rounded-2xl border border-border/40 bg-surface p-6 transition-all hover:border-gold-dark/30 hover:shadow-sm"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-gold-light/40 transition-colors group-hover:bg-gold-light/60">
                <value.icon className="size-5 text-gold-dark" />
              </div>
              <h3 className="mt-4 text-base font-bold text-text">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold text-gold-dark">
              مسیر رشد
            </p>
            <h2 className="text-2xl font-extrabold text-text sm:text-3xl">
              زیوو در یک نگاه
            </h2>
          </div>

          <div className="relative mt-12">
            {/* Vertical line */}
            <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-border md:right-1/2 md:-translate-x-px" />

            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute right-4 top-1 z-10 flex size-5 items-center justify-center rounded-full border-2 border-gold-dark bg-surface md:right-1/2 md:-translate-x-1/2">
                    <div className="size-2 rounded-full bg-gold-dark" />
                  </div>

                  {/* Content */}
                  <div
                    className={`mr-12 flex-1 md:mr-0 ${
                      i % 2 === 0 ? "md:pr-12 md:text-left" : "md:pl-12 md:text-right"
                    }`}
                  >
                    <span className="text-sm font-bold text-gold-dark">
                      {m.year}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-text">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {m.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="mb-3 text-sm font-semibold text-gold-dark">
            تیم ما
          </p>
          <h2 className="text-2xl font-extrabold text-text sm:text-3xl">
            آدم‌های پشت زیوو
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary">
            تیمی کوچک اما پرانرژی که هر روز تلاش می‌کند تجربه خرید شما
            بهتر شود.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">
                {member.initial}
              </div>
              <h3 className="mt-4 text-sm font-bold text-text">{member.name}</h3>
              <p className="mt-1 text-xs text-text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold text-surface sm:text-3xl">
            سوالی دارید؟
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-surface/80">
            تیم پشتیبانی زیوو آماده پاسخگویی به سوالات شماست. همین الان
            تماس بگیرید.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contact" as={undefined}>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-primary"
              >
                تماس با ما
                <ArrowLeft className="mr-2 size-4" />
              </Button>
            </Link>
            <a href="tel:02126290000" dir="ltr">
              <Button className="bg-surface text-primary hover:bg-surface/90">
                <Phone className="ml-2 size-4" />
                ۰۲۱-۲۶۲۹۰۰۰۰
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
