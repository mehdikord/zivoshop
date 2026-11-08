"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  FileText,
  ImageIcon,
  Library,
  Loader2,
  Palette,
  Ruler,
  Save,
  Search,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { toEnglishDigits } from "@/lib/utils";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import type { MediaItem } from "@/components/admin/media/media-helpers";

interface Option { id: string; name: string; }
interface Color extends Option { hex: string; }

interface ProductImage { path: string; alt: string; }

interface ProductFormProps {
  mode: "create" | "edit";
  /** Required in edit mode. */
  productId?: string;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  brandId: string;
  price: string;
  discountPrice: string;
  discountPercent: string;
  stock: string;
  status: string;
  isNew: boolean;
  isBestseller: boolean;
  seoTitle: string;
  seoDescription: string;
  sortOrder: string;
  colorIds: string[];
  sizeIds: string[];
  images: ProductImage[];
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  brandId: "",
  price: "",
  discountPrice: "",
  discountPercent: "",
  stock: "0",
  status: "active",
  isNew: false,
  isBestseller: false,
  seoTitle: "",
  seoDescription: "",
  sortOrder: "0",
  colorIds: [],
  sizeIds: [],
  images: [],
};

const STATUS_OPTIONS = [
  { value: "active", label: "فعال", hint: "در فروشگاه نمایش داده می‌شود", dot: "var(--success)" },
  { value: "draft", label: "پیش‌نویس", hint: "فقط در پنل مدیریت قابل مشاهده است", dot: "var(--warning)" },
  { value: "archived", label: "بایگانی", hint: "از فروشگاه حذف و نگهداری می‌شود", dot: "var(--text-muted)" },
];

/** Unicode-aware slug: keeps Persian/Latin letters and digits, joins words with "-". */
function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatToman(value: string): string {
  const n = Number(value);
  if (!value || !Number.isFinite(n) || n <= 0) return "";
  return `${n.toLocaleString("fa-IR")} تومان`;
}

function productToForm(p: Record<string, unknown>): FormState {
  const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  return {
    name: str(p.name),
    slug: str(p.slug),
    description: str(p.description),
    categoryId: str(p.categoryId),
    brandId: str(p.brandId),
    price: str(p.price),
    discountPrice: str(p.discountPrice),
    discountPercent: str(p.discountPercent),
    stock: str(p.stock ?? 0),
    status: str(p.status) || "active",
    isNew: Boolean(p.isNew),
    isBestseller: Boolean(p.isBestseller),
    seoTitle: str(p.seoTitle),
    seoDescription: str(p.seoDescription),
    sortOrder: str(p.sortOrder ?? 0),
    colorIds: ((p.colors as { id: string }[] | undefined) ?? []).map((c) => c.id),
    sizeIds: ((p.sizes as { id: string }[] | undefined) ?? []).map((s) => s.id),
    images: ((p.images as { path: string; alt: string | null }[] | undefined) ?? []).map((img) => ({
      path: img.path,
      alt: img.alt ?? "",
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*                               Small UI pieces                              */
/* -------------------------------------------------------------------------- */

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15 aria-[invalid=true]:border-[var(--destructive)]";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--text)]";

function Card({
  icon: Icon,
  title,
  description,
  action,
  children,
  id,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)]">
            <Icon className="size-[18px]" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[var(--text)]">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Required() {
  return <span className="ms-0.5 text-[var(--destructive)]">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1.5 text-xs text-[var(--destructive)]">{message}</p>;
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 transition-colors hover:border-[var(--primary)]/40">
      <span className="flex items-center gap-2.5">
        <Icon className="size-4 text-[var(--primary)]" aria-hidden />
        <span>
          <span className="block text-sm font-medium text-[var(--text)]">{label}</span>
          <span className="block text-[11px] text-[var(--text-muted)]">{hint}</span>
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-5 w-9 shrink-0 rounded-full bg-[var(--border)] transition-colors peer-checked:bg-[var(--primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]/30 after:absolute after:top-0.5 after:right-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:-translate-x-4"
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Main form                                  */
/* -------------------------------------------------------------------------- */

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [initial, setInitial] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [allSizes, setAllSizes] = useState<Option[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [colorQuery, setColorQuery] = useState("");

  /* ----------------------------- Data loading ----------------------------- */
  useEffect(() => {
    let cancelled = false;
    const lookups = Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
      fetch("/api/admin/colors?pageSize=500").then((r) => r.json()),
      fetch("/api/admin/sizes?pageSize=500").then((r) => r.json()),
    ]);
    const productReq =
      mode === "edit" && productId
        ? fetch(`/api/admin/products/${productId}`).then((r) => r.json())
        : Promise.resolve(null);

    Promise.all([lookups, productReq])
      .then(([[cat, brand, color, size], product]) => {
        if (cancelled) return;
        if (cat.success) setCategories(cat.data);
        if (brand.success) setBrands(brand.data);
        if (color.success) setAllColors(color.data);
        if (size.success) setAllSizes(size.data);
        if (mode === "edit") {
          if (product?.success) {
            const next = productToForm(product.data);
            setForm(next);
            setInitial(next);
          } else {
            setNotFound(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("خطا در دریافت اطلاعات");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, productId]);

  /* --------------------------- Dirty-state guard -------------------------- */
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial],
  );

  useEffect(() => {
    if (!isDirty || saving) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, saving]);

  /* -------------------------------- Helpers ------------------------------- */
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleNameChange = (value: string) => {
    set("name", value);
    if (autoSlug) set("slug", toSlug(value));
  };

  const toggleId = (key: "colorIds" | "sizeIds", id: string) => {
    set(
      key,
      form[key].includes(id) ? form[key].filter((x) => x !== id) : [...form[key], id],
    );
  };

  const addImages = (items: ProductImage[]) => {
    setForm((prev) => {
      const existing = new Set(prev.images.map((img) => img.path));
      return {
        ...prev,
        images: [...prev.images, ...items.filter((i) => !existing.has(i.path))],
      };
    });
  };

  const moveImage = (from: number, to: number) => {
    setForm((prev) => {
      if (to < 0 || to >= prev.images.length) return prev;
      const images = [...prev.images];
      const [item] = images.splice(from, 1);
      images.splice(to, 0, item!);
      return { ...prev, images };
    });
  };

  const removeImage = (idx: number) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        addImages(data.data);
        toast.success(`${(data.data.length as number).toLocaleString("fa-IR")} تصویر آپلود شد`);
      } else {
        toast.error(data.message || "خطا در آپلود");
      }
    } catch {
      toast.error("خطا در آپلود تصاویر");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ------------------------------ Derived data ---------------------------- */
  const priceNum = Number(form.price) || 0;
  const discountNum = Number(form.discountPrice) || 0;
  const computedPercent =
    priceNum > 0 && discountNum > 0 && discountNum < priceNum
      ? Math.round((1 - discountNum / priceNum) * 100)
      : null;

  const filteredColors = colorQuery.trim()
    ? allColors.filter((c) => c.name.includes(colorQuery.trim()))
    : allColors;

  const seoTitlePreview = form.seoTitle || form.name || "عنوان محصول";
  const seoDescPreview =
    form.seoDescription || form.description.slice(0, 160) || "توضیحات متا در نتایج جستجو اینجا نمایش داده می‌شود.";

  /* -------------------------------- Submit -------------------------------- */
  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "نام محصول الزامی است";
    if (!form.slug.trim()) next.slug = "نامک (Slug) الزامی است";
    if (!form.categoryId) next.categoryId = "دسته‌بندی را انتخاب کنید";
    if (!form.brandId) next.brandId = "برند را انتخاب کنید";
    if (!priceNum || priceNum <= 0) next.price = "قیمت معتبر وارد کنید";
    if (discountNum && discountNum >= priceNum)
      next.discountPrice = "قیمت تخفیف باید کمتر از قیمت اصلی باشد";
    const pct = Number(form.discountPercent);
    if (form.discountPercent && (pct < 0 || pct > 100))
      next.discountPercent = "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد";
    setErrors(next);
    return Object.values(next)[0] ?? null;
  };

  const handleSave = async () => {
    const firstError = validate();
    if (firstError) {
      toast.error(firstError);
      return;
    }

    setSaving(true);
    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description,
          categoryId: form.categoryId,
          brandId: form.brandId,
          price: priceNum,
          discountPrice: discountNum || null,
          discountPercent: form.discountPercent ? Number(form.discountPercent) : computedPercent,
          stock: Number(form.stock) || 0,
          status: form.status,
          isNew: form.isNew,
          isBestseller: form.isBestseller,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          sortOrder: Number(form.sortOrder) || 0,
          colorIds: form.colorIds,
          sizeIds: form.sizeIds,
          images: form.images,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "create" ? "محصول با موفقیت ایجاد شد" : "تغییرات محصول ذخیره شد");
        setInitial(form);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(data.message || "خطا در ذخیره");
        setSaving(false);
      }
    } catch {
      toast.error("خطای ارتباط با سرور");
      setSaving(false);
    }
  };

  /* -------------------------------- Render -------------------------------- */
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-[var(--text-muted)]" aria-hidden />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
        <p className="text-base font-bold text-[var(--text)]">محصول مورد نظر یافت نشد</p>
        <Link href="/admin/products" className="text-sm text-[var(--primary)] hover:underline">
          بازگشت به فهرست محصولات
        </Link>
      </div>
    );
  }

  const title = mode === "create" ? "افزودن محصول جدید" : "ویرایش محصول";
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === form.status) ?? STATUS_OPTIONS[0]!;

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* ------------------------------ Header ------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            aria-label="بازگشت به فهرست محصولات"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[var(--text)] sm:text-2xl">{title}</h1>
            <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">
              {mode === "edit" && initial.name ? initial.name : "اطلاعات محصول را تکمیل و ذخیره کنید"}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {mode === "edit" && initial.slug ? (
            <a
              href={`/products/${initial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <ExternalLink className="size-4" aria-hidden />
              مشاهده در فروشگاه
            </a>
          ) : null}
          <Link
            href="/admin/products"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
          >
            انصراف
          </Link>
          <SaveButton saving={saving} mode={mode} onClick={handleSave} />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------------------------- Main column --------------------------- */}
        <div className="space-y-6">
          <Card icon={FileText} title="اطلاعات پایه" description="نام، نامک و توضیحات محصول">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="pf-name" className={labelClass}>نام محصول<Required /></label>
                <input
                  id="pf-name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  aria-invalid={!!errors.name}
                  className={inputClass}
                  placeholder="مثلاً ست سوتین و شورت توری"
                />
                <FieldError message={errors.name} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pf-slug" className={labelClass}>نامک (Slug)<Required /></label>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15" dir="ltr">
                  <span className="flex items-center bg-[var(--surface-secondary)] px-3 text-xs text-[var(--text-muted)]">/products/</span>
                  <input
                    id="pf-slug"
                    value={form.slug}
                    onChange={(e) => { set("slug", e.target.value); setAutoSlug(false); }}
                    aria-invalid={!!errors.slug}
                    className="min-w-0 flex-1 bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none"
                    placeholder="product-slug"
                  />
                </div>
                <FieldError message={errors.slug} />
                {!errors.slug ? (
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    {autoSlug ? "به‌صورت خودکار از نام محصول ساخته می‌شود." : "آدرس صفحه محصول در فروشگاه."}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="pf-desc" className="text-sm font-medium text-[var(--text)]">توضیحات</label>
                  <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
                    {form.description.length.toLocaleString("fa-IR")} کاراکتر
                  </span>
                </div>
                <textarea
                  id="pf-desc"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={7}
                  className={`${inputClass} resize-y leading-7`}
                  placeholder="جنس، ویژگی‌ها، نحوه نگهداری و نکات مهم محصول را بنویسید..."
                />
              </div>
            </div>
          </Card>

          <Card
            icon={ImageIcon}
            title="تصاویر محصول"
            description="تصویر اول به‌عنوان تصویر اصلی نمایش داده می‌شود. ترتیب را با فلش‌ها تغییر دهید."
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                >
                  <Library className="size-4" aria-hidden />
                  کتابخانه رسانه
                </button>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
                  {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
                  {uploading ? "در حال آپلود..." : "آپلود تصویر"}
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            }
          >
            {form.images.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {form.images.map((img, idx) => (
                  <li
                    key={img.path}
                    className={`group relative overflow-hidden rounded-xl border bg-[var(--background)] ${idx === 0 ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/15 sm:col-span-2 sm:row-span-2" : "border-[var(--border)]"}`}
                  >
                    <img src={img.path} alt={img.alt} className="aspect-square w-full object-cover" />
                    {idx === 0 ? (
                      <span className="absolute top-2 right-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary-foreground)]">
                        تصویر اصلی
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <div className="flex gap-1">
                        <IconBtn label="جابجایی به راست" disabled={idx === 0} onClick={() => moveImage(idx, idx - 1)}>
                          <ArrowRight className="size-3.5" />
                        </IconBtn>
                        <IconBtn label="جابجایی به چپ" disabled={idx === form.images.length - 1} onClick={() => moveImage(idx, idx + 1)}>
                          <ArrowLeft className="size-3.5" />
                        </IconBtn>
                        {idx !== 0 ? (
                          <IconBtn label="تنظیم به‌عنوان تصویر اصلی" onClick={() => moveImage(idx, 0)}>
                            <Star className="size-3.5" />
                          </IconBtn>
                        ) : null}
                      </div>
                      <IconBtn label="حذف تصویر" danger onClick={() => removeImage(idx)}>
                        <Trash2 className="size-3.5" />
                      </IconBtn>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] px-6 py-12 text-center transition-colors hover:border-[var(--primary)]/50">
                <span className="flex size-12 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--primary)]">
                  <Upload className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-[var(--text)]">برای آپلود تصویر کلیک کنید</span>
                <span className="text-xs text-[var(--text-muted)]">JPG، PNG یا WebP — حداکثر ۵ مگابایت</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card
              icon={Palette}
              title="رنگ‌ها"
              description={`${form.colorIds.length.toLocaleString("fa-IR")} رنگ انتخاب شده`}
            >
              {allColors.length > 8 ? (
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
                  <input
                    value={colorQuery}
                    onChange={(e) => setColorQuery(e.target.value)}
                    className={`${inputClass} pr-9 py-2`}
                    placeholder="جستجوی رنگ..."
                  />
                </div>
              ) : null}
              <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
                {filteredColors.map((c) => {
                  const active = form.colorIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleId("colorIds", c.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)]"}`}
                    >
                      <span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  );
                })}
                {filteredColors.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">رنگی یافت نشد.</p>
                ) : null}
              </div>
            </Card>

            <Card
              icon={Ruler}
              title="سایزها"
              description={`${form.sizeIds.length.toLocaleString("fa-IR")} سایز انتخاب شده`}
            >
              <div className="flex flex-wrap gap-2">
                {allSizes.map((s) => {
                  const active = form.sizeIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleId("sizeIds", s.id)}
                      className={`min-w-11 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${active ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)]"}`}
                    >
                      {s.name}
                    </button>
                  );
                })}
                {allSizes.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">هنوز سایزی تعریف نشده است.</p>
                ) : null}
              </div>
            </Card>
          </div>

          <Card icon={Search} title="سئو (SEO)" description="نحوه نمایش محصول در نتایج موتورهای جستجو">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="pf-seo-title" className="text-sm font-medium text-[var(--text)]">عنوان سئو</label>
                  <span className={`text-[11px] tabular-nums ${form.seoTitle.length > 60 ? "text-[var(--warning)]" : "text-[var(--text-muted)]"}`}>
                    {form.seoTitle.length.toLocaleString("fa-IR")} / ۶۰
                  </span>
                </div>
                <input id="pf-seo-title" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputClass} placeholder="خالی بگذارید تا از نام محصول استفاده شود" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="pf-seo-desc" className="text-sm font-medium text-[var(--text)]">توضیحات متا</label>
                  <span className={`text-[11px] tabular-nums ${form.seoDescription.length > 160 ? "text-[var(--warning)]" : "text-[var(--text-muted)]"}`}>
                    {form.seoDescription.length.toLocaleString("fa-IR")} / ۱۶۰
                  </span>
                </div>
                <textarea id="pf-seo-desc" value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="خلاصه‌ای جذاب از محصول برای نتایج جستجو" />
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-2 text-[11px] font-medium text-[var(--text-muted)]">پیش‌نمایش در گوگل</p>
                <p className="truncate text-xs text-[var(--success)]" dir="ltr">zivo.shop › products › {form.slug || "…"}</p>
                <p className="mt-1 line-clamp-1 text-base font-medium text-[var(--info)]">{seoTitlePreview}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">{seoDescPreview}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ---------------------------- Side column --------------------------- */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          <Card icon={Sparkles} title="وضعیت انتشار">
            <div className="space-y-2" role="radiogroup" aria-label="وضعیت محصول">
              {STATUS_OPTIONS.map((opt) => {
                const active = form.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("status", opt.value)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-start transition-colors ${active ? "border-[var(--primary)] bg-[var(--surface-secondary)]" : "border-[var(--border)] hover:border-[var(--primary)]/40"}`}
                  >
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: opt.dot }} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-[var(--text)]">{opt.label}</span>
                      <span className="block text-[11px] text-[var(--text-muted)]">{opt.hint}</span>
                    </span>
                    <span className={`size-4 shrink-0 rounded-full ${active ? "border-[5px] border-[var(--primary)]" : "border-2 border-[var(--border)]"}`} aria-hidden />
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              <Toggle icon={Sparkles} label="محصول جدید" hint="نمایش برچسب «جدید»" checked={form.isNew} onChange={(v) => set("isNew", v)} />
              <Toggle icon={Star} label="پرفروش" hint="نمایش در بخش پرفروش‌ها" checked={form.isBestseller} onChange={(v) => set("isBestseller", v)} />
            </div>
          </Card>

          <Card icon={Tag} title="دسته‌بندی و برند">
            <div className="space-y-4">
              <div>
                <label htmlFor="pf-cat" className={labelClass}>دسته‌بندی<Required /></label>
                <select id="pf-cat" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} aria-invalid={!!errors.categoryId} className={inputClass}>
                  <option value="">انتخاب کنید</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <FieldError message={errors.categoryId} />
              </div>
              <div>
                <label htmlFor="pf-brand" className={labelClass}>برند<Required /></label>
                <select id="pf-brand" value={form.brandId} onChange={(e) => set("brandId", e.target.value)} aria-invalid={!!errors.brandId} className={inputClass}>
                  <option value="">انتخاب کنید</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <FieldError message={errors.brandId} />
              </div>
              <div>
                <label htmlFor="pf-sort" className={labelClass}>ترتیب نمایش</label>
                <input id="pf-sort" inputMode="numeric" value={form.sortOrder} onChange={(e) => set("sortOrder", toEnglishDigits(e.target.value).replace(/\D/g, ""))} className={inputClass} dir="ltr" />
              </div>
            </div>
          </Card>

          <Card icon={Wallet} title="قیمت و موجودی">
            <div className="space-y-4">
              <div>
                <label htmlFor="pf-price" className={labelClass}>قیمت (تومان)<Required /></label>
                <input id="pf-price" inputMode="numeric" value={form.price} onChange={(e) => set("price", toEnglishDigits(e.target.value).replace(/\D/g, ""))} aria-invalid={!!errors.price} className={inputClass} dir="ltr" placeholder="0" />
                <FieldError message={errors.price} />
                {!errors.price && form.price ? <p className="mt-1 text-xs text-[var(--text-muted)]">{formatToman(form.price)}</p> : null}
              </div>
              <div className="grid grid-cols-[1fr_88px] gap-3">
                <div>
                  <label htmlFor="pf-dprice" className={labelClass}>قیمت با تخفیف</label>
                  <input id="pf-dprice" inputMode="numeric" value={form.discountPrice} onChange={(e) => set("discountPrice", toEnglishDigits(e.target.value).replace(/\D/g, ""))} aria-invalid={!!errors.discountPrice} className={inputClass} dir="ltr" placeholder="اختیاری" />
                </div>
                <div>
                  <label htmlFor="pf-dpct" className={labelClass}>درصد</label>
                  <input id="pf-dpct" inputMode="numeric" value={form.discountPercent} onChange={(e) => set("discountPercent", toEnglishDigits(e.target.value).replace(/\D/g, ""))} aria-invalid={!!errors.discountPercent} className={inputClass} dir="ltr" placeholder={computedPercent ? String(computedPercent) : "%"} />
                </div>
              </div>
              <FieldError message={errors.discountPrice ?? errors.discountPercent} />
              {computedPercent && !errors.discountPrice ? (
                <div className="flex items-center justify-between rounded-lg bg-[var(--success-light)] px-3 py-2 text-xs text-[var(--success)]">
                  <span>قیمت نهایی: {formatToman(form.discountPrice)}</span>
                  <span className="font-bold">{computedPercent.toLocaleString("fa-IR")}٪ تخفیف</span>
                </div>
              ) : null}
              <div>
                <label htmlFor="pf-stock" className={labelClass}>موجودی انبار</label>
                <input id="pf-stock" inputMode="numeric" value={form.stock} onChange={(e) => set("stock", toEnglishDigits(e.target.value).replace(/\D/g, ""))} className={inputClass} dir="ltr" />
                {Number(form.stock) <= 5 ? (
                  <p className="mt-1 text-xs text-[var(--warning)]">
                    {Number(form.stock) === 0 ? "این محصول ناموجود نمایش داده می‌شود." : "موجودی کم است."}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--text-muted)] lg:flex">
            <span className="size-2 rounded-full" style={{ backgroundColor: isDirty ? "var(--warning)" : currentStatus.dot }} aria-hidden />
            {isDirty ? "تغییرات ذخیره‌نشده دارید" : `وضعیت: ${currentStatus.label}`}
          </div>
        </aside>
      </div>

      {/* ------------------------- Bottom actions (desktop) ------------------------ */}
      <div className="hidden items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-soft)] lg:flex">
        <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span className="size-2 rounded-full" style={{ backgroundColor: isDirty ? "var(--warning)" : "var(--success)" }} aria-hidden />
          {isDirty ? "تغییرات ذخیره‌نشده دارید" : "همه تغییرات ذخیره شده است"}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
          >
            انصراف
          </Link>
          <SaveButton saving={saving} mode={mode} onClick={handleSave} />
        </div>
      </div>

      {/* ------------------------ Mobile sticky save bar ----------------------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-xs text-[var(--text-muted)]">
          {isDirty ? "تغییرات ذخیره‌نشده" : "بدون تغییر"}
        </span>
        <div className="flex items-center gap-2">
          <Link href="/admin/products" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)]">
            انصراف
          </Link>
          <SaveButton saving={saving} mode={mode} onClick={handleSave} />
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple
        accept="image"
        title="انتخاب تصاویر محصول"
        onSelect={(items: MediaItem[]) => {
          if (items.length === 0) return;
          addImages(items.map((item) => ({ path: item.url, alt: item.alt ?? item.originalName })));
        }}
      />
    </div>
  );
}

function SaveButton({ saving, mode, onClick }: { saving: boolean; mode: "create" | "edit"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-[var(--primary-foreground)] shadow-[var(--shadow-soft)] hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
      {mode === "create" ? "ایجاد محصول" : "ذخیره تغییرات"}
    </button>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-7 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow transition-colors disabled:opacity-40 ${danger ? "hover:bg-[var(--destructive)] hover:text-white" : "hover:bg-white"}`}
    >
      {children}
    </button>
  );
}
