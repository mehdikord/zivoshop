# فاز 09 — API Layer for Frontend

## هدف فاز

طراحی و پیاده‌سازی REST API کامل که فرانت‌اند مشتری (فروشگاه) از آن
استفاده کند. این API باید تمام نیازمندی‌های PRD را پوشش دهد.

## وابستگی‌ها

- فاز 00 (Foundation & Prisma Setup)

## خروجی‌های این فاز

### 1. ساختار استاندارد پاسخ

فرمت پاسخ API:

```json
{
  "success": true,
  "data": { },
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 12,
    "totalPages": 13
  }
}
```

فرمت خطا:

```json
{
  "success": false,
  "message": "Product not found"
}
```

### 2. ساختار مسیرهای API

```
app/api/
├── auth/
│   └── v1/
│       ├── register/route.ts
│       ├── login/route.ts
│       ├── me/route.ts
│       └── logout/route.ts
├── v1/
│   ├── products/
│   │   ├── route.ts                  (GET list)
│   │   ├── newest/route.ts
│   │   ├── bestsellers/route.ts
│   │   ├── discounted/route.ts
│   │   └── [slug]/route.ts           (GET detail)
│   ├── categories/
│   │   ├── route.ts
│   │   └── [slug]/route.ts
│   ├── brands/
│   │   ├── route.ts
│   │   └── [slug]/route.ts
│   ├── search/route.ts
│   ├── provinces/route.ts
│   ├── addresses/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── wishlist/
│   │   ├── route.ts
│   │   └── [productId]/route.ts
│   ├── orders/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── reviews/
│   │   └── [productId]/route.ts
│   └── apply-coupon/route.ts
└── admin/
    ├── dashboard/route.ts
    ├── admins/route.ts
    ├── users/route.ts
    ├── categories/route.ts
    ├── brands/route.ts
    ├── products/route.ts
    ├── reviews/route.ts
    ├── orders/route.ts
    ├── coupons/route.ts
    ├── banners/route.ts
    ├── pages/route.ts
    ├── settings/route.ts
    └── contact-messages/route.ts
```

### 3. Auth Routes (Customer)

POST `/api/auth/v1/register`
- Body: { name, mobile, password }
- Validation: Zod schema
- Hash password with bcrypt
- Create user
- Return JWT + user

POST `/api/auth/v1/login`
- Body: { mobile, password }
- Validate credentials
- Return JWT + user

GET `/api/auth/v1/me`
- Auth: Required (JWT from cookie/header)
- Return current user

POST `/api/auth/v1/logout`
- Clear JWT cookie

### 4. Product Routes (Public)

GET `/api/v1/products`
- Query params: category, categorySlug, brands, sizes, colors,
  minPrice, maxPrice, onSale, minRating, sort, keyword, page, pageSize
- Filter with Prisma where clauses
- Sort with orderBy
- Paginate with skip/take
- Include category, brand, images, _count reviews
- Response: Product[] with meta

GET `/api/v1/products/[slug]`
- Include category, brand, images, videos, details,
  colors.color, sizes.size, reviews (approved only)
- Response: Full product

GET `/api/v1/products/newest`
- Query: limit (default 8)
- Order by createdAt desc

GET `/api/v1/products/bestsellers`
- Where isBestseller = true
- Order by reviewCount desc

GET `/api/v1/products/discounted`
- Where discountPrice IS NOT NULL
- Order by discountPercent desc

### 5. Category/Brand Routes (Public)

GET `/api/v1/categories`
- Where parentId = null (top-level)
- Include children with product count
- Response: Tree structure

GET `/api/v1/brands`
- Where isActive = true
- Include _count products

### 6. Review Routes

GET `/api/v1/reviews/[productId]`
- Where isApproved = true
- Include user name
- Paginated

POST `/api/v1/reviews/[productId]`
- Auth required
- Check verified purchase (user has order with this product)
- Validate rating 1-5
- Create review

### 7. User Routes (Authenticated)

GET/POST/PATCH/DELETE `/api/v1/addresses/`
- CRUD for user addresses
- Validate province/city from DB

GET/POST/DELETE `/api/v1/wishlist/`
- Toggle wishlist items

GET `/api/v1/orders/`
- List user's orders with items

GET `/api/v1/orders/[id]`
- Order detail (verify ownership)

POST `/api/v1/orders/`
- Body: { addressId, items[], couponCode?, customerNote }
- Transaction:
  1. Validate stock for all items
  2. Calculate subtotal and discounts
  3. Apply coupon if provided
  4. Calculate shipping
  5. Create order
  6. Create order items
  7. Decrement stock
  8. Increment coupon usedCount

### 8. Search Route

GET `/api/v1/search`
- Query: q (keyword), limit
- Search across product name, category name, brand name
- Return grouped results

### 9. Validation Schemas

**فایل:** `lib/validations/auth.ts`
- registerSchema: name, mobile, password
- loginSchema: mobile, password

**فایل:** `lib/validations/product.ts`
- productFilterSchema: category, brands, sizes, colors, priceRange, sort, page

**فایل:** `lib/validations/order.ts`
- createOrderSchema: addressId, items, couponCode, customerNote

**فایل:** `lib/validations/address.ts`
- addressSchema: title, provinceId, cityId, postalCode, fullAddress

### 10. HTTP Client for Frontend

**فایل:** `lib/http.ts`

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}
```

**فایل:** `lib/api-client.ts`
- Typed functions for each endpoint
- Same function signatures as current lib/data.ts and lib/api.ts

## معیار پذیرش (Definition of Done)

- [ ] تمام مسیرهای API عمومی کار می‌کنند
- [ ] احراز هویت کاربر (JWT) کار می‌کند
- [ ] فیلتر و صفحه‌بندی محصولات کار می‌کند
- [ ] ایجاد سفارش با Transaction کار می‌کند
- [ ] کد تخفیف اعمال می‌شود
- [ ] جستجو کار می‌کند
- [ ] تمام Validation schemas نوشته شده
- [ ] HTTP client آماده استفاده در فرانت‌اند است
- [ ] Error handling مناسب در تمام endpoint ها وجود دارد

## زمان تقریبی

**5 تا 6 ساعت**
