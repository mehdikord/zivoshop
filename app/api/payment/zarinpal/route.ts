import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { verifyUserToken } from "@/lib/auth";
import { requestPayment } from "@/lib/zarinpal";
import {
  logActivity,
  extractIp,
  extractUserAgent,
  ActivityActions,
} from "@/lib/activity-logger";

/**
 * POST /api/payment/zarinpal
 *
 * Initiate a ZarinPal payment for an existing pending order.
 * Body: { orderId: string }
 * Returns: { success, data: { url, authority } }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const orderId = String(body.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "شناسه سفارش ارسال نشده" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: BigInt(orderId), userId: BigInt(payload.id) },
      include: {
        payments: {
          where: { status: "pending" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "سفارش یافت نشد" },
        { status: 404 },
      );
    }

    if (order.paidAt) {
      return NextResponse.json(
        { success: false, message: "این سفارش قبلاً پرداخت شده است" },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/payment/zarinpal/callback`;
    const totalToman = Number(order.total);

    const zarinpalRes = await requestPayment({
      amount: totalToman,
      description: `پرداخت سفارش ${order.orderNumber}`,
      callbackUrl,
      mobile: payload.mobile,
      orderId: order.orderNumber,
    });

    if (!zarinpalRes.success) {
      return NextResponse.json(
        {
          success: false,
          message: zarinpalRes.message || "خطا در اتصال به درگاه پرداخت",
        },
        { status: 502 },
      );
    }

    const existingPayment = order.payments[0];

    const rawJson = JSON.parse(JSON.stringify(zarinpalRes)) as Prisma.InputJsonValue;

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          authority: zarinpalRes.authority,
          gateway: "zarinpal",
          rawResponse: rawJson,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "zarinpal",
          authority: zarinpalRes.authority,
          amount: order.total,
          status: "pending",
          rawResponse: rawJson,
        },
      });
    }

    logActivity({
      userType: "user",
      userId: payload.id,
      action: ActivityActions.PAYMENT_REQUESTED,
      subjectType: "Order",
      subjectId: order.id,
      properties: {
        orderNumber: order.orderNumber,
        amount: Number(order.total),
        authority: zarinpalRes.authority,
        sandbox: process.env.ZARINPAL_SANDBOX === "true",
      },
      ipAddress: extractIp(request.headers),
      userAgent: extractUserAgent(request.headers),
    });

    return NextResponse.json({
      success: true,
      data: {
        url: zarinpalRes.url,
        authority: zarinpalRes.authority,
      },
    });
  } catch (error) {
    console.error("POST /api/payment/zarinpal error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در پردازش درخواست پرداخت" },
      { status: 500 },
    );
  }
}
