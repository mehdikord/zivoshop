"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  LucideIcon,
} from "lucide-react";
import {
  Camera,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Send,
  Share2,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildMapEmbedUrl,
  formatRelativeTime,
  toEnglishDigits,
} from "@/lib/utils";
import type { SiteSettings } from "@/lib/site-settings-defs";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings-defs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

type FieldName = keyof SiteSettings;
type TabValue = "general" | "contact" | "social" | "map";

function emptySettings(): SiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
  };
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <h2 className="text-base font-bold text-[var(--text)]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-[var(--destructive)]">
      {error}
    </p>
  );
}

interface SettingsFieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function SettingsField({
  id,
  label,
  hint,
  required,
  error,
  className,
  children,
}: SettingsFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label
        htmlFor={id}
        className="text-sm font-medium text-[var(--text-secondary)]"
      >
        {label}
        {required ? (
          <span className="ms-0.5 text-[var(--destructive)]">*</span>
        ) : null}
      </Label>
      {children}
      {error ? <FieldError id={errorId} error={error} /> : null}
      {!error && hint ? (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export default function SiteSettingsPage() {
  const [form, setForm] = useState<SiteSettings>(emptySettings);
  const [saved, setSaved] = useState<SiteSettings>(emptySettings);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("general");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applyData = useCallback((data: SiteSettings & { updatedAt?: string | null }) => {
    const settings = {
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      contactAddress: data.contactAddress,
      contactHours: data.contactHours,
      contactInstagram: data.contactInstagram,
      contactTelegram: data.contactTelegram,
      contactWhatsapp: data.contactWhatsapp,
      mapLocation: data.mapLocation,
      mapLatitude: data.mapLatitude,
      mapLongitude: data.mapLongitude,
    };
    setForm(settings);
    setSaved(settings);
    setUpdatedAt(data.updatedAt ?? null);
    setErrors({});
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) applyData(data.data);
        else throw new Error(data.message || "خطا در دریافت تنظیمات");
      })
      .catch(() => {
        if (!cancelled) toast.error("خطای ارتباط با سرور در دریافت تنظیمات");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyData]);

  const setValue = (field: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): { tab: TabValue; message: string } | null => {
    const next: Partial<Record<FieldName, string>> = {};

    if (!form.siteName.trim()) next.siteName = "نام سایت الزامی است";

    const phoneDigits = toEnglishDigits(form.contactPhone).replace(/\D/g, "");
    if (!form.contactPhone.trim()) next.contactPhone = "تلفن تماس الزامی است";
    else if (phoneDigits.length < 6)
      next.contactPhone = "شماره تماس معتبر نیست";

    if (!form.contactEmail.trim()) next.contactEmail = "ایمیل الزامی است";
    else if (!EMAIL_RE.test(form.contactEmail.trim()))
      next.contactEmail = "ایمیل معتبر نیست";

    if (!form.contactAddress.trim()) next.contactAddress = "آدرس الزامی است";
    if (!form.contactHours.trim()) next.contactHours = "ساعت کاری الزامی است";

    if (!form.mapLocation.trim()) next.mapLocation = "موقعیت روی نقشه الزامی است";

    const lat = Number(form.mapLatitude);
    const lng = Number(form.mapLongitude);
    if (!form.mapLatitude.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90)
      next.mapLatitude = "عرض جغرافیایی را بین ۹۰- تا ۹۰ وارد کنید";
    if (!form.mapLongitude.trim() || !Number.isFinite(lng) || lng < -180 || lng > 180)
      next.mapLongitude = "طول جغرافیایی را بین ۱۸۰- تا ۱۸۰ وارد کنید";

    for (const key of ["contactInstagram", "contactTelegram", "contactWhatsapp"] as const) {
      const value = form[key].trim();
      if (value && !URL_RE.test(value)) next[key] = "لینک باید با http یا https شروع شود";
    }

    setErrors(next);

    const firstErrorField = (
      Object.keys(next) as FieldName[]
    )[0];
    if (firstErrorField) {
      const tabsByField: Partial<Record<FieldName, TabValue>> = {
        siteName: "general",
        siteDescription: "general",
        contactPhone: "contact",
        contactEmail: "contact",
        contactAddress: "contact",
        contactHours: "contact",
        contactInstagram: "social",
        contactTelegram: "social",
        contactWhatsapp: "social",
        mapLocation: "map",
        mapLatitude: "map",
        mapLongitude: "map",
      };
      return {
        tab: tabsByField[firstErrorField] ?? "general",
        message: next[firstErrorField] ?? "مقادیر واردشده را بررسی کنید",
      };
    }
    return null;
  };

  const handleSave = async () => {
    const firstError = validate();
    if (firstError) {
      setActiveTab(firstError.tab);
      toast.error(firstError.message);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "خطا در ذخیره تنظیمات");
        return;
      }
      applyData(data.data);
      toast.success("تنظیمات با موفقیت ذخیره شد");
    } catch {
      toast.error("خطای ارتباط با سرور در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const touches = Object.keys(form).filter(
    (key) => form[key as FieldName] !== saved[key as FieldName]
  );
  const hasChanges = touches.length > 0;

  const mapEmbedUrl = buildMapEmbedUrl(form.mapLatitude, form.mapLongitude);
  const openInMapHref = Number.isFinite(Number(form.mapLatitude)) &&
    Number.isFinite(Number(form.mapLongitude))
    ? `https://www.openstreetmap.org/?mlat=${Number(form.mapLatitude)}&mlon=${Number(form.mapLongitude)}#map=16/${Number(form.mapLatitude)}/${Number(form.mapLongitude)}`
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary)]">
            <Store className="size-5 text-white" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">تنظیمات</h1>
        </div>
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <Loader2 className="size-6 animate-spin text-[var(--text-muted)]" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary)]">
            <Store className="size-5 text-white" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">تنظیمات</h1>
            <p className="text-sm text-[var(--text-muted)]">
              مدیریت اطلاعات سایت، تماس با ما و شبکه‌های اجتماعی
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={hasChanges ? "warning" : "success"}>
            {hasChanges ? "تغییرات ذخیره‌نشده" : "همه تغییرات ذخیره شده است"}
          </Badge>
          <Badge variant="outline">
            آخرین بروزرسانی:{" "}
            {updatedAt ? formatRelativeTime(updatedAt) : "هنوز ذخیره نشده"}
          </Badge>
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            مشاهده صفحه تماس با ما
          </a>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="general">
            <Store className="size-4" aria-hidden />
            عمومی
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="size-4" aria-hidden />
            اطلاعات تماس
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="size-4" aria-hidden />
            شبکه‌های اجتماعی
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapPin className="size-4" aria-hidden />
            موقعیت مکانی
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              icon={Store}
              title="اطلاعات سایت"
              description="نام و توضیحات فروشگاه که در بخش‌های عمومی سایت نمایش داده می‌شود."
            />
            <div className="grid gap-5">
              <SettingsField
                id="site-name"
                label="نام سایت"
                required
                error={errors.siteName}
              >
                <Input
                  id="site-name"
                  value={form.siteName}
                  onChange={(e) => setValue("siteName", e.target.value)}
                  aria-invalid={!!errors.siteName}
                  aria-describedby={errors.siteName ? "site-name-error" : undefined}
                  placeholder="مثلاً زیوو"
                />
              </SettingsField>

              <SettingsField
                id="site-description"
                label="توضیحات سایت"
                hint="یک یا دو جمله‌ای که برند فروشگاه را معرفی می‌کند."
              >
                <Textarea
                  id="site-description"
                  rows={3}
                  value={form.siteDescription}
                  onChange={(e) => setValue("siteDescription", e.target.value)}
                  placeholder="فروشگاه آنلاین تخصصی پوشاک بانوان..."
                />
              </SettingsField>
            </div>
          </div>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="mt-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              icon={Phone}
              title="راه‌های ارتباطی"
              description="این اطلاعات در صفحه «تماس با ما» فروشگاه به مشتریان نمایش داده می‌شود."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <SettingsField
                id="contact-phone"
                label="تلفن تماس"
                required
                hint="همراه با کد شهر و خط تیره؛ مانند ۰۲۱-۲۶۲۹۰۰۰۰"
                error={errors.contactPhone}
              >
                <Input
                  id="contact-phone"
                  dir="ltr"
                  className="text-left"
                  value={form.contactPhone}
                  onChange={(e) => setValue("contactPhone", e.target.value)}
                  aria-invalid={!!errors.contactPhone}
                  aria-describedby={errors.contactPhone ? "contact-phone-error" : undefined}
                  placeholder="021-26290000"
                />
              </SettingsField>

              <SettingsField
                id="contact-email"
                label="ایمیل"
                required
                error={errors.contactEmail}
              >
                <Input
                  id="contact-email"
                  type="email"
                  dir="ltr"
                  className="text-left"
                  value={form.contactEmail}
                  onChange={(e) => setValue("contactEmail", e.target.value)}
                  aria-invalid={!!errors.contactEmail}
                  aria-describedby={errors.contactEmail ? "contact-email-error" : undefined}
                  placeholder="info@example.com"
                />
              </SettingsField>

              <SettingsField
                id="contact-address"
                label="آدرس"
                required
                className="md:col-span-2"
                error={errors.contactAddress}
              >
                <Textarea
                  id="contact-address"
                  rows={2}
                  value={form.contactAddress}
                  onChange={(e) => setValue("contactAddress", e.target.value)}
                  aria-invalid={!!errors.contactAddress}
                  aria-describedby={errors.contactAddress ? "contact-address-error" : undefined}
                  placeholder="شهر، خیابان، پلاک..."
                />
              </SettingsField>

              <SettingsField
                id="contact-hours"
                label="ساعت کاری"
                required
                className="md:col-span-2"
                error={errors.contactHours}
              >
                <Input
                  id="contact-hours"
                  value={form.contactHours}
                  onChange={(e) => setValue("contactHours", e.target.value)}
                  aria-invalid={!!errors.contactHours}
                  aria-describedby={errors.contactHours ? "contact-hours-error" : undefined}
                  placeholder="همه‌روزه ۹ صبح تا ۹ شب"
                />
              </SettingsField>
            </div>

            {/* Quick summary */}
            <div className="mt-6 grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span dir="ltr" className="truncate text-sm text-[var(--text-secondary)]">
                  {form.contactPhone || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span dir="ltr" className="truncate text-sm text-[var(--text-secondary)]">
                  {form.contactEmail || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span className="truncate text-sm text-[var(--text-secondary)]">
                  {form.contactAddress || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span className="truncate text-sm text-[var(--text-secondary)]">
                  {form.contactHours || "—"}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="mt-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              icon={Share2}
              title="شبکه‌های اجتماعی"
              description="لینک‌های شبکه‌های اجتماعی فروشگاه. برای حذف هر مورد، فیلد را خالی بگذارید."
            />
            <div className="grid gap-5">
              <SocialField
                id="contact-instagram"
                label="لینک اینستاگرام"
                icon={Camera}
                tone="text-[#c13584]"
                value={form.contactInstagram}
                onChange={(v) => setValue("contactInstagram", v)}
                error={errors.contactInstagram}
                placeholder="https://instagram.com/..."
              />
              <SocialField
                id="contact-telegram"
                label="لینک تلگرام"
                icon={Send}
                tone="text-[#229ed9]"
                value={form.contactTelegram}
                onChange={(v) => setValue("contactTelegram", v)}
                error={errors.contactTelegram}
                placeholder="https://t.me/..."
              />
              <SocialField
                id="contact-whatsapp"
                label="لینک واتس‌اپ"
                icon={MessageCircle}
                tone="text-[#25d366]"
                value={form.contactWhatsapp}
                onChange={(v) => setValue("contactWhatsapp", v)}
                error={errors.contactWhatsapp}
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </TabsContent>

        {/* Map */}
        <TabsContent value="map" className="mt-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              icon={MapPin}
              title="موقعیت روی نقشه"
              description="عرض و طول جغرافیایی فروشگاه را وارد کنید تا نقشه فروشگاه در صفحه تماس نمایش داده شود."
            />
            <div className="grid gap-5">
              <SettingsField
                id="map-location"
                label="مکان (متن نمایشی)"
                required
                error={errors.mapLocation}
              >
                <Input
                  id="map-location"
                  value={form.mapLocation}
                  onChange={(e) => setValue("mapLocation", e.target.value)}
                  aria-invalid={!!errors.mapLocation}
                  aria-describedby={errors.mapLocation ? "map-location-error" : undefined}
                  placeholder="تهران، خیابان ولیعصر، بالاتر از پارک ساعی"
                />
              </SettingsField>

              <div className="grid gap-5 sm:grid-cols-2">
                <SettingsField
                  id="map-latitude"
                  label="عرض جغرافیایی"
                  required
                  hint="مختصات Lat؛ مانند 35.7752"
                  error={errors.mapLatitude}
                >
                  <Input
                    id="map-latitude"
                    dir="ltr"
                    className="text-left"
                    inputMode="decimal"
                    value={form.mapLatitude}
                    onChange={(e) => setValue("mapLatitude", e.target.value)}
                    aria-invalid={!!errors.mapLatitude}
                    aria-describedby={errors.mapLatitude ? "map-latitude-error" : undefined}
                    placeholder="35.7752"
                  />
                </SettingsField>

                <SettingsField
                  id="map-longitude"
                  label="طول جغرافیایی"
                  required
                  hint="مختصات Lng؛ مانند 51.42"
                  error={errors.mapLongitude}
                >
                  <Input
                    id="map-longitude"
                    dir="ltr"
                    className="text-left"
                    inputMode="decimal"
                    value={form.mapLongitude}
                    onChange={(e) => setValue("mapLongitude", e.target.value)}
                    aria-invalid={!!errors.mapLongitude}
                    aria-describedby={errors.mapLongitude ? "map-longitude-error" : undefined}
                    placeholder="51.42"
                  />
                </SettingsField>
              </div>

              {/* Live preview */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    پیش‌نمایش نقشه
                  </p>
                  {openInMapHref ? (
                    <a
                      href={openInMapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
                    >
                      باز کردن در نقشه
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]">
                  {mapEmbedUrl ? (
                    <iframe
                      src={mapEmbedUrl}
                      title="پیش‌نمایش موقعیت فروشگاه روی نقشه"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-64 w-full sm:h-72"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center px-6 text-center">
                      <p className="text-sm text-[var(--text-muted)]">
                        برای نمایش نقشه، عرض و طول جغرافیایی معتبر وارد کنید.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft-lg)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span
            className={`size-2 rounded-full ${hasChanges ? "bg-[var(--warning)]" : "bg-[var(--success)]"}`}
            aria-hidden
          />
          {hasChanges ? (
            <span>تغییرات ذخیره‌نشده دارید.</span>
          ) : updatedAt ? (
            <span>
              آخرین ذخیره: {formatRelativeTime(updatedAt)}
            </span>
          ) : (
            <span>هنوز تنظیمی ذخیره نشده است.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setForm(saved);
              setErrors({});
              if (hasChanges) toast.info("تغییرات لغو شد");
            }}
            disabled={saving || !hasChanges}
          >
            بازگردانی
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="ml-2 size-4 animate-spin" aria-hidden />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="ml-2 size-4" aria-hidden />
                ذخیره تغییرات
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SocialField({
  id,
  label,
  icon: Icon,
  tone,
  value,
  onChange,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-[var(--text-secondary)]"
      >
        {label}
      </Label>
      <div className="relative">
        <div
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden
        >
          <Icon className={`size-4 ${tone}`} />
        </div>
        <Input
          id={id}
          dir="ltr"
          className="py-1.5 pl-3 pr-10 text-left"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={placeholder}
        />
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}