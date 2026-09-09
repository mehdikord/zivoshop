import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { key: { contains: search } },
    ];
  }
  if (type) where.type = type;

  const settings = await prisma.siteSetting.findMany({
    where,
    orderBy: { key: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: settings.map((s) => ({
      id: s.id.toString(),
      key: s.key,
      value: s.value,
      type: s.type,
      createdAt: s.createdAt?.toISOString() ?? null,
      updatedAt: s.updatedAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { key, value, type } = body;

  if (!key) {
    return NextResponse.json({ success: false, message: "کلید الزامی است" }, { status: 400 });
  }

  const validTypes = ["text", "json", "boolean", "integer"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ success: false, message: "نوع نامعتبر است" }, { status: 400 });
  }

  const existing = await prisma.siteSetting.findUnique({ where: { key } });
  if (existing) {
    return NextResponse.json({ success: false, message: "این کلید قبلاً وجود دارد" }, { status: 409 });
  }

  const setting = await prisma.siteSetting.create({
    data: {
      key,
      value: value ?? null,
      type: type ?? "text",
    },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.SETTINGS_UPDATED, subjectType: "SiteSetting", subjectId: setting.id, properties: { key: setting.key }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

  return NextResponse.json({
    success: true,
    data: { id: setting.id.toString(), key: setting.key, value: setting.value, type: setting.type },
  }, { status: 201 });
}