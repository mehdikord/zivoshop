# فاز 05 — Product Management

## هدف فاز

پیاده‌سازی کامل‌ترین بخش پنل ادمین: مدیریت محصولات شامل CRUD کامل،
واریانت‌ها، تصاویر، محتوای غنی و مدیریت موجودی.

## وابستگی‌ها

- فاز 01 (Admin Auth & Layout)
- فاز 04 (Category & Brand) — دسته‌بندی و برند باید آماده باشند.

## خروجی‌های این فاز

### 1. صفحه لیست محصولات

**فایل:** `app/admin/(dashboard)/products/page.tsx`

**ستون‌ها:**

| ستون | فیلد | Sort | Filter | فرمت |
|------|------|------|--------|------|
| تصویر | image | خیر | خیر | Thumbnail |
| نام | name | بله | جستجو | متن + لینک |
| دسته‌بندی | category.name | بله | چندانتخابی | - |
| برند | brand.name | بله | چندانتخابی | - |
| قیمت | price | بله | بازه | تومان |
| قیمت تخفیف | discountPrice | بله | خیر | تومان |
| موجودی | stock | بله | وضعیت | عدد + رنگ |
| وضعیت | status | بله | چندانتخابی | Badge |
| امتیاز | rating | بله | خیر | ستاره |
| عملیات | - | خیر | خیر | دکمه‌ها |

**فیلترهای پیشرفته:**
- جستجوی نام
- فیلتر دسته‌بندی (چندانتخابی، درختی)
- فیلتر برند (چندانتخابی)
- فیلتر وضعیت: همه / فعال / پیش‌نویس / آرشیو
- فیلتر موجودی: موجود / ناموجود / کم‌موجود (≤5)
- فیلتر قیمت: بازه تومان
- فیلتر تخفیف‌دار
- فیلتر جدید/پرفروش
- فیلتر تاریخ ایجاد

**Bulk Actions:**
- انتخاب چند محصول (checkbox)
- تغییر وضعیت گروهی
- حذف گروهی

### 2. فرم ایجاد/ویرایش محصول

**فایل:** `app/admin/(dashboard)/products/[id]/page.tsx`
**یا Dialog:** `components/admin/forms/product-form.tsx`

**ساختار Tabbed Form:**

**Tab 1: اطلاعات پایه**
- نام محصول (Input, اجباری)
- slug (Input, خودکار از نام)
- دسته‌بندی (TreeSelect, اجباری)
- برند (Select, اجباری)
- توضیحات کوتاه (Textarea, اجباری)

**Tab 2: قیمت‌گذاری**
- قیمت اصلی (Input, تومان, اجباری)
- قیمت تخفیف (Input, تومان, اختیاری)
- درصد تخفیف (خودکار محاسبه شود)

**Tab 3: موجودی و وضعیت**
- موجودی کل (Number)
- وضعیت: فعال / پیش‌نویس / آرشیو (Radio)
- محصول جدید (Switch)
- پرفروش (Switch)
- ترتیب نمایش (Number)

**Tab 4: رسانه**
- تصاویر محصول (File Upload چندگانه)
- Drag-and-drop برای مرتب‌سازی تصاویر
- حذف تصویر
- تصویر اصلی (اولین تصویر)
- ویدیوها (URL Input)

**Tab 5: واریانت‌ها (سایز + رنگ)**
- انتخاب رنگ‌ها (Multi-select از colors موجود)
- انتخاب سایزها (Multi-select از sizes موجود)
- جدول واریانت‌ها:
  ```
  رنگ    │ سایز  │ موجودی │ SKU        │ عملیات
  مشکی   │ 75    │ 10     │ ZV-BLK-75  │ [حذف]
  مشکی   │ 80    │ 5      │ ZV-BLK-80  │ [حذف]
  کرم    │ 75    │ 0      │ ZV-CRM-75  │ [حذف]
  ```
- افزودن واریانت جدید
- حذف واریانت
- SKU خودکار (اختیاری)

**Tab 6: SEO**
- عنوان SEO (Input)
- توضیحات SEO (Textarea)

**Tab 7: محتوای غنی (Rich Content)**
- بلوک‌های محتوا با انواع:
  - Heading (Input)
  - Text (Textarea)
  - List (Dynamic List Input)
  - Image (File Upload)
  - Table (Dynamic Table Editor)
- Drag-and-drop برای مرتب‌سازی بلوک‌ها
- افزودن/حذف بلوک

### 3. API Routes

```
GET    /api/admin/products            → list with filters, pagination
GET    /api/admin/products/[id]       → full product with all relations
POST   /api/admin/products            → create with nested relations
PATCH  /api/admin/products/[id]       → update with transaction
DELETE /api/admin/products/[id]       → delete
```

**Create/Update Transaction:**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. ایجاد/بروزرسانی محصول اصلی
  const product = await tx.product.upsert({ ... });

  // 2. حذف روابط قبلی
  await tx.productImage.deleteMany({ where: { productId: id } });
  await tx.productColor.deleteMany({ where: { productId: id } });
  await tx.productSize.deleteMany({ where: { productId: id } });
  await tx.productVariant.deleteMany({ where: { productId: id } });
  await tx.productDetail.deleteMany({ where: { productId: id } });

  // 3. ایجاد روابط جدید
  await tx.productImage.createMany({ data: images });
  await tx.productColor.createMany({ data: colors });
  await tx.productSize.createMany({ data: sizes });
  await tx.productVariant.createMany({ data: variants });
  await tx.productDetail.createMany({ data: details });

  // 4. بروزرسانی موجودی کل
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  await tx.product.update({
    where: { id },
    data: { stock: totalStock },
  });
});
```

### 4. صفحه جزئیات محصول (اختیاری)

**فایل:** `app/admin/(dashboard)/products/[id]/detail/page.tsx`

- نمایش کامل محصول به صورت فقط-خواندنی
- تمام اطلاعات شامل تصاویر، واریانت‌ها، نظرات
- لینک ویرایش

## معیار پذیرش (Definition of Done)

- [ ] جدول محصولات با تمام ستون‌ها و فیلترها کار می‌کند
- [ ] فرم ایجاد محصول با 7 Tab کامل کار می‌کند
- [ ] فرم ویرایش محصول با پیش‌پر کردن فیلدها کار می‌کند
- [ ] آپلود تصویر (placeholder) کار می‌کند
- [ ] مدیریت واریانت‌ها (رنگ+سایز+موجودی) کار می‌کند
- [ ] مدیریت بلوک‌های محتوای غنی کار می‌کند
- [ ] slug خودکار تولید می‌شود
- [ ] درصد تخفیف خودکار محاسبه می‌شود
- [ ] موجودی کل از جمع واریانت‌ها محاسبه می‌شود
- [ ] حذف محصول با تأیید کار می‌کند
- [ ] Bulk actions کار می‌کنند
- [ ] Loading/Empty/Error States وجود دارد

## زمان تقریبی

**5 تا 7 ساعت**
