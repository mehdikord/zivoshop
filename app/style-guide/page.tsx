"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Heart, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { cn } from "@/lib/utils";

const brandColors = [
  { name: "primary", hex: "#502909", className: "bg-primary", text: "text-primary-foreground" },
  { name: "primary-hover", hex: "#7E4F20", className: "bg-primary-hover", text: "text-white" },
  { name: "gold", hex: "#D7AC76", className: "bg-gold", text: "text-primary" },
  { name: "gold-light", hex: "#EECDA1", className: "bg-gold-light", text: "text-primary" },
  { name: "gold-dark", hex: "#A06F39", className: "bg-gold-dark", text: "text-white" },
  { name: "background", hex: "#F7EFE6", className: "bg-background", text: "text-text" },
  { name: "surface", hex: "#FEFEFD", className: "bg-surface", text: "text-text" },
  { name: "surface-secondary", hex: "#EEE4D8", className: "bg-surface-secondary", text: "text-text" },
  { name: "border", hex: "#DFD1C1", className: "bg-border", text: "text-text" },
  { name: "text", hex: "#3F2A1C", className: "bg-text", text: "text-white" },
  { name: "text-secondary", hex: "#7A6654", className: "bg-text-secondary", text: "text-white" },
  { name: "text-muted", hex: "#A08D7A", className: "bg-text-muted", text: "text-white" },
];

const semanticColors = [
  { name: "success", hex: "#15803D", className: "bg-success", text: "text-white" },
  { name: "success-light", hex: "#DFF3E6", className: "bg-success-light", text: "text-text" },
  { name: "warning", hex: "#B45309", className: "bg-warning", text: "text-white" },
  { name: "warning-light", hex: "#FDEFD9", className: "bg-warning-light", text: "text-text" },
  { name: "info", hex: "#0369A1", className: "bg-info", text: "text-white" },
  { name: "info-light", hex: "#E1F1FB", className: "bg-info-light", text: "text-text" },
  { name: "destructive", hex: "#C0392B", className: "bg-destructive", text: "text-white" },
  { name: "destructive-light", hex: "#FBEAE8", className: "bg-destructive-light", text: "text-text" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <header className="mb-6">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-7 text-text-secondary">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function ColorSwatch({
  name,
  hex,
  className,
  text,
}: {
  name: string;
  hex: string;
  className: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex h-20 w-full items-end rounded-xl border border-border p-3",
          className,
          text,
        )}
      >
        <span className="text-xs font-semibold">{name}</span>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-text">{hex}</div>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  const [selectValue, setSelectValue] = useState("M");
  const [radioValue, setRadioValue] = useState("bra");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-gold-dark">راهنمای طراحی</p>
            <h1 className="mt-1 text-2xl font-extrabold text-primary sm:text-3xl">
              Design System — زیوو Zivo
            </h1>
          </div>
          <Button variant="outline-gold" size="sm" asChild>
            <Link href="/">بازگشت به خانه</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        {/* ===================== Colors ===================== */}
        <Section
          title="رنگ‌های برند"
          description="پالت Ivory، Warm Cream، Champagne Gold و Deep Brown — طبق PRD بخش ۴ و ۵۹. طلایی فقط به‌عنوان Accent استفاده می‌شود."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {brandColors.map((c) => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>

          <h3 className="mt-8 mb-4 text-sm font-bold text-text">رنگ‌های وضعیت (Semantic)</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {semanticColors.map((c) => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>
        </Section>

        {/* ===================== Typography ===================== */}
        <Section
          title="تایپوگرافی"
          description="فونت Vazirmatn با وزن‌های ۴۰۰ تا ۸۰۰، فاصله خط مناسب متن فارسی و خط تیترهای خواناتر."
        >
          <div className="space-y-6">
            <div>
              <div className="text-4xl font-extrabold text-text sm:text-5xl">
                نمایش هیرو — هشتصد
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Vazirmatn 800 · text-4xl/5xl
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-text sm:text-3xl">
                عنوان اصلی صفحه — هفتصد
              </div>
              <p className="mt-1 text-xs text-text-muted">Vazirmatn 700 · text-2xl/3xl</p>
            </div>
            <div>
              <div className="text-xl font-semibold text-text">
                عنوان بخش — ششصد
              </div>
              <p className="mt-1 text-xs text-text-muted">Vazirmatn 600 · text-xl</p>
            </div>
            <div>
              <div className="text-base font-medium text-text">
                متن نیمه‌مهم — پانصد
              </div>
              <p className="mt-1 text-xs text-text-muted">Vazirmatn 500 · text-base</p>
            </div>
            <div>
              <p className="max-w-2xl text-base leading-8 text-text-secondary">
                متن بدنه — چهارصد. زیوو یک فروشگاه آنلاین مدرن و لوکس در حوزه پوشاک
                بانوان است که تمرکز اصلی آن بر فروش سوتین، شورت، ست لباس زیر، لباس
                خواب، لباس شب، بادی، گن و لوازم جانبی مرتبط است. تجربه خرید باید
                ساده، قابل اعتماد و خوشایند باشد.
              </p>
              <p className="mt-1 text-xs text-text-muted">Vazirmatn 400 · text-base</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                متن کم‌اهمیت — ۴۰۰: یادداشت و توضیح کوتاه زیر عناصر.
              </p>
              <p className="text-xs text-text-muted">متن Caption — Placeholder و توضیحات کم‌اهمیت.</p>
            </div>
          </div>
        </Section>

        {/* ===================== Buttons ===================== */}
        <Section
          title="دکمه‌ها"
          description="پنج حالت اصلی. ارتفاع پیش‌فرض ۴۴ پیکسل برای لمس راحت در موبایل."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">افزودن به سبد</Button>
            <Button variant="gold">ادامه به پرداخت</Button>
            <Button variant="outline">مشاهده جزئیات</Button>
            <Button variant="outline-gold">مشاهده همه</Button>
            <Button variant="secondary">ثانویه</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">لینک</Button>
          </div>

          <h3 className="mt-8 mb-4 text-sm font-bold text-text">اندازه‌ها</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">کوچک</Button>
            <Button size="sm">متوسط</Button>
            <Button size="default">پیش‌فرض</Button>
            <Button size="lg">بزرگ</Button>
            <Button size="icon" aria-label="سبد خرید">
              <ShoppingBag />
            </Button>
          </div>

          <h3 className="mt-8 mb-4 text-sm font-bold text-text">حالت‌ها</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>غیرفعال</Button>
            <Button variant="outline" disabled>
              غیرفعال Outlined
            </Button>
            <Button asChild>
              <Link href="/style-guide">
                <Heart />
                با آیکون
              </Link>
            </Button>
          </div>
        </Section>

        {/* ===================== Badges ===================== */}
        <Section title="نشان‌ها (Badge)" description="وضعیت‌های محصول و سیستم با رنگ‌های جدا از برند.">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>پیش‌فرض</Badge>
            <Badge variant="gold">تخفیف ویژه</Badge>
            <Badge variant="secondary">ثانویه</Badge>
            <Badge variant="outline">خط دار</Badge>
            <Badge variant="success">موجود</Badge>
            <Badge variant="warning">کم‌موجودی</Badge>
            <Badge variant="info">جدید</Badge>
            <Badge variant="destructive">ناموجود</Badge>
          </div>
        </Section>

        {/* ===================== Form controls ===================== */}
        <Section title="ورودی‌ها و فرم‌ها" description="Input، Select، Checkbox و RadioGroup با استایل Zivo.">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="sg-name">نام و نام خانوادگی</Label>
                <Input id="sg-name" placeholder="مثلاً نگار محمدی" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sg-mobile">شماره موبایل</Label>
                <Input id="sg-mobile" type="tel" inputMode="numeric" placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sg-disabled">ورودی غیرفعال</Label>
                <Input id="sg-disabled" value="۰۹۱۲۳۴۵۶۷۸۹" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sg-error">خطای اعتبارسنجی</Label>
                <Input id="sg-error" aria-invalid className="border-destructive" defaultValue="۱۲۳۴۵" />
                <p className="text-xs text-destructive">شماره موبایل معتبر نیست.</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox id="sg-check" />
                <Label htmlFor="sg-check" className="cursor-pointer font-normal">
                  دریافت خبرنامه و پیشنهادهای ویژه
                </Label>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>انتخاب سایز</Label>
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder="انتخاب سایز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>دسته‌بندی محصول</Label>
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bra" id="sg-bra" />
                    <Label htmlFor="sg-bra" className="cursor-pointer font-normal">سوتین</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sleepwear" id="sg-sleepwear" />
                    <Label htmlFor="sg-sleepwear" className="cursor-pointer font-normal">لباس خواب</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="shapewear" id="sg-shapewear" />
                    <Label htmlFor="sg-shapewear" className="cursor-pointer font-normal">بادی و گن</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </Section>

        {/* ===================== Navigation & overlays ===================== */}
        <Section
          title="ناوبری و پنجره‌ها"
          description="Tab، Accordion، Tooltip، Dropdown و پنجره‌های Dialog/Sheet/Drawer."
        >
          <Tabs defaultValue="product" className="mb-8">
            <TabsList>
              <TabsTrigger value="product">محصول</TabsTrigger>
              <TabsTrigger value="orders">سفارش‌ها</TabsTrigger>
              <TabsTrigger value="account">حساب کاربری</TabsTrigger>
            </TabsList>
            <TabsContent value="product" className="text-sm text-text-secondary">
              سوتین، شورت و ست لباس زیر در این بخش دسته‌بندی شده‌اند.
            </TabsContent>
            <TabsContent value="orders" className="text-sm text-text-secondary">
              سفارش‌های جاری و تحویل‌شده را اینجا دنبال کنید.
            </TabsContent>
            <TabsContent value="account" className="text-sm text-text-secondary">
              اطلاعات حساب، آدرس‌ها و علاقه‌مندی‌ها در پنل کاربری قرار دارند.
            </TabsContent>
          </Tabs>

          <Accordion type="single" collapsible className="mb-8 w-full sm:max-w-xl">
            <AccordionItem value="shipping">
              <AccordionTrigger>هزینه و زمان ارسال چقدر است؟</AccordionTrigger>
              <AccordionContent>
                ارسال سفارش‌های بالای ۵۰۰ هزار تومان رایگان است و سفارش‌ها در ۲۴
                ساعت کاری تحویل پست می‌شوند.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>امکان مرجوعی کالا وجود دارد؟</AccordionTrigger>
              <AccordionContent>
                بله؛ تا ۷ روز پس از تحویل و با رعایت شرایط مندرج در قوانین مرجوعی،
                امکان بازگرداندن کالا وجود دارد.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">راهنمای سایز</Button>
              </TooltipTrigger>
              <TooltipContent>
                برای انتخاب سایز دقیق، جدول راهنمای اندازه را ببینید.
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">منوی کشویی</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>پروفایل من</DropdownMenuItem>
                <DropdownMenuItem>سفارش‌های من</DropdownMenuItem>
                <DropdownMenuItem>آدرس‌ها</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">خروج از حساب</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">پنجره گفتگو</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>حذف آدرس</DialogTitle>
                  <DialogDescription>
                    آیا مطمئن هستید که می‌خواهید این آدرس را حذف کنید؟ این عملیات
                    قابل بازگشت نیست.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost">انصراف</Button>
                  <Button variant="destructive">حذف آدرس</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">پنل کناری</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>سبد خرید</SheetTitle>
                  <SheetDescription>
                    محصولات انتخابی شما در این پنل نمایش داده می‌شوند.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">فیلتر (موبایل)</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>فیلتر محصولات</DrawerTitle>
                  <DrawerDescription>
                    فیلترها در موبایل به‌صورت Bottom Sheet از پایین باز می‌شوند.
                  </DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </div>
        </Section>

        {/* ===================== Feedback & data ===================== */}
        <Section title="بازخورد، بارگذاری و صفحه‌بندی" description="Toast، Skeleton، Breadcrumb و Pagination.">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Button variant="gold" size="sm" onClick={() => toast.success("محصول به سبد خرید اضافه شد.")}>
              Toast موفق
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.error("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.")}>
              Toast خطا
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast.info("موجودی این سایز محدود است.")}>
              Toast اطلاع
            </Button>
          </div>

          <Breadcrumb
            className="mb-8"
            items={[
              { label: "راهنمای طراحی", href: "/style-guide" },
              { label: "رنگ‌ها" },
            ]}
          />

          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 rounded-xl border border-border bg-surface p-3">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>

          <Pagination currentPage={1} totalPages={8} onPageChange={() => {}} />
        </Section>
      </main>
    </div>
  );
}
