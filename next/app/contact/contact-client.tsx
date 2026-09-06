"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Loader2,
  MessageSquare,
  Camera,
  Send as Telegram,
  MessageCircle,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildMapEmbedUrl, toEnglishDigits } from "@/lib/utils";
import type { SiteSettingsResult } from "@/lib/site-settings-defs";

function digitsOnly(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}

/**
 * Contact page (PRD §36).
 * Contact info cards, social links, contact form with validation and an
 * embedded map. All contact details are driven by the admin site settings.
 */
export function ContactClient({ settings }: { settings: SiteSettingsResult }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});

  const contactInfo: {
    icon: LucideIcon;
    label: string;
    value: string;
    href?: string;
    dir?: "ltr";
  }[] = [
    {
      icon: Phone,
      label: "تلفن",
      value: settings.contactPhone,
      href: `tel:${digitsOnly(settings.contactPhone)}`,
      dir: "ltr",
    },
    {
      icon: Mail,
      label: "ایمیل",
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
      dir: "ltr",
    },
    {
      icon: MapPin,
      label: "آدرس",
      value: settings.contactAddress,
    },
    {
      icon: Clock,
      label: "ساعات کاری",
      value: settings.contactHours,
    },
  ];

  const socialLinks: {
    icon: LucideIcon;
    label: string;
    href: string;
    color: string;
  }[] = [
    settings.contactInstagram
      ? {
          icon: Camera,
          label: "اینستاگرام",
          href: settings.contactInstagram,
          color: "bg-pink-500/10 text-pink-600",
        }
      : null,
    settings.contactTelegram
      ? {
          icon: Telegram,
          label: "تلگرام",
          href: settings.contactTelegram,
          color: "bg-blue-500/10 text-blue-600",
        }
      : null,
    settings.contactWhatsapp
      ? {
          icon: MessageCircle,
          label: "واتس‌اپ",
          href: settings.contactWhatsapp,
          color: "bg-emerald-500/10 text-emerald-600",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const mapEmbedUrl = buildMapEmbedUrl(
    settings.mapLatitude,
    settings.mapLongitude
  );
  const mapLinkHref =
    Number.isFinite(Number(settings.mapLatitude)) &&
    Number.isFinite(Number(settings.mapLongitude))
      ? `https://www.openstreetmap.org/?mlat=${Number(settings.mapLatitude)}&mlon=${Number(settings.mapLongitude)}#map=16/${Number(settings.mapLatitude)}/${Number(settings.mapLongitude)}`
      : null;

  const telDigits = digitsOnly(settings.contactPhone);
  const telHref = telDigits ? `tel:${telDigits}` : "#";

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "نام الزامی است";
    if (!email.trim()) next.email = "ایمیل الزامی است";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "ایمیل معتبر نیست";
    if (!subject.trim()) next.subject = "موضوع الزامی است";
    if (!message.trim()) next.message = "پیام الزامی است";
    else if (message.trim().length < 10) next.message = "پیام باید حداقل ۱۰ کاراکتر باشد";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        toast.success(data.message || "پیام شما با موفقیت ارسال شد");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.message || "خطا در ارسال پیام. لطفاً دوباره تلاش کنید.");
      }
    } catch {
      setLoading(false);
      toast.error("خطای شبکه. لطفاً دوباره تلاش کنید.");
    }
  }

  function clearField(field: keyof typeof errors) {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="mb-3 text-sm font-semibold tracking-widest text-gold">
            ارتباط با ما
          </p>
          <h1 className="font-display text-3xl font-extrabold text-surface sm:text-4xl">
            در خدمت شما هستیم
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-surface/80">
            سوال، پیشنهاد یا انتقادی دارید؟ ما همیشه آماده شنیدن صدای شما
            هستیم.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Contact info cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/40 bg-surface p-5 transition-all hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold-light/40">
                <item.icon className="size-5 text-gold-dark" />
              </div>
              <p className="mt-3 text-sm font-bold text-text">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  dir={item.dir}
                  className="mt-1 block break-words text-sm text-text-secondary transition-colors hover:text-primary"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-sm text-text-secondary">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border/40 bg-surface p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2">
                <MessageSquare className="size-5 text-gold-dark" />
                <h2 className="text-lg font-bold text-text">ارسال پیام</h2>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name + Email row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">نام</Label>
                    <Input
                      id="contact-name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearField("name");
                      }}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "contact-name-err" : undefined}
                      placeholder="نام خود را وارد کنید"
                    />
                    {errors.name ? (
                      <p id="contact-name-err" className="text-xs text-destructive">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">ایمیل</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      dir="ltr"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearField("email");
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "contact-email-err" : undefined}
                    />
                    {errors.email ? (
                      <p id="contact-email-err" className="text-xs text-destructive">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">موضوع</Label>
                  <Input
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      clearField("subject");
                    }}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "contact-subject-err" : undefined}
                    placeholder="موضوع پیام"
                  />
                  {errors.subject ? (
                    <p id="contact-subject-err" className="text-xs text-destructive">
                      {errors.subject}
                    </p>
                  ) : null}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="contact-message">پیام</Label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearField("message");
                    }}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "contact-message-err" : undefined}
                    placeholder="پیام خود را بنویسید..."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  {errors.message ? (
                    <p id="contact-message-err" className="text-xs text-destructive">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="ml-2 size-4 animate-spin" />
                  ) : (
                    <Send className="ml-2 size-4" />
                  )}
                  ارسال پیام
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-2">
            {/* Social links */}
            <div className="rounded-2xl border border-border/40 bg-surface p-6">
              <h3 className="mb-4 text-base font-bold text-text">
                شبکه‌های اجتماعی
              </h3>
              {socialLinks.length > 0 ? (
                <div className="space-y-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border/40 p-3 transition-all hover:border-gold-dark/30 hover:shadow-sm"
                    >
                      <div
                        className={`flex size-9 items-center justify-center rounded-lg ${social.color}`}
                      >
                        <social.icon className="size-5" />
                      </div>
                      <span className="text-sm font-medium text-text">
                        {social.label}
                      </span>
                      <ExternalLink className="mr-auto size-3.5 text-text-muted" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  لینک شبکه‌های اجتماعی هنوز ثبت نشده است.
                </p>
              )}
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-surface">
              {mapEmbedUrl ? (
                <div className="relative">
                  <div className="flex aspect-video items-center justify-center bg-surface-secondary">
                    <iframe
                      src={mapEmbedUrl}
                      title={`موقعیت فروشگاه روی نقشه — ${settings.mapLocation}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full"
                    />
                  </div>
                  {mapLinkHref ? (
                    <a
                      href={mapLinkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-medium text-text shadow-sm backdrop-blur transition-colors hover:text-primary"
                    >
                      <ExternalLink className="size-3.5" />
                      باز کردن در نقشه
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-surface-secondary">
                  <div className="px-4 text-center">
                    <MapPin className="mx-auto size-10 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">
                      {settings.mapLocation || "موقعیت فروشگاه"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick call */}
            <div className="rounded-2xl border border-gold-dark/20 bg-gold-light/20 p-5">
              <h3 className="text-base font-bold text-text">
                نیاز به راهنمایی فوری؟
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                تیم پشتیبانی ما آماده پاسخگویی است.
              </p>
              <a href={telHref} dir="ltr" className="mt-3 inline-block">
                <Button variant="gold" size="sm">
                  <Phone className="ml-1.5 size-4" />
                  {settings.contactPhone}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}