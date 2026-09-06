# نقشه راه توسعه Backend، پنل ادمین و اتصال API

> **پروژه:** فروشگاه آنلاین زیوو | Zivo  
> **نسخه:** 1.0  
> **تاریخ:** مرداد 1405

---

## خلاصه

این مستند، فرایند کامل تبدیل پروژه Mock فرانت‌اند Zivo به یک سیستم
**واقعی و عملیاتی** را در **13 فاز مستقل** مستند می‌کند. هر فاز در یک پوشه
جداگانه قرار دارد و شامل فایل `PHASE.md` با جزئیات کامل آن مرحله است.

### دامنه کار

1. **پنل ادمین حرفه‌ای** — UI/UX سطح Metronic با Sidebar، Dashboard، CRUD
   کامل تمام موجودیت‌ها، فیلتر و مرتب‌سازی پیشرفته
2. **Prisma + MySQL** — اسکیمای دیتابیس با 34 جدول، Migration های Laravel-style،
   Seed داده‌های اولیه
3. **API Layer** — REST API کامل با احراز هویت JWT، فیلتر، صفحه‌بندی، اعتبارسنجی
4. **اتصال فرانت‌اند** — جایگزینی Mock Data با API واقعی در فرانت‌اند مشتری

---

## فناوری‌های کلیدی

| لایه | فناوری |
|------|--------|
| ORM | Prisma 7.x |
| Database | MySQL 8.x |
| Auth | JWT (jose) + bcrypt |
| API | Next.js API Routes (App Router) |
| Admin UI | shadcn/ui + Tailwind CSS 4 + @tanstack/react-table |
| تقویم شمسی | react-day-picker + moment-jalaali / persian-date |
| فرانت‌اند | Next.js 16 + React 19 |

---

## اطلاعات اتصال دیتابیس

```env
DATABASE_URL="mysql://root:Mehdi123@localhost:3306/zivo_shop"
```

---

## ترتیب اجرا

| # | فاز | خروجی کلیدی | اولویت | وابستگی |
|---|-----|-------------|--------|---------|
| 00 | [Foundation & Prisma Setup](./00-foundation-setup/PHASE.md) | Prisma Schema، Migration اولیه، Seed، .env | P0 | — |
| 01 | [Admin Auth & Layout](./01-admin-auth-layout/PHASE.md) | لاگین ادمین، JWT، Layout پنل ادمین | P0 | فاز 00 |
| 02 | [Admin Dashboard](./02-admin-dashboard/PHASE.md) | داشبورد آماری با نمودارها | P0 | فاز 01 |
| 03 | [User Management](./03-user-management/PHASE.md) | CRUD کاربران + فیلتر پیشرفته | P0 | فاز 01 |
| 04 | [Category & Brand](./04-category-brand/PHASE.md) | CRUD دسته‌بندی و برندها | P0 | فاز 01 |
| 05 | [Product Management](./05-product-management/PHASE.md) | CRUD محصولات + واریانت + تصاویر | P0 | فاز 04 |
| 06 | [Review & Coupon](./06-review-coupon/PHASE.md) | مدیریت نظرات و کدهای تخفیف | P1 | فاز 01 |
| 07 | [Order Management](./07-order-management/PHASE.md) | مدیریت سفارشات + Timeline | P0 | فاز 01 |
| 08 | [CMS & Settings](./08-cms-settings/PHASE.md) | بنرها، صفحات ثابت، تنظیمات سایت | P1 | فاز 01 |
| 09 | [API Layer](./09-api-layer/PHASE.md) | REST API کامل تمام موجودیت‌ها | P0 | فاز 00 |
| 10 | [Frontend Integration](./10-frontend-integration/PHASE.md) | اتصال فرانت‌اند مشتری به API | P0 | فاز 09 |
| 11 | [Jalali Date System](./11-jalali-dates/PHASE.md) | سیستم تاریخ شمسی در ادمین و API | P1 | فاز 09 |
| 12 | [QA & Deployment](./12-qa-deployment/PHASE.md) | تست نهایی، بهینه‌سازی، آماده استقرار | آخرین | تمام فازها |

---

## نقشه مسیر اجرایی

```
فاز 00 ──┬── فاز 09 ─── فاز 10 (فرانت‌اند مشتری)
          │
          ├── فاز 01 ─── فاز 02
          │         ├─── فاز 03
          │         ├─── فاز 04 ─── فاز 05
          │         ├─── فاز 06
          │         ├─── فاز 07
          │         └─── فاز 08
          │
          └── فاز 11 (همزمان با فاز 09-10)
                          
فاز 12 ── (پس از اتمام تمام فازها)
```

### مسیر سریع (Minimum Viable Backend)

اگر فقط می‌خواهید سریع‌تر به یک سیستم کاربردی برسید:

```
00 → 01 → 09 → 10 → 02 → 03 → 04 → 05 → 07
```

---

## ساختار پوشه پروژه پس از اتمام

```
next/
├── prisma/
│   ├── schema.prisma          # اسکیمای Prisma (34 مدل)
│   ├── seed.ts                # Seed Script
│   └── migrations/            # Migration History
├── app/
│   ├── api/                   # REST API Routes
│   │   ├── auth/
│   │   │   └── admin/
│   │   │       ├── login/route.ts
│   │   │       └── logout/route.ts
│   │   ├── admin/             # API پنل ادمین
│   │   │   ├── dashboard/route.ts
│   │   │   ├── admins/route.ts
│   │   │   ├── users/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── brands/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── coupons/route.ts
│   │   │   ├── banners/route.ts
│   │   │   ├── pages/route.ts
│   │   │   └── settings/route.ts
│   │   └── v1/                # API نسخه 1 فرانت‌اند
│   │       ├── products/route.ts
│   │       ├── categories/route.ts
│   │       ├── brands/route.ts
│   │       ├── auth/route.ts
│   │       ├── cart/route.ts
│   │       ├── orders/route.ts
│   │       ├── reviews/route.ts
│   │       ├── wishlist/route.ts
│   │       ├── addresses/route.ts
│   │       └── search/route.ts
│   ├── admin/                 # صفحات پنل ادمین
│   │   ├── layout.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   └── (dashboard)/
│   │       ├── page.tsx                   # Dashboard
│   │       ├── admins/page.tsx
│   │       ├── users/page.tsx
│   │       ├── categories/page.tsx
│   │       ├── brands/page.tsx
│   │       ├── products/page.tsx
│   │       ├── products/[id]/page.tsx
│   │       ├── reviews/page.tsx
│   │       ├── orders/page.tsx
│   │       ├── orders/[id]/page.tsx
│   │       ├── coupons/page.tsx
│   │       ├── banners/page.tsx
│   │       ├── pages/page.tsx
│   │       ├── settings/page.tsx
│   │       └── activity-logs/page.tsx
│   └── (store)/               # صفحات فرانت‌اند مشتری (بدون تغییر)
│       ├── page.tsx
│       ├── products/
│       └── ...
├── components/
│   ├── admin/                 # کامپوننت‌های پنل ادمین
│   │   ├── layout/
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   ├── admin-breadcrumb.tsx
│   │   │   └── admin-shell.tsx
│   │   ├── data-table/
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-toolbar.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   └── data-table-column-header.tsx
│   │   ├── charts/
│   │   │   ├── stats-card.tsx
│   │   │   ├── sales-chart.tsx
│   │   │   └── orders-chart.tsx
│   │   └── forms/
│   │       ├── product-form.tsx
│   │       ├── category-form.tsx
│   │       ├── coupon-form.tsx
│   │       └── banner-form.tsx
│   ├── ui/                    # shadcn/ui (مشترک)
│   └── ...                    # کامپوننت‌های فرانت‌اند مشتری
├── lib/
│   ├── prisma.ts              # Prisma Client Singleton
│   ├── auth.ts                # JWT Utilities
│   ├── api-response.ts        # Standard API Response Helper
│   └── jalali.ts              # Jalali Date Utilities
├── middleware.ts               # Admin Route Protection
├── hooks/
│   └── use-admin-data-table.ts # Hook سفارشی DataTable ادمین
└── types/
    └── admin.ts               # Type های مخصوص ادمین
```

---

## اصول حاکم بر تمام فازها

### امنیت
1. گذرواژه‌ها فقط با bcrypt هش شوند.
2. JWT با جانشینی مناسب (expiration, refresh) صادر شود.
3. تمام API route های ادمین با Middleware محافظت شوند.
4. SQL Injection و XSS غیرممکن باشد (Prisma + React auto-escaping).

### کیفیت کد
5. تمام فراخوانی‌های DB از طریق Prisma Client باشند (دسترسی مستقیم ممنوع).
6. Type Safety در تمام لایه‌ها رعایت شود.
7. Error Handling مناسب در API و UI وجود داشته باشد.
8. Loading/Empty/Error State در تمام صفحات ادمین طراحی شود.

### UI/UX
9. پنل ادمین RTL باشد و فونت Vazirmatn استفاده شود.
10. تاریخ‌ها در DB میلادی و در UI شمسی نمایش داده شوند.
11. فیلتر و مرتب‌سادی پیشرفته در جداول مهم (Orders, Products, Users) وجود داشته باشد.
12. Responsive باشد (حداقل تا Tablet).

### عملکرد
13. Pagination در تمام لیست‌ها اعمال شود.
14. Select و Include در Prisma queries بهینه باشد.
15. N+1 Query وجود نداشته باشد.
16. Index های مناسب روی فیلدهای پرجستجو اعمال شود.

---

## ساختار هر فایل PHASE.md

هر فایل فاز شامل بخش‌های زیر است:

- **هدف فاز** — چرا این فاز مهم است.
- **وابستگی‌ها** — این فاز به چه چیزی از فازهای قبلی نیاز دارد.
- **خروجی‌های این فاز** — فایل‌ها و ماژول‌هایی که باید ساخته شوند.
- **جزئیات فنی** — کدهای نمونه، ساختار فایل‌ها، Type ها.
- **معیار پذیرش (Definition of Done)** — چک‌لیست تکمیل فاز.
- **زمان تقریبی** — برآورد زمانی هر فاز.
