# فاز 04 — Category & Brand Management

## هدف فاز

پیاده‌سازی صفحات مدیریت دسته‌بندی‌ها (با ساختار درختی) و برندها در پنل ادمین.

## وابستگی‌ها

- فاز 01 (Admin Auth & Layout)

## خروجی‌های این فاز

### 1. صفحه مدیریت دسته‌بندی‌ها

**فایل:** `app/admin/(dashboard)/categories/page.tsx`

**ساختار:**

```
┌──────────────────────────────────────────────────┐
│  مدیریت دسته‌بندی‌ها          [+ دسته‌بندی جدید] │
├──────────────────────────────────────────────────┤
│  📁 سوتین (8 محصول)                   [ویرایش] [حذف] │
│    ├── سوتین فانتزی (3)                          │
│    ├── سوتین اسپرت (2)                           │
│    └── سوتین کلاسیک (3)                          │
│  📁 شورت (6 محصول)                   [ویرایش] [حذف] │
│    ├── شورت فانتزی (2)                           │
│    └── ...                                        │
│  📁 ست لباس زیر (4)                 [ویرایش] [حذف] │
│  ...                                             │
└──────────────────────────────────────────────────┘
```

**ویژگی‌ها:**
- نمایش درختی (Tree View) با قابلیت باز/بسته کردن شاخه‌ها
- نمایش تعداد محصولات هر دسته
- Drag-and-drop یا Sort Order برای مرتب‌سازی
- نمایش تصویر کوچک دسته (در صورت وجود)
- نمایش وضعیت فعال/غیرفعال

### 2. دیالوگ ایجاد/ویرایش دسته‌بندی

**کامپوننت:** `components/admin/forms/category-form.tsx`

**فیلدها:**
| فیلد | نوع | توضیح |
|------|------|-------|
| نام | Input | اجباری |
|_slug_ | Input | خودکار از نام (انگلیسی) |
| دسته والد | Select | اختیاری (فقط دسته‌های اصلی) |
| تصویر | File Upload | اختیاری |
| توضیحات | Textarea | اختیاری |
| ترتیب نمایش | Number | پیش‌فرض 0 |
| وضعیت | Switch | فعال/غیرفعال |

**slug generation:** تبدیل خودکار نام فارسی به انگلیسی برای URL
- مثال: "سوتین فانتزی" → "lingerie-fancy"

### 3. صفحه مدیریت برندها

**فایل:** `app/admin/(dashboard)/brands/page.tsx`

**ستون‌ها:**

| ستون | فیلد | قابلیت Sort |
|------|------|-------------|
| لوگو | logo | خیر |
| نام | name | بله |
|_slug_ | slug | بله |
| تعداد محصولات | _count.products | بله |
| وضعیت | isActive | بله |
| ترتیب | sortOrder | بله |
| عملیات | - | خیر |

### 4. دیالوگ ایجاد/ویرایش برند

**فیلدها:**
| فیلد | نوع | توضیح |
|------|------|-------|
| نام | Input | اجباری |
|_slug_ | Input | خودکار |
| لوگو | File Upload | اختیاری |
| توضیحات | Textarea | اختیاری |
| ترتیب نمایش | Number | پیش‌فرض 0 |
| وضعیت | Switch | فعال/غیرفعال |

### 5. API Routes

**Categories:**
```
GET    /api/admin/categories          → list all with children + product count
POST   /api/admin/categories          → create (check slug uniqueness)
PATCH  /api/admin/categories/[id]     → update
DELETE /api/admin/categories/[id]     → delete (check no products)
```

**Brands:**
```
GET    /api/admin/brands              → list with product count
POST   /api/admin/brands              → create
PATCH  /api/admin/brands/[id]         → update
DELETE /api/admin/brands/[id]         → delete (check no products)
```

**Prisma - Tree Structure:**
```typescript
const categories = await prisma.category.findMany({
  where: { parentId: null }, // فقط دسته‌های اصلی
  include: {
    children: {
      include: {
        _count: { select: { products: true } },
        children: true, // sub-sub-categories
      },
    },
    _count: { select: { products: true } },
  },
  orderBy: { sortOrder: "asc" },
});
```

### 6. حذف ایمن

- قبل از حذف دسته/برند، تعداد محصولات مرتبط بررسی شود
- اگر محصول وجود داشته باشد، پیام خطا نمایش داده شود
- حذف فقط در صورتی مجاز است که محصولی مرتبط نباشد

## معیار پذیرش (Definition of Done)

- [ ] لیست دسته‌بندی‌ها به صورت درختی نمایش داده می‌شود
- [ ] ایجاد دسته‌بندی جدید با تمام فیلدها کار می‌کند
- [ ] ویرایش دسته‌بندی کار می‌کند
- [ ] حذف دسته‌بندی (با بررسی محصولات) کار می‌کند
- [ ] slug خودکار از نام فارسی تولید می‌شود
- [ ] لیست برندها با DataTable کار می‌کند
- [ ] CRUD برندها کامل است
- [ ] Loading/Empty/Error States وجود دارد
- [ ] حذف ایمن (عدم حذف با محصول مرتبط) کار می‌کند

## زمان تقریبی

**3 تا 4 ساعت**
