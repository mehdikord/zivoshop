import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const items: {
      productId: string;
      name: string;
      image?: string;
      size?: string;
      color?: string;
      quantity: number;
      unitPrice: number;
      unitDiscount?: number;
    }[] = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: "آیتم‌های سفارش خالی است" },
        { status: 400 }
      );
    }

    const subtotal = Math.max(0, Math.round(Number(body.subtotal) || 0));
    const discountTotal = Math.max(0, Math.round(Number(body.discountTotal) || 0));
    const shippingCost = Math.max(0, Math.round(Number(body.shippingCost) || 0));
    const total = Math.max(0, Math.round(Number(body.total) || 0));

    const address = body.address ?? {};
    const receiverName = String(address.receiverName || payload.name || "").trim();
    const receiverPhone = String(address.receiverPhone || payload.mobile || "").trim();
    const province = String(address.province || "").trim();
    const city = String(address.city || "").trim();
    const postalCode = String(address.postalCode || "").trim();
    const fullAddress = String(address.fullAddress || "").trim();

    if (!receiverName || !receiverPhone || !province || !city || !postalCode || !fullAddress) {
      return NextResponse.json(
        { success: false, message: "اطلاعات آدرس ارسال کامل نیست" },
        { status: 400 }
      );
    }

    const customerNote =
      typeof body.customerNote === "string" && body.customerNote.trim()
        ? body.customerNote.trim()
        : null;

    const orderNumber = `ZV-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`;
    const userId = BigInt(payload.id);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          orderNumber,
          status: "processing",
          subtotal,
          discountTotal,
          shippingCost,
          couponDiscount: 0,
          total,
          receiverName,
          receiverPhone,
          province,
          city,
          postalCode,
          fullAddress,
          customerNote,
          paidAt: new Date(),
        },
      });

      const orderId = created.id;

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId,
          productId: BigInt(item.productId),
          productName: String(item.name || ""),
          productImage: item.image || null,
          size: item.size || null,
          color: item.color || null,
          quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
          unitPrice: Math.max(0, Math.round(Number(item.unitPrice) || 0)),
          unitDiscount: Math.max(0, Math.round(Number(item.unitDiscount) || 0)),
          total: Math.max(
            0,
            Math.round(
              (Math.max(0, Math.round(Number(item.unitPrice) || 0)) -
                Math.max(0, Math.round(Number(item.unitDiscount) || 0))) *
                Math.max(1, Math.round(Number(item.quantity) || 1))
            )
          ),
        })),
      });

      await tx.payment.create({
        data: {
          orderId,
          gateway: "online",
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          amount: total,
          status: "successful",
          paidAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "processing",
          note: "سفارش ثبت و پرداخت شد",
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: order.id.toString(),
          orderNumber: order.orderNumber,
          status: order.status,
          total: Number(order.total),
          createdAt: order.createdAt?.toISOString() ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت سفارش" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: BigInt(payload.id) },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: orders.map((o) => ({
        id: o.id.toString(),
        orderNumber: o.orderNumber,
        userId: o.userId.toString(),
        status: o.status,
        subtotal: Number(o.subtotal),
        discountTotal: Number(o.discountTotal),
        shippingCost: Number(o.shippingCost),
        couponDiscount: Number(o.couponDiscount),
        total: Number(o.total),
        receiverName: o.receiverName,
        receiverPhone: o.receiverPhone,
        province: o.province,
        city: o.city,
        postalCode: o.postalCode,
        fullAddress: o.fullAddress,
        customerNote: o.customerNote,
        adminNote: o.adminNote,
        trackNo: o.trackNo,
        paidAt: o.paidAt?.toISOString() ?? null,
        shippedAt: o.shippedAt?.toISOString() ?? null,
        deliveredAt: o.deliveredAt?.toISOString() ?? null,
        cancelledAt: o.cancelledAt?.toISOString() ?? null,
        createdAt: o.createdAt?.toISOString() ?? null,
        updatedAt: o.updatedAt?.toISOString() ?? null,
        items: o.items.map((item) => ({
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
      })),
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت سفارش‌ها" },
      { status: 500 }
    );
  }
}