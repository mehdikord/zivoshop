import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { value, type } = body;

  const existing = await prisma.siteSetting.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "تنظیم یافت نشد" }, { status: 404 });
  }

  const validTypes = ["text", "json", "boolean", "integer"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ success: false, message: "نوع نامعتبر است" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (value !== undefined) updateData.value = value;
  if (type !== undefined) updateData.type = type;

  const setting = await prisma.siteSetting.update({
    where: { id: BigInt(id) },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    data: { id: setting.id.toString(), key: setting.key, value: setting.value, type: setting.type },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.siteSetting.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "تنظیم یافت نشد" }, { status: 404 });
  }

  await prisma.siteSetting.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ success: true, message: "تنظیم حذف شد" });
}