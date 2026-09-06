# فاز 11 — Accessibility, Performance & SEO (فاز Cross-cutting)

## هدف فاز

این فاز نیز مانند فاز 10 موازی با کل پروژه اجرا می‌شود، اما بازبینی
نهایی و متمرکز آن در انتهای پروژه (پیش از فاز 13) انجام می‌شود.

## وابستگی‌ها
باید در تمام فازهای محتوایی (02 تا 09) هم‌زمان رعایت شود.

## Accessibility (بخش 44 PRD)
الزامات:
- Keyboard Navigation کامل (Tab/Shift+Tab/Enter/Escape) در تمام
  Componentهای تعاملی (منو، فیلتر، Modal، Carousel).
- Focus State قابل مشاهده برای تمام عناصر Focusable.
- `aria-label` مناسب برای دکمه‌های فقط-آیکون (Wishlist، حذف، Search).
- Contrast رنگ مطابق استاندارد WCAG AA با پالت برند بررسی شود (به‌خصوص
  متن روی پس‌زمینه Gold یا Cream).
- Semantic HTML (`nav`, `main`, `header`, `footer`, `button` به‌جای
  `div` کلیک‌پذیر).
- Form Label و Error Message مرتبط با هر Input (`aria-describedby`).
- Screen Reader Friendly بودن اجزای پویا (مثل تغییر تعداد سبد خرید).
- Touch Target حداقل مناسب در موبایل (حداقل ۴۴×۴۴ پیکسل پیشنهادی).

## Performance (بخش 45 PRD)
- استفاده از `next/image` برای بهینه‌سازی تمام تصاویر.
- Lazy Loading تصاویر و Sectionهای پایین صفحه.
- جلوگیری از JavaScript غیرضروری (بررسی Bundle Size).
- Component Splitting و Dynamic Import برای بخش‌های سنگین (مثلاً
  Gallery Fullscreen، Modalهای بزرگ).
- Skeleton Loading به‌جای Spinner برای جلوگیری از حس کندی.
- جلوگیری از Layout Shift (تعیین ابعاد ثابت تصاویر/کارت‌ها از فاز 00).

## SEO (بخش 46 PRD)
برای صفحات کلیدی (Home، Products، Product Detail، About، Contact):
- Title و Description اختصاصی هر صفحه.
- Canonical URL.
- Open Graph Tags (برای اشتراک‌گذاری در شبکه‌های اجتماعی).
- Semantic Heading Hierarchy (یک `h1` در هر صفحه، ترتیب منطقی
  `h2`/`h3`).
- Metadata اختصاصی برای هر محصول (نام، تصویر، قیمت در Product Page).
- URLهای خوانا: `/products`، `/products?category=...`،
  `/product/zivo-lace-bra`.

## معیار پذیرش (Definition of Done)
- [ ] تمام Componentهای تعاملی با Keyboard قابل استفاده‌اند.
- [ ] Contrast رنگ متن روی تمام پس‌زمینه‌های برند بررسی و تأیید شده.
- [ ] تصاویر سایت با `next/image` و Lazy Loading بارگذاری می‌شوند.
- [ ] Lighthouse Performance/Accessibility/SEO Score قابل قبول (هدف:
      حداقل 85+ در هر سه شاخص برای صفحات کلیدی) به‌دست آمده.
- [ ] Metadata و Open Graph برای صفحات کلیدی تنظیم شده.
- [ ] هیچ Layout Shift محسوسی در بارگذاری صفحات دیده نمی‌شود.

## چک‌لیست Desktop/Mobile
- [ ] Touch Targetها در موبایل بررسی و اندازه‌گیری شده‌اند.
- [ ] Core Web Vitals (LCP, CLS) در حالت موبایل (شبیه‌سازی شبکه کندتر)
      بررسی شده.

## نکته اجرایی
پیشنهاد می‌شود یک چک‌لیست A11y/Performance/SEO به‌عنوان بخشی از
Definition of Done هر فاز محتوایی (02 تا 09) نیز تکرار شود، نه فقط در
پایان پروژه — تا بدهی فنی انباشته نشود.
