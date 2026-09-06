# فاز 00 — Foundation & Prisma Setup

## هدف فاز

پایه‌گذاری زیرساخت Backend پروژه شامل اتصال دیتابیس، ORM، سیستم Migration،
و آماده‌سازی تمام 34 جدول دیتابیس. این فاز نقطه شروع تمام کارهای Backend
و پنل ادمین است و باید با دقت بالا انجام شود.

## وابستگی‌ها

هیچ — این فاز نقطه شروع Backend پروژه است.

## خروجی‌های این فاز

### 1. نصب وابستگی‌ها

```bash
pnpm add prisma @prisma/client
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
pnpm add jose
pnpm add @tanstack/react-table
pnpm add jalaali-js
pnpm add -D @types/jalaali-js
```

### 2. فایل `.env`

ایجاد فایل `next/.env`:

```env
# Database
DATABASE_URL="mysql://root:Mehdi123@localhost:3306/zivo_shop"

# JWT
JWT_SECRET="zivo-shop-jwt-secret-key-2025-change-in-production"
JWT_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Prisma Schema

ایجاد فایل `next/prisma/schema.prisma` با تمام 34 مدل:

**قواعد نام‌گذاری (Laravel-style):**
- مدل‌ها PascalCase (`Admin`, `OrderItem`)
- فیلدها camelCase (`userId`, `createdAt`)
- `@map` برای نام ستون در دیتابیس (`user_id`, `created_at`)
- `@@map` برای نام جدول (`admins`, `order_items`)
- ID از نوع `BigInt @id @default(autoincrement())`
- Foreign Key از نوع `BigInt`
- تمام جداول دارای `createdAt` و `updatedAt`

**لیست کامل مدل‌ها:**

| # | مدل Prisma | نام جدول | توضیح |
|---|-----------|---------|-------|
| 1 | Admin | admins | مدیران سایت |
| 2 | PasswordResetToken | password_reset_tokens | بازیابی گذرواژه |
| 3 | PersonalAccessToken | personal_access_tokens | توکن‌های احراز هویت |
| 4 | Province | provinces | استان‌ها |
| 5 | City | cities | شهرها |
| 6 | Address | addresses | آدرس‌های کاربران |
| 7 | Category | categories | دسته‌بندی (سلسله‌مراتبی) |
| 8 | Brand | brands | برندها |
| 9 | Color | colors | رنگ‌ها |
| 10 | Size | sizes | سایزها |
| 11 | Product | products | محصولات |
| 12 | ProductImage | product_images | تصاویر محصول |
| 13 | ProductVideo | product_videos | ویدیوهای محصول |
| 14 | ProductDetail | product_details | محتوای غنی محصول |
| 15 | ProductColor | product_colors | رنگ‌های محصول (pivot) |
| 16 | ProductSize | product_sizes | سایزهای محصول (pivot) |
| 17 | ProductVariant | product_variants | واریانتها |
| 18 | Review | reviews | نظرات |
| 19 | ReviewImage | review_images | تصاویر نظرات |
| 20 | Wishlist | wishlists | علاقه‌مندی‌ها |
| 21 | Coupon | coupons | کدهای تخفیف |
| 22 | Order | orders | سفارشات |
| 23 | OrderItem | order_items | آیتم‌های سفارش |
| 24 | OrderStatusHistory | order_status_history | تاریخچه وضعیت |
| 25 | Payment | payments | پرداخت‌ها |
| 26 | Banner | banners | بنرها |
| 27 | Feature | features | مزایای خرید |
| 28 | Page | pages | صفحات ثابت |
| 29 | ContactMessage | contact_messages | پیام‌های تماس |
| 30 | Newsletter | newsletters | خبرنامه |
| 31 | SiteSetting | site_settings | تنظیمات سایت |
| 32 | ActivityLog | activity_logs | لاگ فعالیت‌ها |
| 33 | SearchLog | search_logs | لاگ جستجو |
| 34 | (merge PasswordResetToken + PersonalAccessToken = 34 total) | | |

**نمونه ساختار یک مدل:**

```prisma
model Admin {
  id        BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  name      String    @db.VarChar(255)
  mobile    String    @unique @db.VarChar(20)
  email     String?   @unique @db.VarChar(255)
  password  String    @db.VarChar(255)
  isActive  Boolean   @default(true) @map("is_active")

  createdAt DateTime? @default(now()) @map("created_at")
  updatedAt DateTime? @updatedAt @map("updated_at")

  orderStatusHistories OrderStatusHistory[]
  activityLogs         ActivityLog[]

  @@map("admins")
}
```

**نمونه ساختار Relation:**

```prisma
model Product {
  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  categoryId  BigInt    @map("category_id") @db.UnsignedBigInt
  brandId     BigInt    @map("brand_id") @db.UnsignedBigInt
  name        String    @db.VarChar(500)
  slug        String    @unique @db.VarChar(500)
  // ... سایر فیلدها

  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  brand       Brand     @relation(fields: [brandId], references: [id], onDelete: Restrict)
  images      ProductImage[]
  // ... سایر relations

  @@index([categoryId])
  @@index([brandId])
  @@index([status])
  @@index([price])
  @@map("products")
}
```

### 4. Prisma Client Singleton

ایجاد فایل `next/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 5. JWT Utilities

ایجاد فایل `next/lib/auth.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface AdminPayload {
  id: number;
  name: string;
  mobile: string;
  role: "admin";
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "default-secret"
);

const COOKIE_NAME = "zivo_admin_token";

export async function signAdminToken(payload: AdminPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(secret);
}

export async function verifyAdminToken(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  // در Server Action یا Route Handler
  // cookies().set(COOKIE_NAME, token, { httpOnly, secure, ... });
}

export function clearAuthCookie() {
  // cookies().delete(COOKIE_NAME);
}
```

### 6. API Response Helpers

ایجاد فایل `next/lib/api-response.ts`:

```typescript
import { NextResponse } from "next/server";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ success: false, message }, { status });
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
```

### 7. Migration اولیه

```bash
npx prisma migrate dev --name initial_schema
```

### 8. Seed Script

ایجاد فایل `next/prisma/seed.ts` با داده‌های اولیه:
- 1 مدیر سایت (نام: Admin, موبایل: 09120000000, گذرواژه: admin123)
- 10 استان با شهرها (تهران، اصفهان، فارس، خراسان رضوی، آذربایجان شرقی، خوزستان، مازندران، گیلان، کرمان، آذربایجان غربی)
- 8 دسته‌بندی اصلی
- 6 برند
- 10 رنگ نمونه
- 5 سایز نمونه

### 9. package.json Seed Config

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
}
```

## جزئیات فنی مهم

### نوع فیلدها در Prisma

| نوع DB | نوع Prisma | آنوتیشن |
|--------|-----------|---------|
| BIGINT UNSIGNED | BigInt | `@db.UnsignedBigInt` |
| VARCHAR(n) | String | `@db.VarChar(n)` |
| TEXT | String | `@db.Text` |
| TINYINT(1) | Boolean | `@default(true)` |
| INT | Int | `@default(0)` |
| DECIMAL(3,2) | Decimal | `@db.Decimal(3,2)` |
| TIMESTAMP | DateTime? | `@default(now())` |
| ENUM | enum | `@enum名` |
| JSON | Json | |

### Enum Types

```prisma
enum ProductStatus {
  active
  draft
  archived

  @@map("products_status_enum")
}

enum OrderStatus {
  pending
  processing
  shipped
  delivered
  cancelled
  returned

  @@map("orders_status_enum")
}

enum PaymentStatus {
  pending
  successful
  failed
  cancelled
  refunded

  @@map("payments_status_enum")
}
```

## معیار پذیرش (Definition of Done)

- [ ] فایل `.env` با اطلاعات دیتابیس ایجاد شده
- [ ] `prisma/schema.prisma` با تمام 34+ مدل نوشته شده
- [ ] `lib/prisma.ts` singleton ایجاد شده
- [ ] `lib/auth.ts` با JWT sign/verify ایجاد شده
- [ ] `lib/api-response.ts` با response helpers ایجاد شده
- [ ] `npx prisma migrate dev --name initial_schema` با موفقیت اجرا شده
- [ ] `npx prisma generate` بدون خطا اجرا شده
- [ ] `npx prisma db seed` با موفقیت اجرا شده
- [ ] `npx prisma studio` باز شده و داده‌ها قابل مشاهده هستند
- [ ] تمام جداول در دیتابیس ایجاد شده‌اند
- [ ] Seed data در جداول مربوطه درج شده

## زمان تقریبی

**3 تا 4 ساعت**
