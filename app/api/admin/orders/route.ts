import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";
  const status = searchParams.get("status") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { receiverName: { contains: search } },
      { receiverPhone: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (userId) where.userId = BigInt(userId);
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt = { ...(where.createdAt as Record<string, unknown>), gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...(where.createdAt as Record<string, unknown>), lte: new Date(endDate) };
  }

  const allowedSort = ["orderNumber", "total", "status", "createdAt", "updatedAt"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      include: {
        user: { select: { id: true, name: true, mobile: true } },
        items: {
          take: 3,
          include: { product: { select: { id: true, name: true } } },
        },
        _count: { select: { items: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: orders.map((o) => ({
      id: o.id.toString(),
      orderNumber: o.orderNumber,
      status: o.status,
      subtotal: o.subtotal.toString(),
      discountTotal: o.discountTotal.toString(),
      shippingCost: o.shippingCost.toString(),
      couponDiscount: o.couponDiscount.toString(),
      total: o.total.toString(),
      receiverName: o.receiverName,
      receiverPhone: o.receiverPhone,
      city: o.city,
      trackNo: o.trackNo,
      paidAt: o.paidAt?.toISOString() ?? null,
      shippedAt: o.shippedAt?.toISOString() ?? null,
      deliveredAt: o.deliveredAt?.toISOString() ?? null,
      cancelledAt: o.cancelledAt?.toISOString() ?? null,
      createdAt: o.createdAt?.toISOString() ?? null,
      userName: o.user?.name ?? null,
      userMobile: o.user?.mobile ?? null,
      itemCount: o._count.items,
      firstItems: o.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
      })),
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}