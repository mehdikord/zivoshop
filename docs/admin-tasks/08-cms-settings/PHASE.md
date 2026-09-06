# فاز 08 — CMS & Settings

## هدف فاز

پیاده‌سازی بخش مدیریت محتوای سایت (CMS) شامل بنرها، صفحات ثابت،
تنظیمات سایت و پیام‌های تماس در پنل ادمین.

## وابستگی‌ها

- فاز 01 (Admin Auth & Layout)

## خروجی‌های این فاز

### 1. صفحه مدیریت بنرها

**فایل:** `app/admin/(dashboard)/banners/page.tsx`

**نمایش کارتی (Card View) به جای Table:**

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  [تصویر بنر Hero]   │  [تصویر Campaign]   │  [تصویر بنر]        │
│  عنوان: ...         │  عنوان: ...         │  عنوان: ...         │
│  موقعیت: Hero       │  موقعیت: Campaign   │  موقعیت: Sidebar    │
│  فعال ✅            │  فعال ✅            │  غیرفعال ❌         │
│  [ویرایش] [حذف]     │  [ویرایش] [حذف]     │  [ویرایش] [حذف]     │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**فیلترها:**
- فیلتر موقعیت (Hero/Campaign/Special Offer/Footer/Sidebar)
- فیلتر فعال/غیرفعال

### 2. دیالوگ ایجاد/ویرایش بنر

**فیلدها:**
| فیلد | نوع |
|------|------|
| عنوان | Input |
| زیرعنوان | Input |
| Eyebrow | Input |
| متن دکمه (CTA) | Input |
| لینک دکمه | Input |
| تصویر | File Upload |
| موقعیت | Select (hero/campaign/special_offer/footer/sidebar) |
| تراز | Select (start/center) |
| ترتیب | Number |
| فعال | Switch |
| تاریخ شروع | Jalali Date Picker |
| تاریخ پایان | Jalali Date Picker |

### 3. صفحه مدیریت صفحات ثابت

**فایل:** `app/admin/(dashboard)/pages/page.tsx`

**ستون‌ها:**
| ستون | فیلد | Sort |
|------|------|------|
| عنوان | title | بله |
| Slug | slug | بله |
| وضعیت | isActive | بله |
| تاریخ بروزرسانی | updatedAt | بله |

**فرم ویرایش صفحه (پیش‌نمایش):**
```
┌──────────────────────────────────────────┐
│  عنوان: [درباره ما]                       │
│  Slug: [about]                           │
│  [فعال]                                  │
│  محتوا:                                   │
│  ┌──────────────────────────────────────┐│
│  │  (Rich Text Editor / Markdown)      ││
│  │  درباره فروشگاه زیوو...              ││
│  └──────────────────────────────────────┘│
│  عنوان SEO: [درباره ما - زیوو]            │
│  توضیحات SEO: [توضیحات...]              │
│  [ذخیره]                                 │
└──────────────────────────────────────────┘
```

**صفحات پیش‌فرض:** درباره ما، تماس با ما، قوانین و مقررات، سوالات متداول

### 4. صفحه تنظیمات سایت

**فایل:** `app/admin/(dashboard)/settings/page.tsx`

**ساختار Tabbed:**

**Tab 1: عمومی**
- نام سایت
- توضیحات سایت
- شماره تماس
- ایمیل

**Tab 2: شبکه‌های اجتماعی**
- Instagram
- Telegram
- WhatsApp

**Tab 3: ارسال**
- آستانه ارسال رایگان (پیش‌فرض: 2,000,000)
- هزینه ارسال (پیش‌فرض: 45,000)

**Tab 4: SEO**
- متاتیتل پیش‌فرض
- متادسکریپشن پیش‌فرض

**Tab 5: پرداخت**
- درگاه فعال
- کلیدها (placeholder)

**ذخیره:** هر تنظیم به صورت key-value در جدول `site_settings`

### 5. صفحه پیام‌های تماس

**فایل:** `app/admin/(dashboard)/contact-messages/page.tsx`

**ستون‌ها:**
| ستون | فیلد | Sort | Filter |
|------|------|------|--------|
| نام | name | بله | جستجو |
| موبایل | mobile | بله | جستجو |
| موضوع | subject | بله | - |
| خوانده شده | isRead | بله | خوانده/نخوانده |
| تاریخ | createdAt | بله | بازه شمسی |
| عملیات | - | - | - |

**عملیات:**
- مشاهده پیام (Dialog)
- علامت‌گذاری خوانده/نخوانده
- حذف

### 6. API Routes

**Banners:**
```
GET    /api/admin/banners              → list
POST   /api/admin/banners              → create
PATCH  /api/admin/banners/[id]         → update
DELETE /api/admin/banners/[id]         → delete
```

**Pages:**
```
GET    /api/admin/pages                → list
POST   /api/admin/pages                → create
PATCH  /api/admin/pages/[id]           → update
DELETE /api/admin/pages/[id]           → delete
```

**Settings:**
```
GET    /api/admin/settings             → { key: value } object
PUT    /api/admin/settings             → bulk update
```

**Contact Messages:**
```
GET    /api/admin/contact-messages      → list
PATCH  /api/admin/contact-messages/[id] → toggle is_read
DELETE /api/admin/contact-messages/[id] → delete
```

## معیار پذیرش (Definition of Done)

- [ ] نمایش کارتی بنرها با پیش‌نمایش کار می‌کند
- [ ] CRUD بنرها کامل است
- [ ] CRUD صفحات ثابت کامل است
- [ ] تنظیمات سایت با Tab های مختلف ذخیره و بارگذاری می‌شود
- [ ] پیام‌های تماس با علامت خوانده/نخوانده کار می‌کند
- [ ] تقویم شمسی در تاریخ‌های بنر کار می‌کند
- [ ] Loading/Empty/Error States وجود دارد

## زمان تقریبی

**4 تا 5 ساعت**
