import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { id: BigInt(id), userId: BigInt(payload.id) },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "سفارش یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        userId: order.userId.toString(),
        status: order.status,
        subtotal: Number(order.subtotal),
        discountTotal: Number(order.discountTotal),
        shippingCost: Number(order.shippingCost),
        couponDiscount: Number(order.couponDiscount),
        total: Number(order.total),
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
        items: order.items.map((item) => ({
          id: item.id.toString(),
          productId: item.productId.toString(),
          name: item.productName,
          image: item.productImage,
          size: item.size ?? "",
          color: item.color ?? "",
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          unitDiscount: Number(item.unitDiscount),
          total: Number(item.total),
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت سفارش" },
      { status: 500 }
    );
  }
}