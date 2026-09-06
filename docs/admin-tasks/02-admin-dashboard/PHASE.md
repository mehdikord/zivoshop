# فاز 02 — Admin Dashboard

## هدف فاز

طراحی و پیاده‌سازی صفحه داشبورد پنل ادمین با نمودارها، آمار کلیدی و
اطلاعات خلاصه که مدیر سایت بتواند در یک نگاه وضعیت فروشگاه را ببیند.

## وابستگی‌ها

- فاز 01 (Admin Auth & Layout) — Layout و احراز هویت باید آماده باشند.

## خروجی‌های این فاز

### 1. صفحه داشبورد

**فایل:** `app/admin/(dashboard)/page.tsx`

**Layout صفحه:**

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  درآمد کل   │  سفارشات    │  کاربران    │  محصولات    │
│  ماه جاری   │  ماه جاری   │  ثبت‌نامی   │  موجود     │
│  ↑ 12.5%    │  ↑ 8.3%     │  ↑ 15.2%    │  ↓ 2.1%    │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌────────────────────────┬────────────────────────────┐
│                        │                            │
│   نمودار درآمد ماهانه  │  توزیع وضعیت سفارشات      │
│   (6 ماه اخیر)        │  (Donut Chart)             │
│                        │                            │
└────────────────────────┴────────────────────────────┘

┌────────────────────────┬────────────────────────────┐
│                        │                            │
│   آخرین سفارشات        │  آخرین نظرات               │
│   (10 ردیف)           │  (5 ردیف)                  │
│                        │                            │
└────────────────────────┴────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                    عملیات سریع                       │
│  [+ محصول جدید]  [مشاهده سفارشات]  [مدیریت کاربران] │
└──────────────────────────────────────────────────────┘
```

### 2. کارت‌های آماری (Stats Cards)

**کامپوننت:** `components/admin/charts/stats-card.tsx`

**4 کارت اصلی:**

| عنوان | محاسبه | آیکون | رنگ |
|-------|--------|-------|-----|
| درآمد کل (ماه جاری) | SUM(total) orders where status=delivered AND month=current | DollarSign | سبز |
| سفارشات (ماه جاری) | COUNT(*) orders WHERE month=current | ShoppingCart | آبی |
| کاربران جدید (ماه جاری) | COUNT(*) users WHERE month=current | Users | بنفش |
| محصولات موجود | COUNT(*) products WHERE stock > 0 | Package | نارنجی |

**هر کارت شامل:**
- آیکون
- عنوان
- مقدار اصلی (عدد Persian)
- درصد تغییر نسبت به ماه قبل (↑ سبز / ↓ قرمز)
- Trend indicator

### 3. نمودار درآمد ماهانه

**کامپوننت:** `components/admin/charts/sales-chart.tsx`

- نمودار میله‌ای ساده (Bar Chart)
- 6 ماه اخیر
- محور X: نام ماه (فارسی)
- محور Y: مبلغ درآند (تومان، فرمت Persian)
- Tooltip با جزئیات
- رنگ primary با gradient ملایم

**پیاده‌سازی:** استفاده از یکی از روش‌های زیر:
- روش 1: کتابخانه سبک مثل `recharts` یا `chart.js`
- روش 2: CSS-based chart (bar های CSS با height پویا)
- روش 3: SVG-based chart ساده

### 4. نمودار توزیع سفارشات

**کامپوننت:** `components/admin/charts/orders-chart.tsx`

- Donut/Pie Chart
- توزیع سفارشات بر اساس وضعیت
- رنگ‌ها: pending (خاکستری), processing (آبی), shipped (بنفش), delivered (سبز), cancelled (قرمز), returned (نارنجی)
- Legend با درصد

### 5. جدول آخرین سفارشات

**کامپوننت:** `components/admin/charts/recent-orders-table.tsx`

- 10 سفارش اخیر
- ستون‌ها: شماره سفارش، نام مشتری، مبلغ، وضعیت (Badge)، تاریخ
- لینک به جزئیات سفارش
- وضعیت با Badge رنگی

### 6. آخرین نظرات

**کامپوننت:** `components/admin/charts/recent-reviews.tsx`

- 5 نظر اخیر
- نام محصول، نام کاربر، امتیاز (ستاره)، متن (مختصر)، تاریخ
- لینک به مدیریت نظرات

### 7. عملیات سریع

**کامپوننت:** `components/admin/charts/quick-actions.tsx`

- دکمه‌های لینک‌دار:
  - + محصول جدید → /admin/products/new
  - مشاهده سفارشات → /admin/orders
  - مدیریت کاربران → /admin/users
  - مدیریت نظرات → /admin/reviews

### 8. API Dashboard

**GET `/api/admin/dashboard`**

**Response:**
```typescript
{
  success: true,
  data: {
    stats: {
      totalRevenue: number,        // درآمد ماه جاری
      revenueChange: number,       // درصد تغییر نسبت به ماه قبل
      totalOrders: number,         // تعداد سفارشات ماه جاری
      ordersChange: number,
      totalUsers: number,          // کاربران جدید ماه جاری
      usersChange: number,
      totalProducts: number,       // محصولات موجود
      productsChange: number,
    },
    monthlyRevenue: Array<{
      month: string;               // "خرداد 1404"
      revenue: number;
    }>,
    ordersByStatus: Array<{
      status: string;
      count: number;
    }>,
    recentOrders: Order[],
    recentReviews: Review[],
  }
}
```

**Prisma Queries:**

```typescript
// درآمد ماه جاری
const currentMonthStart = startOfMonth(new Date());
const revenue = await prisma.order.aggregate({
  _sum: { total: true },
  where: {
    status: "delivered",
    createdAt: { gte: currentMonthStart },
  },
});

// سفارشات ماه جاری
const ordersCount = await prisma.order.count({
  where: {
    createdAt: { gte: currentMonthStart },
  },
});

// کاربران جدید ماه جاری
const usersCount = await prisma.user.count({
  where: {
    createdAt: { gte: currentMonthStart },
  },
});

// درآمد ماهانه 6 ماه اخیر
const monthlyRevenue = await prisma.$queryRaw`
  SELECT
    DATE_FORMAT(created_at, '%Y-%m') as month,
    SUM(total) as revenue
  FROM orders
  WHERE status = 'delivered'
    AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
  GROUP BY month
  ORDER BY month ASC
`;

// آخرین سفارشات
const recentOrders = await prisma.order.findMany({
  take: 10,
  orderBy: { createdAt: "desc" },
  include: { user: { select: { name: true } } },
});
```

## جزئیات UI

- **کارت‌ها:** Card با Border ظریف، Radius ملایم، Shadow نرم
- **اعداد:** فونت وزن 700، اعداد Persian (using formatNumber)
- **تاریخ‌ها:** نمایش شمسی (using jalaali-js)
- **تغییر درصد:** فلش ↑↓ با رنگ سبز/قرمز
- **Responsive:** در Tablet کارت‌ها 2x2، در Desktop 4x1
- **Loading:** Skeleton برای هر بخش

## معیار پذیرش (Definition of Done)

- [ ] 4 کارت آماری با داده‌های واقعی نمایش داده می‌شوند
- [ ] نمودار درآمد ماهانه 6 ماه اخیر را نشان می‌دهد
- [ ] نمودار توزیع سفارشات کار می‌کند
- [ ] جدول آخرین 10 سفارش با لینک به جزئیات کار می‌کند
- [ ] آخرین 5 نظر نمایش داده می‌شود
- [ ] دکمه‌های عملیات سریع لینک‌های صحیح دارند
- [ ] اعداد با فرمت Persian نمایش داده می‌شوند
- [ ] تاریخ‌ها به صورت شمسی نمایش داده می‌شوند
- [ ] Loading Skeleton در بارگذاری اولیه نمایش داده شود
- [ ] Responsive در Tablet و Mobile کار می‌کند
- [ ] API dashboard داده‌های صحیح برمی‌گرداند

## زمان تقریبی

**3 تا 4 ساعت**
