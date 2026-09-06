# فاز 01 — Layout & Navigation

## هدف فاز

ساخت اسکلت اصلی سایت که در تمام صفحات تکرار می‌شود: Header، ناوبری،
Mega Menu، Search، Bottom Dock موبایل و Footer. این فاز تجربه ورود اولیه
کاربر به سایت را شکل می‌دهد.

## وابستگی‌ها
فاز 00 (Design Tokens، Design System پایه) باید کامل شده باشد.

## صفحات/Route های این فاز
این فاز صفحه مستقل ندارد؛ Layout سراسری (`app/layout.tsx`) را می‌سازد که
در همه صفحات دیگر استفاده می‌شود.

## Component های این فاز

### Header دسکتاپ (بخش 9 PRD)
شامل: لوگوی Zivo، Navigation، Search، Account، Wishlist، Cart.
- Cart و Wishlist باید Badge تعداد آیتم را نشان دهند (از Global State فاز 00).
- Announcement Bar بالای Header (برای پیام‌هایی مثل ارسال رایگان).

### Mega Menu (بخش 9 PRD)
- دسته‌های اصلی: جدیدترین‌ها، سوتین، شورت، ست لباس زیر، لباس خواب، لباس
  شب، بادی و گن، لوازم جانبی، برندها، فروش ویژه.
- هر آیتم منو می‌تواند شامل Sub-category، لیست برندها، لینک «مشاهده همه»
  و تصویر Campaign/Collection باشد.
- در Desktop: Dropdown/Panel با Hover یا Click.
- در Mobile: تبدیل به Drawer/Sheet (نه Dropdown).

### MobileBottomNav / Bottom Dock (بخش 7.2 PRD)
Dock ثابت پایین صفحه با 6 آیتم: خانه، دسته‌بندی‌ها، جستجو، علاقه‌مندی‌ها،
حساب کاربری، سبد خرید. آیتم سبد خرید Badge تعداد را نمایش دهد.
باید در تمام صفحات موبایل (به‌جز شاید Checkout — تصمیم UX در فاز 06)
ثابت (Fixed/Sticky) بماند.

### Search (بخش 39 PRD)
- سریع و قابل استفاده در موبایل.
- Autocomplete + پیشنهاد محصولات.
- Recent Search (ذخیره محلی/Mock).
- نتیجه جستجو شامل محصول، دسته و برند.
- در Desktop می‌تواند به‌صورت Overlay/Modal باشد؛ در Mobile تمام‌صفحه یا
  Sheet.

### Footer (بخش 38 PRD)
ستون‌های: «درباره Zivo» (معرفی، درباره ما، تماس با ما)، «خدمات مشتریان»
(پیگیری سفارش، قوانین، مرجوعی، سوالات متداول)، «خرید» (دسته‌بندی‌ها،
برندها، تخفیف‌ها)، «ارتباط» (Instagram، Telegram، WhatsApp، Phone)،
به‌علاوه Newsletter، لوگو و Copyright.

### Breadcrumb
کامپوننت عمومی قابل استفاده مجدد در تمام صفحات داخلی (محصولات، محصول،
سفارش و ...).

## جزئیات UX/UI
- در موبایل: Header فشرده شود؛ جستجو دسترسی سریع داشته باشد (بخش 7.1).
- Mega Menu باید با Keyboard قابل پیمایش باشد (Accessibility).
- Transition باز/بسته شدن منو کوتاه و طبیعی باشد (بخش 6.2).

## داده‌های Mock مورد نیاز
- لیست دسته‌بندی‌ها با تصویر (حداقل 8 دسته طبق بخش 50).
- لیست برندها (حداقل 5 برند).
- چند آیتم Recent Search نمونه برای دمو.

## State های Loading / Empty / Error مرتبط
- Search: Empty State برای «نتیجه‌ای یافت نشد».
- Search: Loading Skeleton حین تایپ (شبیه‌سازی Debounce/Fetch).

## معیار پذیرش (Definition of Done)
- [ ] Header دسکتاپ با تمام آیتم‌ها و Badge های صحیح کار می‌کند.
- [ ] Mega Menu در Desktop باز/بسته می‌شود و تمام دسته‌ها را نمایش می‌دهد.
- [ ] در Mobile، Mega Menu به Drawer/Sheet تبدیل شده است.
- [ ] Bottom Dock در تمام صفحات موبایل ثابت و کارکردی است، با Badge سبد خرید.
- [ ] Search دارای Autocomplete Mock و Recent Search است.
- [ ] Footer تمام بخش‌های ذکرشده را دارد و Newsletter (UI) کار می‌کند.
- [ ] Breadcrumb به‌صورت کامپوننت قابل استفاده مجدد آماده است.

## چک‌لیست Desktop/Mobile
- [ ] Header دسکتاپ ↔ Header/Bottom Dock موبایل رفتار جداگانه و صحیح دارند.
- [ ] Mega Menu دسکتاپ ↔ Drawer موبایل هر دو تست شده‌اند.
- [ ] Touch Target دکمه‌های موبایل به اندازه کافی بزرگ است (بخش 44).
