import { prisma } from "./prisma";

// ── Activity Action Constants ──────────────────────────────────────────
export const ActivityActions = {
  // Auth
  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",
  AUTH_REGISTER: "auth.register",
  AUTH_FAILED_LOGIN: "auth.failed_login",
  AUTH_PASSWORD_CHANGE: "auth.password_change",

  // Products
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",

  // Categories
  CATEGORY_CREATED: "category.created",
  CATEGORY_UPDATED: "category.updated",
  CATEGORY_DELETED: "category.deleted",

  // Orders
  ORDER_UPDATED: "order.updated",
  ORDER_STATUS_CHANGED: "order.status_changed",

  // Payments
  PAYMENT_REQUESTED: "payment.requested",
  PAYMENT_VERIFIED: "payment.verified",
  PAYMENT_FAILED: "payment.failed",

  // Users
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  USER_TOGGLED: "user.toggled",

  // Admins
  ADMIN_CREATED: "admin.created",
  ADMIN_UPDATED: "admin.updated",
  ADMIN_DELETED: "admin.deleted",

  // Brands
  BRAND_CREATED: "brand.created",
  BRAND_UPDATED: "brand.updated",
  BRAND_DELETED: "brand.deleted",

  // Coupons
  COUPON_CREATED: "coupon.created",
  COUPON_UPDATED: "coupon.updated",
  COUPON_DELETED: "coupon.deleted",

  // Banners
  BANNER_CREATED: "banner.created",
  BANNER_UPDATED: "banner.updated",
  BANNER_DELETED: "banner.deleted",

  // Reviews
  REVIEW_APPROVED: "review.approved",
  REVIEW_REJECTED: "review.rejected",
  REVIEW_DELETED: "review.deleted",

  // Settings
  SETTINGS_UPDATED: "settings.updated",

  // Contact Messages
  CONTACT_READ: "contact.read",
  CONTACT_DELETED: "contact.deleted",

  // Colors / Sizes
  COLOR_CREATED: "color.created",
  COLOR_UPDATED: "color.updated",
  COLOR_DELETED: "color.deleted",
  SIZE_CREATED: "size.created",
  SIZE_UPDATED: "size.updated",
  SIZE_DELETED: "size.deleted",

  // Features
  FEATURE_CREATED: "feature.created",
  FEATURE_UPDATED: "feature.updated",
  FEATURE_DELETED: "feature.deleted",

  // Pages
  PAGE_CREATED: "page.created",
  PAGE_UPDATED: "page.updated",
  PAGE_DELETED: "page.deleted",

  // Media
  MEDIA_UPLOADED: "media.uploaded",
  MEDIA_DELETED: "media.deleted",
} as const;

export type ActivityAction = (typeof ActivityActions)[keyof typeof ActivityActions];

// ── Action Labels (Persian) for display ────────────────────────────────
export const ActivityActionLabels: Record<string, string> = {
  [ActivityActions.AUTH_LOGIN]: "ورود",
  [ActivityActions.AUTH_LOGOUT]: "خروج",
  [ActivityActions.AUTH_REGISTER]: "ثبت‌نام",
  [ActivityActions.AUTH_FAILED_LOGIN]: "ورود ناموفق",
  [ActivityActions.AUTH_PASSWORD_CHANGE]: "تغییر رمز عبور",
  [ActivityActions.PRODUCT_CREATED]: "ایجاد محصول",
  [ActivityActions.PRODUCT_UPDATED]: "ویرایش محصول",
  [ActivityActions.PRODUCT_DELETED]: "حذف محصول",
  [ActivityActions.CATEGORY_CREATED]: "ایجاد دسته‌بندی",
  [ActivityActions.CATEGORY_UPDATED]: "ویرایش دسته‌بندی",
  [ActivityActions.CATEGORY_DELETED]: "حذف دسته‌بندی",
  [ActivityActions.ORDER_UPDATED]: "ویرایش سفارش",
  [ActivityActions.ORDER_STATUS_CHANGED]: "تغییر وضعیت سفارش",
  [ActivityActions.PAYMENT_REQUESTED]: "درخواست پرداخت",
  [ActivityActions.PAYMENT_VERIFIED]: "تأیید پرداخت",
  [ActivityActions.PAYMENT_FAILED]: "پرداخت ناموفق",
  [ActivityActions.USER_CREATED]: "ایجاد کاربر",
  [ActivityActions.USER_UPDATED]: "ویرایش کاربر",
  [ActivityActions.USER_DELETED]: "حذف کاربر",
  [ActivityActions.USER_TOGGLED]: "تغییر وضعیت کاربر",
  [ActivityActions.ADMIN_CREATED]: "ایجاد مدیر",
  [ActivityActions.ADMIN_UPDATED]: "ویرایش مدیر",
  [ActivityActions.ADMIN_DELETED]: "حذف مدیر",
  [ActivityActions.BRAND_CREATED]: "ایجاد برند",
  [ActivityActions.BRAND_UPDATED]: "ویرایش برند",
  [ActivityActions.BRAND_DELETED]: "حذف برند",
  [ActivityActions.COUPON_CREATED]: "ایجاد کد تخفیف",
  [ActivityActions.COUPON_UPDATED]: "ویرایش کد تخفیف",
  [ActivityActions.COUPON_DELETED]: "حذف کد تخفیف",
  [ActivityActions.BANNER_CREATED]: "ایجاد بنر",
  [ActivityActions.BANNER_UPDATED]: "ویرایش بنر",
  [ActivityActions.BANNER_DELETED]: "حذف بنر",
  [ActivityActions.REVIEW_APPROVED]: "تایید نظر",
  [ActivityActions.REVIEW_REJECTED]: "رد نظر",
  [ActivityActions.REVIEW_DELETED]: "حذف نظر",
  [ActivityActions.SETTINGS_UPDATED]: "بروزرسانی تنظیمات",
  [ActivityActions.CONTACT_READ]: "خواندن پیام تماس",
  [ActivityActions.CONTACT_DELETED]: "حذف پیام تماس",
  [ActivityActions.COLOR_CREATED]: "ایجاد رنگ",
  [ActivityActions.COLOR_UPDATED]: "ویرایش رنگ",
  [ActivityActions.COLOR_DELETED]: "حذف رنگ",
  [ActivityActions.SIZE_CREATED]: "ایجاد سایز",
  [ActivityActions.SIZE_UPDATED]: "ویرایش سایز",
  [ActivityActions.SIZE_DELETED]: "حذف سایز",
  [ActivityActions.FEATURE_CREATED]: "ایجاد ویژگی",
  [ActivityActions.FEATURE_UPDATED]: "ویرایش ویژگی",
  [ActivityActions.FEATURE_DELETED]: "حذف ویژگی",
  [ActivityActions.PAGE_CREATED]: "ایجاد صفحه",
  [ActivityActions.PAGE_UPDATED]: "ویرایش صفحه",
  [ActivityActions.PAGE_DELETED]: "حذف صفحه",
  [ActivityActions.MEDIA_UPLOADED]: "آپلود فایل",
  [ActivityActions.MEDIA_DELETED]: "حذف فایل",
};

// ── Subject Type Labels ────────────────────────────────────────────────
export const SubjectTypeLabels: Record<string, string> = {
  Product: "محصول",
  Category: "دسته‌بندی",
  Order: "سفارش",
  User: "کاربر",
  Admin: "مدیر",
  Brand: "برند",
  Coupon: "کد تخفیف",
  Banner: "بنر",
  Review: "نظر",
  SiteSetting: "تنظیمات",
  ContactMessage: "پیام تماس",
  Color: "رنگ",
  Size: "سایز",
  Feature: "ویژگی",
  Page: "صفحه",
  Media: "فایل",
};

// ── Log Entry Type ─────────────────────────────────────────────────────
export interface ActivityLogEntry {
  userType: "admin" | "user";
  userId: string | number | bigint;
  action: string;
  subjectType?: string;
  subjectId?: string | number | bigint;
  properties?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// ── Background Batch Writer ────────────────────────────────────────────
// In-memory buffer that flushes to DB periodically.
// The logActivity() call is instant — no DB write blocks the request.

const FLUSH_INTERVAL_MS = 5000; // flush every 5 seconds
const FLUSH_BATCH_SIZE = 100; // or when buffer reaches this size

const buffer: ActivityLogEntry[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let isFlushing = false;

function ensureTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    flushBuffer();
  }, FLUSH_INTERVAL_MS);
  // Allow the process to exit even if the timer is running
  if (flushTimer && typeof flushTimer === "object" && "unref" in flushTimer) {
    flushTimer.unref();
  }
}

async function flushBuffer() {
  if (isFlushing || buffer.length === 0) return;
  isFlushing = true;

  const batch = buffer.splice(0, FLUSH_BATCH_SIZE);
  if (buffer.length === 0 && flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }

  try {
    await prisma.activityLog.createMany({
      data: batch.map((entry) => ({
        userType: entry.userType,
        userId: BigInt(entry.userId),
        action: entry.action,
        subjectType: entry.subjectType ?? null,
        subjectId: entry.subjectId ? BigInt(entry.subjectId) : null,
        properties: entry.properties ? JSON.parse(JSON.stringify(entry.properties)) : null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ? entry.userAgent.slice(0, 500) : null,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("[ActivityLogger] Failed to flush logs:", error);
    // Re-queue failed entries at the front so they get retried
    buffer.unshift(...batch);
  } finally {
    isFlushing = false;
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Log an activity in the background. This call is instant and never blocks
 * the request. Logs are batched in memory and flushed to the database every
 * 5 seconds or when the buffer reaches 100 entries.
 *
 * @example
 * logActivity({
 *   userType: "admin",
 *   userId: admin.id,
 *   action: ActivityActions.PRODUCT_CREATED,
 *   subjectType: "Product",
 *   subjectId: product.id,
 *   properties: { name: product.name, price: product.price },
 *   ipAddress: "127.0.0.1",
 * });
 */
export function logActivity(entry: ActivityLogEntry): void {
  try {
    buffer.push(entry);
    ensureTimer();

    // If buffer is large, flush immediately
    if (buffer.length >= FLUSH_BATCH_SIZE) {
      flushBuffer();
    }
  } catch (error) {
    // Never let logging errors affect the application
    console.error("[ActivityLogger] Buffer error:", error);
  }
}

/**
 * Extract IP address from a request (supports x-forwarded-for).
 */
export function extractIp(requestHeaders?: Headers): string | undefined {
  if (!requestHeaders) return undefined;
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || undefined;
  const realIp = requestHeaders.get("x-real-ip");
  if (realIp) return realIp.trim();
  return undefined;
}

/**
 * Extract User-Agent from request headers.
 */
export function extractUserAgent(requestHeaders?: Headers): string | undefined {
  if (!requestHeaders) return undefined;
  return requestHeaders.get("user-agent") ?? undefined;
}

/**
 * Flush remaining logs on server shutdown.
 */
export function registerShutdownHandler(): void {
  const shutdown = async () => {
    if (buffer.length > 0) {
      await flushBuffer();
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("beforeExit", () => {
    if (buffer.length > 0) flushBuffer();
  });
}

// Register shutdown handler once on module load
if (typeof process !== "undefined") {
  registerShutdownHandler();
}
