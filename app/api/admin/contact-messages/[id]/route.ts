import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
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
  const message = await prisma.contactMessage.findUnique({
    where: { id: BigInt(id) },
  });

  if (!message) {
    return NextResponse.json({ success: false, message: "پیام یافت نشد" }, { status: 404 });
  }

  if (!message.isRead) {
    await prisma.contactMessage.update({
      where: { id: BigInt(id) },
      data: { isRead: true },
    });
    message.isRead = true;
  }

  return NextResponse.json({
    success: true,
    data: {
      id: message.id.toString(),
      name: message.name,
      mobile: message.mobile,
      email: message.email,
      subject: message.subject,
      message: message.message,
      isRead: message.isRead,
      repliedAt: message.repliedAt?.toISOString() ?? null,
      createdAt: message.createdAt?.toISOString() ?? null,
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
  const { isRead, repliedAt } = body;

  const existing = await prisma.contactMessage.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "پیام یافت نشد" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (isRead !== undefined) updateData.isRead = isRead;
  if (repliedAt !== undefined) updateData.repliedAt = repliedAt ? new Date(repliedAt) : null;

  const message = await prisma.contactMessage.update({
    where: { id: BigInt(id) },
    data: updateData,
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.CONTACT_READ, subjectType: "ContactMessage", subjectId: message.id, properties: { name: message.name }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

  return NextResponse.json({
    success: true,
    data: { id: message.id.toString(), isRead: message.isRead },
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

  const existing = await prisma.contactMessage.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "پیام یافت نشد" }, { status: 404 });
  }

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.CONTACT_DELETED, subjectType: "ContactMessage", subjectId: existing.id, properties: { name: existing.name }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

  await prisma.contactMessage.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ success: true, message: "پیام حذف شد" });
}