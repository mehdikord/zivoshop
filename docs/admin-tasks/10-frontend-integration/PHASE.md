# فاز 10 — Frontend Integration

## هدف فاز

اتصال فرانت‌اند مشتری (فروشگاه) به API واقعی و جایگزینی Mock Data
با داده‌های واقعی از دیتابیس.

## وابستگی‌ها

- فاز 09 (API Layer) — API باید آماده باشد

## خروجی‌های این فاز

### 1. HTTP Client

**فایل:** `lib/http.ts`
- Fetch wrapper با base URL
- ارسال JWT token در header
- مدیریت خطا (401 → ریدایرکت لاگین)
- Retry ساده

**فایل:** `lib/api-client.ts`
- Typed functions برای هر endpoint
- حفظ همان function signature های فعلی lib/data.ts و lib/api.ts

### 2. بروزرسانی Data Access Layer

**lib/data.ts** → تغییر از import JSON به fetch API:
```
قبل: import products from "@/data/products.json"
بعد: fetch("/api/v1/products?category=bra")
```

**lib/api.ts** → حذف simulated latency، جایگزینی با fetch واقعی

**lib/catalog.ts** → تغییر filter logic به server-side:
```
قبل: filterCatalogProducts(products, filters)
بعد: GET /api/v1/products?category=...&brand=...&sort=...
```

### 3. بروزرسانی Zustand Stores

**stores/auth-store.ts:**
- login(): call POST /api/auth/v1/login
- register(): call POST /api/auth/v1/register
- logout(): call POST /api/auth/v1/logout
- On app load: call GET /api/auth/v1/me

**stores/cart-store.ts:**
- بدون تغییر (client-side باقی می‌ماند)

**stores/checkout-store.ts:**
- placeOrder(): call POST /api/v1/orders
- Apply coupon: call POST /api/v1/apply-coupon

**stores/wishlist-store.ts:**
- On login: sync with GET /api/v1/wishlist
- Toggle: call POST/DELETE /api/v1/wishlist

**stores/filter-store.ts:**
- بدون تغییر (URL-based باقی می‌ماند)

### 4. بروزرسانی صفحات

**Homepage (app/page.tsx):**
- Hero Slides: همچنان از data/home.ts (یا API future)
- Featured Products: GET /api/v1/products/newest
- Bestsellers: GET /api/v1/products/bestsellers
- Discounted: GET /api/v1/products/discounted
- Categories: GET /api/v1/categories
- Brands: GET /api/v1/brands

**Product Listing (app/products/page.tsx):**
- Products: GET /api/v1/products with query params
- Filters (categories, brands, sizes, colors): GET from API
- Sort: client-side URL param → server-side sort

**Product Detail (app/products/[slug]/page.tsx):**
- Product: GET /api/v1/products/[slug]
- Reviews: GET /api/v1/reviews/[id]

**Login/Register:**
- Use auth store with real API

**Account pages:**
- Profile: GET /api/auth/v1/me
- Orders: GET /api/v1/orders
- Addresses: GET /api/v1/addresses
- Wishlist: GET /api/v1/wishlist

**Checkout:**
- Addresses: GET /api/v1/addresses
- Create Order: POST /api/v1/orders
- Apply Coupon: POST /api/v1/apply-coupon

### 5. Error Handling

- Error boundaries برای API failures
- Toast notifications برای خطاها
- Graceful degradation
- Loading states حین fetch

### 6. Types Alignment

- بروزرسانی types/index.ts برای match با API response
- استفاده از Prisma generated types در API
- تطابق Type های فرانت‌اند با API response

## معیار پذیرش (Definition of Done)

- [ ] صفحه اصلی محصولات واقعی را نمایش می‌دهد
- [ ] Product Listing با فیلتر واقعی کار می‌کند
- [ ] Product Detail اطلاعات واقعی نمایش می‌دهد
- [ ] لاگین و ثبت‌نام واقعی کار می‌کند
- [ ] سبد خرید و checkout با API واقعی کار می‌کند
- [ ] لیست علاقه‌مندی‌ها sync می‌شود
- [ ] سفارشات کاربر نمایش داده می‌شود
- [ ] آدرس‌ها CRUD واقعی دارند
- [ ] خطاها با Toast نمایش داده می‌شوند
- [ ] Loading states در تمام صفحات وجود دارد
- [ ] جستجو واقعی کار می‌کند

## زمان تقریبی

**4 تا 5 ساعت**
