# فاز 06 — Review & Coupon Management

## هدف فاز

پیاده‌سازی صفحات مدیریت نظرات کاربران و کدهای تخفیف در پنل ادمین.

## وابستگی‌ها

- فاز 01 (Admin Auth & Layout)

## خروجی‌های این فاز

### 1. صفحه مدیریت نظرات

**فایل:** `app/admin/(dashboard)/reviews/page.tsx`

**ستون‌ها:**

| ستون | فیلد | Sort | Filter |
|------|------|------|--------|
| محصول | product.name | بله | جستجو |
| کاربر | user.name | بله | جستجو |
| امتیاز | rating | بله | چندانتخابی (1-5) |
| متن | content | خیر | جستجو |
| خرید تأیید شده | verifiedPurchase | بله | بله/خیر |
| تأیید شده | isApproved | بله | بله/خیر/همه |
| تاریخ | createdAt | بله | بازه شمسی |
| عملیات | - | خیر | - |

**عملیات:**
- تأیید/رد نظر (Toggle isApproved)
- حذف نظر (با تأیید)
- مشاهده کامل نظر (Dialog)

**آمار بالای صفحه:**
- کل نظرات
- میانگین امتیاز
- نظرات در انتظار تأیید

### 2. API Routes Reviews

```
GET    /api/admin/reviews              → list with filters
PATCH  /api/admin/reviews/[id]         → toggle isApproved
DELETE /api/admin/reviews/[id]         → delete + recalculate rating
```

**محاسبه مجدد امتیاز پس از تأیید/حذف:**
```typescript
async function recalculateProductRating(productId: number) {
  const stats = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    },
  });
}
```

### 3. صفحه مدیریت کدهای تخفیف

**فایل:** `app/admin/(dashboard)/coupons/page.tsx`

**ستون‌ها:**

| ستون | فیلد | Sort | Filter |
|------|------|------|--------|
| کد | code | بله | جستجو |
| نوع | type | بله | fixed/percent |
| مقدار | value | بله | - |
| حداقل سفارش | minOrderAmount | بله | - |
| استفاده/حد | usedCount/maxUses | بله | - |
| وضعیت | isActive + dates | بله | فعال/منقضی/تمام شده |
| تاریخ شروع | startsAt | بله | بازه شمسی |
| تاریخ پایان | expiresAt | بله | بازه شمسی |
| عملیات | - | - | - |

### 4. دیالوگ ایجاد/ویرایش کد تخفیف

**فیلدها:**
| فیلد | نوع | توضیح |
|------|------|-------|
| کد | Input | اجباری، خودکار Uppercase |
| نوع | Select | ثابت (fixed) / درصد (percent) |
| مقدار | Number | اجباری |
| حداقل مبلغ سفارش | Number | اختیاری |
| حداکثر استفاده | Number | اختیاری |
| تاریخ شروع | Jalali Date Picker | اختیاری |
| تاریخ پایان | Jalali Date Picker | اختیاری |
| وضعیت | Switch | فعال/غیرفعال |

**اعتبارسنجی:**
- کد یکتا باشد
- اگر نوع fixed است، مقدار > 0
- اگر نوع percent است، مقدار 1-100
- تاریخ پایان > تاریخ شروع

### 5. API Routes Coupons

```
GET    /api/admin/coupons              → list
POST   /api/admin/coupons              → create (validate code uniqueness)
PATCH  /api/admin/coupons/[id]         → update
DELETE /api/admin/coupons/[id]         → delete (check no orders using it)
```

## معیار پذیرش (Definition of Done)

- [ ] جدول نظرات با فیلترها و مرتب‌سازی کار می‌کند
- [ ] تأیید/رد نظر کار می‌کند
- [ ] حذف نظر + بازمحاسبه امتیاز محصول کار می‌کند
- [ ] جدول کدهای تخفیف کار می‌کند
- [ ] ایجاد/ویرایش کد تخفیف با اعتبارسنجی کار می‌کند
- [ ] وضعیت کد تخفیف (فعال/منقضی/تمام شده) صحیح است
- [ ] حذف کد تخفیف (با بررسی استفاده) کار می‌کند
- [ ] تقویم شمسی در انتخاب تاریخ کار می‌کند

## زمان تقریبی

**3 تا 4 ساعت**
