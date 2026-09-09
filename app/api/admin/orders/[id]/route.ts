import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: BigInt(id) },
    include: {
      user: { select: { id: true, name: true, mobile: true, email: true } },
      coupon: { select: { id: true, code: true, type: true, value: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } },
        },
        orderBy: { id: "asc" },
      },
      statusHistories: {
        include: { admin: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          gateway: true,
          authority: true,
          referenceId: true,
          cardPan: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, message: "سفارش یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal.toString(),
      discountTotal: order.discountTotal.toString(),
      shippingCost: order.shippingCost.toString(),
      couponDiscount: order.couponDiscount.toString(),
      total: order.total.toString(),
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      province: order.province,
      city: order.city,
      postalCode: order.postalCode,
      fullAddress: order.fullAddress,
      customerNote: order.customerNote,
      adminNote: order.adminNote,
      trackNo: order.trackNo,
      paidAt: order.paidAt?.toISOString() ?? null,
      shippedAt: order.shippedAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      createdAt: order.createdAt?.toISOString() ?? null,
      updatedAt: order.updatedAt?.toISOString() ?? null,
      user: order.user ? {
        id: order.user.id.toString(),
        name: order.user.name,
        mobile: order.user.mobile,
        email: order.user.email,
      } : null,
      coupon: order.coupon ? {
        id: order.coupon.id.toString(),
        code: order.coupon.code,
        type: order.coupon.type,
        value: order.coupon.value.toString(),
      } : null,
      items: order.items.map((item) => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        productName: item.productName,
        productSlug: item.product?.slug ?? null,
        productImage: item.productImage ?? item.product?.images[0]?.path ?? null,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        unitDiscount: item.unitDiscount.toString(),
        total: item.total.toString(),
      })),
      statusHistories: order.statusHistories.map((h) => ({
        id: h.id.toString(),
        status: h.status,
        note: h.note,
        adminName: h.admin?.name ?? null,
        createdAt: h.createdAt?.toISOString() ?? null,
      })),
      payments: order.payments.map((p) => ({
        id: p.id.toString(),
        amount: p.amount.toString(),
        status: p.status,
        method: p.gateway,
        refId: p.referenceId,
        authority: p.authority,
        cardPan: p.cardPan,
        createdAt: p.createdAt?.toISOString() ?? null,
      })),
    },
  });
}