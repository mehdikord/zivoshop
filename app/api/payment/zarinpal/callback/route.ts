import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { verifyPayment } from "@/lib/zarinpal";
import { logActivity, ActivityActions } from "@/lib/activity-logger";

/**
 * GET /api/payment/zarinpal/callback
 *
 * ZarinPal redirects here after payment.
 * Query params: Authority, Status
 * - Status=OK → verify with ZarinPal, update DB, redirect to success
 * - Status=NOK → redirect to failed page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get("Authority") || "";
  const status = searchParams.get("Status") || "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!authority || status !== "OK") {
    let failedOrderId = "";
    if (authority) {
      const failedPayment = await prisma.payment.findFirst({
        where: { authority },
        select: { orderId: true },
      });
      if (failedPayment) failedOrderId = failedPayment.orderId.toString();
    }
    const failUrl = failedOrderId
      ? `/order/failed?reason=cancelled&orderId=${failedOrderId}`
      : "/order/failed?reason=cancelled";
    return NextResponse.redirect(new URL(failUrl, appUrl));
  }

  const payment = await prisma.payment.findFirst({
    where: { authority },
    include: { order: true },
  });

  if (!payment) {
    return NextResponse.redirect(
      new URL("/order/failed?reason=not_found", appUrl),
    );
  }

  if (payment.status === "successful") {
    return NextResponse.redirect(
      new URL(`/order/success?id=${payment.orderId.toString()}`, appUrl),
    );
  }

  const amountToman = Number(payment.amount);

  const verifyResult = await verifyPayment(amountToman, authority);

  if (verifyResult.success) {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "successful",
          referenceId: String(verifyResult.refId),
          cardPan: verifyResult.cardPan || null,
          paidAt: new Date(),
          rawResponse: JSON.parse(
            JSON.stringify(verifyResult),
          ) as Prisma.InputJsonValue,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { paidAt: new Date(), status: "processing" },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: "processing",
          note: `پرداخت موفق — کد پیگیری: ${verifyResult.refId}`,
        },
      });
    });

    logActivity({
      userType: "user",
      userId: payment.order.userId,
      action: ActivityActions.PAYMENT_VERIFIED,
      subjectType: "Order",
      subjectId: payment.orderId,
      properties: {
        orderNumber: payment.order.orderNumber,
        amount: amountToman,
        authority,
        referenceId: verifyResult.refId,
        cardPan: verifyResult.cardPan,
      },
    });

    return NextResponse.redirect(
      new URL(
        `/order/success?id=${payment.orderId.toString()}&ref=${verifyResult.refId}`,
        appUrl,
      ),
    );
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "failed",
      rawResponse: JSON.parse(
        JSON.stringify(verifyResult),
      ) as Prisma.InputJsonValue,
    },
  });

  logActivity({
    userType: "user",
    userId: payment.order.userId,
    action: ActivityActions.PAYMENT_FAILED,
    subjectType: "Order",
    subjectId: payment.orderId,
    properties: {
      orderNumber: payment.order.orderNumber,
      amount: amountToman,
      authority,
      code: verifyResult.code,
      message: verifyResult.message,
    },
  });

  return NextResponse.redirect(
    new URL(
      `/order/failed?reason=verify_failed&orderId=${payment.orderId.toString()}`,
      appUrl,
    ),
  );
}
