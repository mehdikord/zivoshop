# فاز 00 — Foundation & Setup

## هدف فاز

پایه‌گذاری فنی و بصری پروژه، طوری که تمام فازهای بعدی روی یک زیرساخت
یکپارچه، Type-safe و هماهنگ با هویت برند Zivo ساخته شوند. این فاز
مهم‌ترین فاز پروژه است چون هر خطا یا ناهماهنگی در اینجا، در تمام فازهای
بعدی تکرار می‌شود.

## وابستگی‌ها

هیچ — این فاز نقطه شروع پروژه است.

## خروجی‌های این فاز

### 1. راه‌اندازی پروژه
- ایجاد پروژه Next.js (App Router) با TypeScript.
- تنظیم Tailwind CSS و پیکربندی RTL (`dir="rtl"` در `<html>`، فونت Vazirmatn).
- نصب و پیکربندی shadcn/ui.
- تعریف ساختار پوشه‌ها طبق بخش 47 PRD (`components/`, `lib/`, `hooks/`, `data/`, `types/`).
- تنظیم ESLint/Prettier برای یکدستی کد.

### 2. Design Tokens (بخش 4 و 59 PRD)
تعریف رنگ‌ها به‌صورت CSS Variables / Tailwind theme extend، **نه هارد-کد**:

```
--color-primary: #502909
--color-primary-hover: #7E4F20
--color-gold: #D7AC76
--color-gold-light: #EECDA1
--color-gold-dark: #A06F39
--color-background: #F7EFE6
--color-surface: #FEFEFD
--color-surface-secondary: #EEE4D8
--color-border: #DFD1C1
--color-text: #3F2A1C
--color-text-secondary: #7A6654
--color-text-muted: #A08D7A
```

به‌علاوه رنگ‌های Semantic جدا از پالت برند (Success سبز استاندارد، Error
قرمز استاندارد، Warning Amber، Info آبی ملایم — طبق بخش 4.3).

نسبت استفاده رنگ‌ها را به‌عنوان راهنمای طراحی مستند کنید (60% Ivory/Cream،
20% White Warm، 10% Dark Brown، 8% Gold، 2% Gold Dark) تا Gold به‌عنوان
Accent باقی بماند نه Background غالب.

### 3. Typography
- بارگذاری فونت Vazirmatn (تمام وزن‌های 400 تا 800).
- تعریف Type Scale (اندازه Headingها، Body، Caption، قیمت‌ها).
- تنظیم Line-height مناسب برای متن فارسی.

### 4. Design System پایه (بخش 57 PRD)
ساخت اسکلت اولیه کامپوننت‌های پایه‌ای که shadcn/ui فراهم می‌کند و باید با
هویت Zivo شخصی‌سازی شوند (بدون منطق کسب‌وکار، فقط ظاهر و رفتار پایه):

`Button`, `Badge`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Dialog`,
`Drawer`, `Sheet`, `DropdownMenu`, `Tabs`, `Accordion`, `Tooltip`, `Toast`,
`Form`, `Skeleton`, `Breadcrumb`, `Pagination`.

هر کامپوننت باید:
- از Design Tokens استفاده کند (بدون رنگ Hard-code).
- Radius ملایم و Shadow بسیار نرم داشته باشد (طبق بخش 6.1).
- Focus State و Keyboard Accessibility داشته باشد.

### 5. تعریف Type ها (types/)
تعریف اولیه TypeScript Interfaceهای مدل داده‌ای اصلی که در فازهای بعد
استفاده می‌شوند (بر اساس بخش 16، 24، 25 PRD): `Product`, `Category`,
`Brand`, `Review`, `Address`, `Order`, `OrderItem`, `User`, `CartItem`.

### 6. زیرساخت State مدیریت
تصمیم‌گیری و راه‌اندازی روش مدیریت State سراسری (Context API یا
Zustand/Jotai) برای: `Cart`, `Wishlist`, `Auth (Mock)`, `Filters`.
این زیرساخت باید طوری طراحی شود که در آینده اتصال به Backend واقعی بدون
بازطراحی اساسی ممکن باشد (طبق بخش 1 PRD).

### 7. Motion / Animation Guidelines (بخش 6.2)
تعریف Utility ها یا Preset های Animation (Fade, Scale کم، Slide, Hover
elevation) و پشتیبانی از `prefers-reduced-motion`.

## داده‌های Mock مورد نیاز در این فاز
هیچ — اما ساختار پوشه `data/` و فایل‌های خالی/Placeholder برای
`products.json`, `categories.json`, `brands.json`, `users.json`,
`orders.json`, `addresses.json` ایجاد شود (محتوای واقعی در فاز 12).

## معیار پذیرش (Definition of Done)
- [ ] پروژه Next.js با TypeScript و Tailwind اجرا می‌شود.
- [ ] `dir="rtl"` و فونت Vazirmatn به‌درستی روی کل سایت اعمال شده.
- [ ] تمام Design Tokens به‌صورت متغیر تعریف شده‌اند و در Tailwind config
      Extend شده‌اند.
- [ ] shadcn/ui نصب و حداقل کامپوننت‌های لیست‌شده Import و شخصی‌سازی شده‌اند.
- [ ] ساختار پوشه‌ها دقیقاً مطابق بخش 47 PRD ایجاد شده است.
- [ ] Typeهای پایه در `types/` تعریف شده‌اند.
- [ ] راهکار Global State مشخص و پیاده‌سازی اولیه شده.
- [ ] یک صفحه تست (مثلاً `/style-guide`) برای نمایش تمام رنگ‌ها، فونت‌ها و
      کامپوننت‌های پایه ساخته شده تا هماهنگی بصری تأیید شود.

## چک‌لیست Desktop/Mobile
- [ ] فونت و رنگ‌ها در هر دو محیط یکسان رندر می‌شوند.
- [ ] هیچ Layout Shift یا مشکل RTL در بارگذاری اولیه دیده نمی‌شود.
