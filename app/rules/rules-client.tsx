"use client";

import {
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  UserCheck,
  FileText,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const RULES_SECTIONS = [
  {
    icon: ShoppingCart,
    title: "شرایط خرید",
    content: [
      "تمامی قیمت‌های درج‌شده در سایت به تومان است و شامل مالیات بر ارزش افزوده می‌باشد.",
      " ثبت سفارش به منزله تایید شرایط و قوانین زیوو است.",
      "زیوو این حق را برای خود محفوظ می‌دارد که در هر زمان قیمت‌ها و شرایط فروش را تغییر دهد.",
      "خریدار موظف است اطلاعات صحیح و کامل هنگام ثبت سفارش وارد کند. مسئولیت اطلاعات نادرست بر عهده خریدار است.",
      "در صورت عدم موجودی کالا پس از ثبت سفارش، مبلغ پرداختی ظرف ۲۴ ساعت کاری بازگشت داده می‌شود.",
      "استفاده از کدهای تخفیف و پیشنهادات ویژه طبق شرایط اعلام‌شده در زمان ارائه کد امکان‌پذیر است.",
    ],
  },
  {
    icon: CreditCard,
    title: "شرایط پرداخت",
    content: [
      "پرداخت از طریق درگاه بانکی امن (SSL 256-bit) انجام می‌شود.",
      "امکان پرداخت اینترنتی با کلیه کارت‌های عضو شتاب فراهم است.",
      "پرداخت درب منزل فقط برای سفارش‌های زیر ۵ میلیون تومان امکان‌پذیر است.",
      "در صورت لغو سفارش توسط مشتری پس از ارسال، هزینه ارسال غیرقابل بازگشت است.",
      "امکان اقساطی خرید برای سفارش‌های بالای ۳ میلیون تومان فراهم است.",
      "کلیه تراکنش‌ها و اطلاعات مالی شما نزد زیوو محرمانه و امن باقی می‌ماند.",
    ],
  },
  {
    icon: Truck,
    title: "شرایط ارسال",
    content: [
      "ارسال در تهران: ۱ تا ۲ روز کاری از طریق پیک موتوری و پست پیشتاز.",
      "ارسال در سایر شهرها: ۲ تا ۵ روز کاری از طریق پست پیشتاز و تیپاکس.",
      "ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان (فقط سفارش‌های پستی).",
      "هزینه ارسال پستی: ۴۵,۰۰۰ تومان. هزینه پیک تهران: ۳۵,۰۰۰ تومان.",
      "پس از ارسال، کد رهگیری از طریق پیامک برای شما ارسال می‌شود.",
      "مسئولیت تاخیر ناشی از شرایط جوی و نیروی انسانی خارج از کنترل زیوو نیست.",
    ],
  },
  {
    icon: RotateCcw,
    title: "شرایط مرجوعی",
    content: [
      "تا ۷ روز پس از تحویل سفارش، امکان مرجوع کردن کالا وجود دارد.",
      "کالا باید در بسته‌بندی اصلی، بدون استفاده و بدون آسیب باشد.",
      "محصولات زیر امکان مرجوعی ندارند: لباس زیر، جوراب و محصولات بهداشتی (به دلیل رعایت بهداشت).",
      "هزینه مرجوعی در صورت عیب کالا یا اشتباه زیوو، بر عهده زیوو است.",
      "در غیر این صورت، هزینه ارسال مرجوعی بر عهده مشتری است.",
      "مبلغ مرجوعی ظرف ۳ تا ۵ روز کاری پس از تایید کارشناسان ما، به حساب بانکی شما بازگشت داده می‌شود.",
    ],
  },
  {
    icon: Shield,
    title: "حریم خصوصی",
    content: [
      "اطلاعات شخصی شما (نام، شماره تماس، آدرس) فقط برای پردازش سفارشات استفاده می‌شود.",
      "زیوو اطلاعات شخصی شما را در اختیار هیچ شخص ثالثی قرار نمی‌دهد.",
      "تمامی اطلاعات شما با رمزنگاری AES-256 ذخیره و منتقل می‌شود.",
      "شما در هر زمان می‌توانید درخواست حذف اطلاعات خود را ارائه دهید.",
      "ما هرگز اطلاعات کارت بانکی شما را ذخیره نمی‌کنیم.",
      "استفاده از کوکی‌ها صرفاً برای بهبود تجربه کاربری و تحلیل ترافیک سایت است.",
    ],
  },
  {
    icon: UserCheck,
    title: "مسئولیت کاربر",
    content: [
      "کاربر متعهد است اطلاعات دقیق و صحیح هنگام ثبت‌نام و ثبت سفارش وارد کند.",
      "حفظ رمز عبور و اطلاعات حساب کاربری بر عهده کاربر است.",
      "هرگونه استفاده غیرمجاز از حساب کاربری باید فوراً به زیوو گزارش شود.",
      "کاربر حق استفاده تجاری از محتوای سایت را ندارد.",
      "ارسال نظرات توهین‌آمیز، نادرست یا خلاف قوانین ایران ممنوع است.",
      "حساب‌های کاربری که قوانین را نقض کنند بدون اطلاع قبلی مسدود خواهند شد.",
    ],
  },
  {
    icon: FileText,
    title: "شرایط استفاده از سایت",
    content: [
      "کلیه حقوق مادی و معنوی سایت متعلق به فروشگاه زیوو است.",
      "کپی‌برداری از محتوا، تصاویر و طراحی سایت بدون اجازه کتبی ممنوع است.",
      "زیوو این حق را برای خود محفوظ می‌دارد که در هر زمان شرایط استفاده را تغییر دهد.",
      "استفاده از ابزارهای خودکار برای دسترسی به سایت بدون اجازه ممنوع است.",
      "محتوای سایت ممکن است شامل اطلاعات نادرست باشد؛ زیوو تلاش می‌کند اما تضمینی نمی‌دهد.",
    ],
  },
  {
    icon: HelpCircle,
    title: "پشتیبانی",
    content: [
      "تیم پشتیبانی زیوو همه‌روزه از ساعت ۹ صبح تا ۹ شب پاسخگوی شماست.",
      "از طریق تلفن ۰۲۱-۲۶۲۹۰۰۰۰، ایمیل info@zivo.shop یا چت آنلاین می‌توانید تماس بگیرید.",
      "زمان پاسخ‌دهی به ایمیل‌ها حداکثر ۲۴ ساعت کاری است.",
      "برای پیگیری سفارشات از بخش «تاریخچه سفارش‌ها» در حساب کاربری استفاده کنید.",
      "شکایات و انتقادات سازنده ما را در بهبود خدمات یاری می‌دهند.",
    ],
  },
];

/**
 * Rules & Regulations page (PRD §37).
 * Accordion sections for different rule categories.
 */
export function RulesClient() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="mb-3 text-sm font-semibold tracking-widest text-gold">
            قوانین و مقررات
          </p>
          <h1 className="font-display text-3xl font-extrabold text-surface sm:text-4xl">
            شرایط استفاده از خدمات زیوو
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-surface/80">
            لطفاً پیش از خرید، شرایط و قوانین زیر را به دقت مطالعه کنید.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Accordion type="multiple" className="space-y-4">
          {RULES_SECTIONS.map((section, i) => (
            <AccordionItem
              key={section.title}
              value={`section-${i}`}
              className="rounded-2xl border border-border/40 bg-surface px-5 sm:px-6"
            >
              <AccordionTrigger className="text-base font-bold text-text hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold-light/40">
                    <section.icon className="size-4.5 text-gold-dark" />
                  </div>
                  <span>{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <ul className="space-y-3 pr-12">
                  {section.content.map((item, j) => (
                    <li
                      key={j}
                      className="relative flex items-start gap-2 text-sm leading-7 text-text-secondary"
                    >
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-dark" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Last updated */}
        <p className="mt-8 text-center text-xs text-text-muted">
          آخرین بروزرسانی: ۱۵ مرداد ۱۴۰۳
        </p>
      </div>
    </main>
  );
}
