# فاز 04 — Product Detail (PDP)

## هدف فاز

ساخت کامل صفحه جزئیات محصول — نقطه تصمیم‌گیری اصلی کاربر برای خرید —
شامل Gallery، انتخاب سایز/رنگ، توضیحات، Reviews و محصولات مرتبط.

## وابستگی‌ها
فاز 00، 01، 03 (برای ProductCard در بخش Related Products) کامل باشند.

## صفحات/Route های این فاز
`/product/[slug]` — مثال: `/product/zivo-lace-bra` (بخش 46 PRD)

## ساختار صفحه (بخش 19 PRD)
Breadcrumb → Gallery → اطلاعات محصول (برند، Rating، قیمت، تخفیف) →
Size Selector → Color Selector → Quantity → Add to Cart → Wishlist →
Stock Status → Shipping Info → Description → Specifications → Reviews →
Related Products.

## Component های این فاز

### ProductGallery (بخش 19 PRD)
- چند تصویر + پشتیبانی از Video.
- Zoom، Thumbnail، حالت Fullscreen.
- در موبایل: Swipe + Fullscreen + Pagination (دات‌ها).

### SizeSelector (بخش 17 PRD)
- سایزها Dynamic (مثلاً سوتین: 55/65/75/85/95؛ لباس شب: XS تا XXL).
- سایز ناموجود: Disabled، خط روی گزینه، غیرقابل انتخاب.

### ColorSelector (بخش 18 PRD)
- Color Swatch با نام رنگ در Hover/انتخاب و وضعیت موجودی.

### QuantitySelector
افزایش/کاهش با محدودیت بر اساس موجودی.

### بخش قیمت و تخفیف
از همان منطق ProductCard استفاده شود (قیمت اصلی/نهایی/درصد تخفیف) —
یکبار به‌صورت تابع/کامپوننت مشترک `Price` + `DiscountBadge` ساخته و در
هر دو جا (Card و PDP) استفاده شود.

### Description (بخش 20 PRD)
Rich Content شامل متن، Heading، جدول، تصویر، لیست، لینک — به‌صورت واقعی
و نه Lorem Ipsum بی‌معنی.

### Reviews & Rating (بخش 21 PRD)
- امتیاز 1 تا 5، میانگین، تعداد کل Reviews.
- Distribution ستاره‌ها (مثلاً 5★ 78%، 4★ 15% ...).
- هر Review: نام کاربر، امتیاز، متن، تاریخ، تصاویر (اختیاری)، Badge
  «خرید تأییدشده» در صورت وجود.

### RelatedProducts
استفاده از `ProductGrid`/`ProductCard` فاز 03 برای نمایش محصولات مرتبط
(بر اساس دسته یا برند مشابه).

### Sticky Add to Cart Bar (موبایل) — بخش 53 PRD
در موبایل، پس از Gallery و اطلاعات اصلی، نوار Sticky پایین صفحه شامل
قیمت و دکمه «افزودن به سبد» ثابت بماند.

## جزئیات UX/UI
- ترتیب موبایل طبق بخش 53: Gallery بالا → نام، Rating، قیمت، تخفیف،
  رنگ، سایز، توضیحات → Sticky Cart Bar پایین.
- افزودن به سبد بدون انتخاب سایز/رنگ اجباری → غیرفعال بودن دکمه یا
  نمایش خطای اعتبارسنجی نزدیک به Selector مربوطه.
- افزودن موفق به سبد → Toast + Feedback بصری (مثلاً Badge سبد در Header
  آپدیت شود، بخش 43).

## داده‌های Mock مورد نیاز
- محصول کامل با تمام فیلدهای بخش 16 (تصاویر متعدد، سایزها، رنگ‌ها،
  موجودی، Reviews نمونه).
- حداقل چند Review واقعی و متنوع (امتیاز مختلف، برخی با تصویر).

## State های Loading / Empty / Error مرتبط
- Skeleton کامل صفحه محصول حین بارگذاری.
- Error State: «محصول ناموجود / یافت نشد» (بخش 41).
- Error State: خطای افزودن به Cart (بخش 42).

## معیار پذیرش (Definition of Done)
- [ ] تمام اجزای بخش 19 PRD در صفحه پیاده‌سازی شده‌اند.
- [ ] Gallery در Desktop (Zoom/Thumbnail) و Mobile (Swipe/Fullscreen)
      کار می‌کند.
- [ ] انتخاب سایز/رنگ با وضعیت ناموجود صحیح رفتار می‌کند.
- [ ] Reviews با Distribution ستاره‌ها نمایش داده می‌شود.
- [ ] Sticky Add to Cart Bar در موبایل فعال است.
- [ ] Related Products با ProductCard مشترک (بدون Duplicate) نمایش
      داده می‌شود.

## چک‌لیست Desktop/Mobile
- [ ] Layout دو ستونه Desktop (Gallery چپ/راست + اطلاعات) در برابر
      Layout تک‌ستونه Mobile تست شده.
- [ ] Fullscreen Gallery در هر دو محیط درست کار می‌کند.
- [ ] Sticky Bar فقط در Mobile نمایش داده می‌شود و در Scroll مزاحم نیست.
