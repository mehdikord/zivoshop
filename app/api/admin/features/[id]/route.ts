import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const feature = await prisma.feature.findUnique({
    where: { id: BigInt(id) },
  });

  if (!feature) {
    return NextResponse.json({ success: false, message: "ویژگی یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: feature.id.toString(),
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      sortOrder: feature.sortOrder,
      isActive: feature.isActive,
      productCount: 0,
    },
  });
}

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
  const { title, description, icon, sortOrder, isActive } = body;

  const feature = await prisma.feature.findUnique({ where: { id: BigInt(id) } });
  if (!feature) {
    return NextResponse.json({ success: false, message: "ویژگی یافت نشد" }, { status: 404 });
  }

  const updated = await prisma.feature.update({
    where: { id: BigInt(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon: icon || null }),
      ...(sortOrder !== undefined && { sortOrder: Number(toEnglishDigits(sortOrder)) }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.FEATURE_UPDATED, subjectType: "Feature", subjectId: updated.id, properties: { title: updated.title }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

  return NextResponse.json({
    success: true,
    data: { id: updated.id.toString(), title: updated.title },
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
  const feature = await prisma.feature.findUnique({
    where: { id: BigInt(id) },
  });

  if (!feature) {
    return NextResponse.json({ success: false, message: "ویژگی یافت نشد" }, { status: 404 });
  }

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.FEATURE_DELETED, subjectType: "Feature", subjectId: feature.id, properties: { title: feature.title }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

  await prisma.feature.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true, data: null });
}
