# فاز 11 — Jalali Date System

## هدف فاز

پیاده‌سازی سیستم تاریخ شمسی (Jalali) در پنل ادمین و API:
ذخیره‌سازی میلادی، نمایش شمسی، و تقویم مدرن شمسی برای انتخاب تاریخ.

## وابستگی‌ها

- فاز 09 (API Layer)

## خروجی‌های این فاز

### 1. Utility Functions

**فایل:** `lib/jalali.ts`

```typescript
import jalaali from "jalaali-js";

// تبدیل میلادی به شمسی - فرمت: "1404/05/15"
export function gregorianToJalali(date: Date): string

// تبدیل میلادی به شمسی با ساعت - "1404/05/15 14:30"
export function formatJalaliDateTime(date: Date): string

// تبدیل میلادی به شمسی با نام ماه - "15 مرداد 1404"
export function formatJalaliDate(date: Date): string

// تبدیل رشته شمسی به میلادی
export function jalaliToGregorian(jalaliStr: string): Date

// نام ماه شمسی
export function getJalaliMonthName(month: number): string

// نام روز هفته شمسی
export function getJalaliDayName(dayOfWeek: number): string
```

### 2. Jalali Date Picker

**فایل:** `components/admin/ui/jalali-date-picker.tsx`

- تقویم مدرن و زیبا
- RTL layout
- نمایش ماه شمسی با نام فارسی
- انتخاب روز
- برگرداندن Date میلادی برای API
- Keyboard accessible
- Matching Zivo design system

**پیاده‌سازی پیشنهادی:**
- استفاده از `react-day-picker` با adapter شمسی
- یا ساخت Custom Component با jalaali-js

### 3. Jalali Date Range Picker

**فایل:** `components/admin/ui/jalali-date-range-picker.tsx`

- انتخاب بازه تاریخ شمسی
- فیلدهای "از" و "تا"
- Validation: تاریخ پایان > تاریخ شروع

### 4. صفحات استفاده‌کننده

| صفحه | استفاده |
|------|---------|
| Dashboard | تاریخ نمودارها و سفارشات اخیر |
| Users | فیلتر تاریخ ثبت‌نام، ستون تاریخ |
| Orders | فیلتر تاریخ سفارش، ستون تاریخ، Timeline |
| Reviews | فیلتر تاریخ نظر، ستون تاریخ |
| Coupons | تاریخ شروع و پایان |
| Banners | تاریخ شروع و پایان |
| Activity Logs | timestamp |
| Contact Messages | فیلتر و ستون تاریخ |

### 5. مفهوم ذخیره‌سازی

- در دیتابیس: همه تاریخ‌ها UTC Timestamp
- در API: تاریخ‌ها به صورت ISO string
- در فرانت‌اند: تبدیل به شمسی برای نمایش
- در فرم‌ها: ورود شمسی → تبدیل به میلادی برای API

## معیار پذیرش (Definition of Done)

- [ ] lib/jalali.ts تمام utility functions را دارد
- [ ] Jalali Date Picker مدرن و کاربردی است
- [ ] Jalali Date Range Picker کار می‌کند
- [ ] تمام تاریخ‌ها در پنل ادمین شمسی نمایش داده می‌شوند
- [ ] فیلترهای تاریخ با تقویم شمسی کار می‌کنند
- [ ] تبدیل شمسی→میلادی در API صحیح است
- [ ] RTL در تقویم رعایت شده
- [ ] Keyboard accessibility وجود دارد

## زمان تقریبی

**3 تا 4 ساعت**
