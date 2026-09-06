# نقشه راه توسعه فرانت‌اند «زیوو | Zivo»

این مخزن، فرایند کامل توسعه فرانت‌اند فروشگاه Zivo را بر اساس PRD نسخه 1.0
به **14 فاز مستقل** تقسیم کرده است. هر فاز در یک پوشه جداگانه قرار دارد و
شامل یک فایل `PHASE.md` با جزئیات کامل آن مرحله است.

هدف این ساختار این است که توسعه به‌صورت **تدریجی، قابل بررسی و بدون
سردرگمی** پیش برود؛ هر فاز روی خروجی فاز قبل سوار می‌شود و در پایان هر فاز
باید بتوان یک نسخه قابل نمایش (Demo-able) از سایت داشت.

---

## ترتیب پیشنهادی اجرا

| # | فاز | خروجی کلیدی | اولویت PRD |
|---|-----|--------------|------------|
| 00 | [Foundation & Setup](./00-foundation-setup/PHASE.md) | راه‌اندازی پروژه، Design Tokens، Design System پایه | P0 |
| 01 | [Layout & Navigation](./01-layout-navigation/PHASE.md) | Header، Mobile Bottom Dock، Mega Menu، Footer، Search | P0 / P1 |
| 02 | [Homepage](./02-homepage/PHASE.md) | صفحه اصلی کامل با تمام Sectionها | P0 |
| 03 | [Product Listing (PLP)](./03-product-listing/PHASE.md) | Product Card، صفحه محصولات، Filter، Sort | P0 |
| 04 | [Product Detail (PDP)](./04-product-detail/PHASE.md) | Gallery، انتخاب سایز/رنگ، Reviews، Related Products | P0 |
| 05 | [Cart](./05-cart/PHASE.md) | صفحه و Drawer سبد خرید | P0 |
| 06 | [Checkout & Payment](./06-checkout-payment/PHASE.md) | فرایند چندمرحله‌ای خرید، آدرس، پرداخت Mock | P0 |
| 07 | [Authentication](./07-authentication/PHASE.md) | ورود / ثبت‌نام | P0 |
| 08 | [Account Panel](./08-account-panel/PHASE.md) | داشبورد، سفارش‌ها، آدرس‌ها، Wishlist، ویرایش پروفایل | P0 |
| 09 | [Static Pages](./09-static-pages/PHASE.md) | درباره ما، تماس با ما، قوانین و مقررات | P1 |
| 10 | [Shared States & Feedback](./10-shared-states-feedback/PHASE.md) | Loading/Empty/Error، Toast، Confirmation Dialog | P0 (Cross-cutting) |
| 11 | [Accessibility, Performance & SEO](./11-accessibility-performance-seo/PHASE.md) | A11y، بهینه‌سازی، متادیتا | Cross-cutting |
| 12 | [Mock Data Strategy](./12-mock-data-strategy/PHASE.md) | ساختار و تولید داده‌های Mock واقع‌گرایانه | Cross-cutting / پیش‌نیاز فازهای بالا |
| 13 | [QA & Final Review](./13-qa-final-review/PHASE.md) | تست نهایی، چک‌لیست پذیرش، Polish | آخرین فاز |

> **نکته مهم:** فاز 12 (Mock Data Strategy) و بخش‌هایی از فاز 00 باید عملاً
> **قبل یا هم‌زمان** با فازهای 02 تا 08 آماده باشند، چون تمام صفحات محصول‌محور
> به داده‌ی Mock نیاز دارند. ترتیب شماره‌گذاری صرفاً برای مستندسازی منطقی است؛
> ترتیب واقعی اجرا در بخش «وابستگی‌ها» هر فاز مشخص شده.

---

## اصول حاکم بر تمام فازها (از PRD)

این اصول در **همه فازها** باید رعایت شوند و در هر `PHASE.md` هم تکرار شده‌اند:

1. بررسی Componentهای موجود قبل از ساخت Component جدید — پرهیز از Duplicate.
2. پیروی کامل از Design System و Design Tokens (رنگ‌ها هارد-کد نشوند).
3. Mobile-first بودن مطلق؛ هر فاز باید در Desktop و Mobile جداگانه بررسی شود.
4. رعایت کامل RTL در تمام صفحات و کامپوننت‌ها.
5. استفاده از shadcn/ui برای عناصر پایه و شخصی‌سازی آن‌ها با هویت Zivo.
6. طراحی State های Loading / Empty / Error برای هر بخش مهم.
7. Feedback مناسب (Toast, Confirmation) برای عملیات‌های مهم.
8. رعایت Accessibility (Keyboard, aria-label, Contrast, Focus State).
9. استفاده از داده‌های Mock واقعی و مرتبط با حوزه فروشگاه لباس زیر بانوان.
10. عدم رها کردن هیچ صفحه اصلی با UI ناقص یا Placeholder بی‌معنی.

---

## ساختار هر فایل PHASE.md

هر فایل فاز شامل بخش‌های زیر است:

- **هدف فاز** — چرا این فاز مهم است.
- **وابستگی‌ها** — این فاز به چه چیزی از فازهای قبلی نیاز دارد.
- **صفحات/Route های این فاز**
- **Component های این فاز** (جدید یا استفاده مجدد)
- **جزئیات UX/UI** — رفتار دقیق بر اساس PRD.
- **داده‌های Mock مورد نیاز**
- **State های Loading / Empty / Error مرتبط**
- **معیار پذیرش (Definition of Done)**
- **چک‌لیست Desktop/Mobile**

---

## ساختار پیشنهادی معماری پروژه (مطابق PRD بخش 47)

```
app/
components/
  ui/            → عناصر پایه shadcn سفارشی‌سازی‌شده (Button, Badge, Input, ...)
  layout/        → Header, Footer, PageWrapper
  navigation/    → MobileBottomNav, MegaMenu, Breadcrumb
  product/       → ProductCard, ProductGrid, Gallery, SizeSelector, ColorSelector, Rating
  cart/          → CartDrawer, CartItem
  checkout/       → مراحل Checkout، AddressForm، AddressCard
  account/       → OrderCard, OrderStatus, ProfileForm
  forms/         → فرم‌های عمومی قابل استفاده مجدد
  feedback/      → Toast, EmptyState, ErrorState, LoadingSkeleton, Modal
  sections/      → Sectionهای مخصوص صفحه اصلی (HeroSlider, CategoryCard, ...)
lib/             → توابع کمکی، فرمت قیمت، فرمت تاریخ
hooks/           → useCart, useWishlist, useFilter, ...
data/            → داده‌های Mock (products.json, categories.json, ...)
types/           → تایپ‌های TypeScript (Product, Order, Address, User, ...)
public/
styles/
```

فناوری‌ها طبق PRD: **React + Next.js + Tailwind CSS + shadcn/ui + فونت Vazirmatn**،
با پشتیبانی کامل RTL.
