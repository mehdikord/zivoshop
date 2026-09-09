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
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { orders: true, addresses: true, reviews: true, wishlists: true } },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      ...user,
      id: user.id.toString(),
      totalSpent: user.orders.reduce((sum, o) => sum + Number(o.total), 0),
      orders: user.orders.map((o) => ({
        ...o,
        id: o.id.toString(),
        total: Number(o.total),
      })),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { name, email, isActive } = body;

  const user = await prisma.user.findUnique({
    where: { id: BigInt(id) },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email || null }),
      ...(isActive !== undefined && { isActive }),
    },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  logActivity({
    userType: "admin",
    userId: admin.id,
    action: isActive !== undefined ? ActivityActions.USER_TOGGLED : ActivityActions.USER_UPDATED,
    subjectType: "User",
    subjectId: updated.id,
    properties: { name: updated.name, isActive: updated.isActive },
    ipAddress: extractIp(request.headers),
    userAgent: extractUserAgent(request.headers),
  });

  return NextResponse.json({
    success: true,
    data: {
      ...updated,
      id: updated.id.toString(),
    },
  });
}
