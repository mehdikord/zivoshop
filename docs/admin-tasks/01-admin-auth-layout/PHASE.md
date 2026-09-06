# فاز 01 — Admin Authentication & Layout

## هدف فاز

پیاده‌سازی سیستم احراز هویت مدیران سایت و طراحی Layout اصلی پنل ادمین
شامل Sidebar، Header، Breadcrumb و ساختار صفحات. این فاز زیرساخت
تمام صفحات پنل ادمین است.

## وابستگی‌ها

- فاز 00 (Foundation & Prisma Setup) — Prisma Schema و JWT utilities باید آماده باشند.

## خروجی‌های این فاز

### 1. صفحه لاگین ادمین

**فایل:** `app/admin/(auth)/login/page.tsx`

- فرم لاگین با فیلدها:
  - شماره موبایل (input type="tel", LTR, regex: `/^09\d{9}$/`)
  - گذرواژه (input type="password", min 6 chars)
- دکمه "ورود" با Loading state
- Toast پیام خطا در صورت اطلاعات اشتباه
- ریدایرکت به Dashboard پس از لاگین موفق
- اگر قبلاً لاگین کرده باشد، ریدایرکت به Dashboard

### 2. API Routes احراز هویت

**POST `/api/auth/admin/login`**
```
Body: { mobile: string, password: string }
Response: { success: true, data: { admin: AdminPayload, token: string } }
```
- بررسی وجود admin با mobile
- مقایسه bcrypt hash گذرواژه
- صدور JWT token (7 روز)
- ذخیره token در httpOnly cookie

**POST `/api/auth/admin/logout`**
- پاک کردن cookie
- برگرداندن success response

**GET `/api/auth/admin/me`**
- خواندن token از cookie
- verify کردن JWT
- برگرداندن اطلاعات admin

### 3. Middleware محافظت مسیرها

**فایل:** `next/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// مسیرهایی که نیاز به احراز هویت ندارند
const publicPaths = ["/admin/login", "/api/auth/admin/login"];

// مسیرهای پنل ادمین
const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // بررسی مسیرهای ادمین
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    // اگر مسیر login است، اجازه عبور
    if (publicPaths.includes(pathname)) {
      return NextResponse.next();
    }

    // بررسی وجود cookie توکن
    const token = request.cookies.get("zivo_admin_token")?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // TODO: verify JWT in middleware (jose works in Edge Runtime)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

### 4. Admin Layout اصلی

**فایل:** `app/admin/layout.tsx`

ساختار Layout:

```
┌──────────────────────────────────────────┐
│  Sidebar  │        Header Bar            │
│           │──────────────────────────────│
│           │      Breadcrumb              │
│  Logo     │──────────────────────────────│
│           │                              │
│  Nav      │      Main Content            │
│  Items    │      (children)              │
│           │                              │
│           │                              │
└──────────────────────────────────────────┘
```

**包含了:**
- `AdminSidebar` — Sidebar ناوبری
- `AdminHeader` — Header بالای صفحه
- `AdminBreadcrumb` — Breadcrumb خودکار
- `main` — ناحیه محتوای اصلی

### 5. Admin Sidebar

**فایل:** `components/admin/layout/admin-sidebar.tsx`

**آیتم‌های ناوبری:**

| آیکون | عنوان | مسیر |
|-------|-------|------|
| LayoutDashboard | داشبورد | /admin |
| Users | مدیران | /admin/admins |
| Users | کاربران | /admin/users |
| FolderTree | دسته‌بندی‌ها | /admin/categories |
| Building2 | برندها | /admin/brands |
| Package | محصولات | /admin/products |
| Star | نظرات | /admin/reviews |
| ShoppingCart | سفارشات | /admin/orders |
| Ticket | کدهای تخفیف | /admin/coupons |
| Image | بنرها | /admin/banners |
| FileText | صفحات | /admin/pages |
| Settings | تنظیمات | /admin/settings |
| Activity | لاگ فعالیت | /admin/activity-logs |

**ویژگی‌ها:**
- RTL layout (logo در بالا، ناوبری در سمت راست)
- Collapsible در Tablet (فقط آیکون نمایش داده شود)
- Active state با رنگ primary
- Hover state با background ملایم
- آیکون‌ها از lucide-react
- Section headers برای گروه‌بندی (مثلاً "مدیریت محتوا"، "مدیریت فروش")
- Footer Sidebar با نام و نسخه پنل

### 6. Admin Header

**فایل:** `components/admin/layout/admin-header.tsx`

**المان‌ها:**
- دکمه Toggle Sidebar (در Tablet)
- Breadcrumb
- Spacer
- دکمه جستجو (اختیاری)
- نوتیفیکیشن (placeholder)
- آواتار و نام Admin
- Dropdown Menu: پروفایل، خروج

### 7. Admin Breadcrumb

**فایل:** `components/admin/layout/admin-breadcrumb.tsx`

- تولید خودکار از URL
- فرمت: خانه > بخش اصلی > زیربخش
- قابل کلیک (لینک به صفحات والد)

### 8. Admin Shell Component

**فایل:** `components/admin/layout/admin-shell.tsx`

- Wrapper اصلی که Sidebar + Header + Content را ترکیب می‌کند
- Responsive: در mobile Sidebar به Sheet/Drawer تبدیل شود
- State باز/بسته بودن Sidebar در localStorage ذخیره شود

### 9. Protected API Route Helper

**فایل:** `lib/admin-auth.ts`

```typescript
import { verifyAdminToken, type AdminPayload } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { NextResponse } from "next/server";

export async function withAdminAuth(
  handler: (admin: AdminPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const admin = await verifyAdminToken();
  if (!admin) {
    return apiError("Unauthorized", 401);
  }
  return handler(admin);
}
```

### 10. Type Defs

**فایل:** `types/admin.ts`

```typescript
export interface AdminUser {
  id: number;
  name: string;
  mobile: string;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminNavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
  children?: AdminNavItem[];
}
```

## جزئیات UX/UI

- **رنگ‌بندی Sidebar:** Background سفید (`--surface`) با Border سمت چپ
- **Typography:** فونت Vazirmatn، وزن 500 برای آیتم‌های ناوبری
- **Active State:** Background primary-10% opacity + متن primary + border-left primary
- **Hover State:** Background surface-secondary
- **Transition:** 200ms ease برای باز/بسته شدن Sidebar
- **Loading State:** Skeleton برای Sidebar و Header در بارگذاری اولیه

## State های Loading / Empty / Error

| State | رفتار |
|-------|-------|
| Loading (لاگین) | Spinner روی دکمه لاگین |
| Error (لاگین) | Toast با پیام "شماره موبایل یا گذرواژه اشتباه است" |
| Loading (Layout) | Skeleton برای Sidebar و Header |
| Error (Auth Check) | ریدایرکت به لاگین |

## معیار پذیرش (Definition of Done)

- [ ] صفحه لاگین با فرم موبایل + گذرواژه کار می‌کند
- [ ] API لاگین با bcrypt و JWT کار می‌کند
- [ ] Cookie httpOnly برای توکن ذخیره می‌شود
- [ ] Middleware مسیرهای /admin را محافظت می‌کند
- [ ] Dashboard پس از لاگین نمایش داده می‌شود
- [ ] Sidebar با تمام آیتم‌های ناوبری نمایش داده می‌شود
- [ ] Header با نام admin و دکمه خروج کار می‌کند
- [ ] Breadcrumb خودکار از URL تولید می‌شود
- [ ] Layout در Tablet (768px) Sidebar را collapse می‌کند
- [ ] Layout در Mobile Sidebar را به Sheet تبدیل می‌کند
- [ ] خروج از سیستم cookie را پاک می‌کند و به لاگین ریدایرکت می‌کند
- [ ] RTL در تمام عناصر رعایت شده

## زمان تقریبی

**4 تا 5 ساعت**
