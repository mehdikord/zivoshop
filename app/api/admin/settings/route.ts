import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import {
  SITE_SETTING_KEYS,
} from "@/lib/site-settings-defs";
import { buildSiteSettings } from "@/lib/site-settings";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

function validateSettings(body: Record<string, unknown>): string | null {
  const siteName =
    typeof body.siteName === "string" ? body.siteName.trim() : "";
  const phone =
    typeof body.contactPhone === "string" ? toEnglishDigits(body.contactPhone).trim() : "";
  const email =
    typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
  const address =
    typeof body.contactAddress === "string" ? body.contactAddress.trim() : "";
  const hours =
    typeof body.contactHours === "string" ? body.contactHours.trim() : "";
  const mapLocation =
    typeof body.mapLocation === "string" ? body.mapLocation.trim() : "";
  const latitude =
    typeof body.mapLatitude === "string" ? body.mapLatitude.trim() : "";
  const longitude =
    typeof body.mapLongitude === "string" ? body.mapLongitude.trim() : "";

  if (!siteName) return "نام سایت الزامی است";
  if (siteName.length > 100) return "نام سایت نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد";
  if (typeof body.siteDescription === "string" && body.siteDescription.length > 1000)
    return "توضیحات سایت نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد";
  if (!phone) return "تلفن تماس الزامی است";
  if (phone.replace(/\D/g, "").length < 6)
    return "تلفن تماس معتبر نیست";
  if (!email) return "ایمیل الزامی است";
  if (!EMAIL_RE.test(email)) return "ایمیل معتبر نیست";
  if (!address) return "آدرس الزامی است";
  if (address.length > 500) return "آدرس نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد";
  if (!hours) return "ساعت کاری الزامی است";
  if (hours.length > 200) return "ساعت کاری نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد";
  if (!mapLocation) return "موقعیت روی نقشه الزامی است";
  if (mapLocation.length > 500)
    return "موقعیت روی نقشه نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد";

  if (!latitude || !longitude) return "عرض و طول جغرافیایی الزامی است";

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    return "عرض جغرافیایی باید عددی بین ۹۰- تا ۹۰ باشد";
  if (!Number.isFinite(lng) || lng < -180 || lng > 180)
    return "طول جغرافیایی باید عددی بین ۱۸۰- تا ۱۸۰ باشد";

  for (const key of ["contactInstagram", "contactTelegram", "contactWhatsapp"] as const) {
    const value = body[key];
    if (typeof value === "string" && value.trim() && !URL_RE.test(value.trim()))
      return "لینک شبکه‌های اجتماعی باید با http یا https شروع شود";
  }

  return null;
}

async function readStructuredSettings() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [...SITE_SETTING_KEYS] } },
    select: {
      key: true,
      value: true,
      updatedAt: true,
    },
  });

  return buildSiteSettings(rows);
}

export async function GET() {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await readStructuredSettings();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تنظیمات" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const validationError = validateSettings(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const payload: Record<string, string> = {
      site_name: String(body.siteName ?? "").trim(),
      site_description: String(body.siteDescription ?? "").trim(),
      contact_phone: String(body.contactPhone ?? "").trim(),
      contact_email: String(body.contactEmail ?? "").trim(),
      contact_address: String(body.contactAddress ?? "").trim(),
      contact_hours: String(body.contactHours ?? "").trim(),
      contact_instagram: String(body.contactInstagram ?? "").trim(),
      contact_telegram: String(body.contactTelegram ?? "").trim(),
      contact_whatsapp: String(body.contactWhatsapp ?? "").trim(),
      contact_map_location: String(body.mapLocation ?? "").trim(),
      contact_map_latitude: String(body.mapLatitude ?? "").trim(),
      contact_map_longitude: String(body.mapLongitude ?? "").trim(),
    };

      await prisma.$transaction(
      Object.entries(payload).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value, type: "text" },
          create: { key, value, type: "text" },
        })
      )
    );

    const data = await readStructuredSettings();

    logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.SETTINGS_UPDATED, subjectType: "SiteSetting", properties: { keys: Object.keys(payload) }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ذخیره تنظیمات" },
      { status: 500 }
    );
  }
}