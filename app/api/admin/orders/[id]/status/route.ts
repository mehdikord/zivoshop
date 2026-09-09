import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

const validTransitions: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

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
  const { status, note, trackNo } = body;

  const order = await prisma.order.findUnique({
    where: { id: BigInt(id) },
  });

  if (!order) {
    return NextResponse.json({ success: false, message: "سفارش یافت نشد" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  const now = new Date();
  const adminId = BigInt(admin.id);

  if (status !== undefined && status !== null) {
    if (typeof status !== "string" || !status) {
      return NextResponse.json({ success: false, message: "وضعیت معتبر نیست" }, { status: 400 });
    }
    const allowed = validTransitions[order.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { success: false, message: `تغییر وضعیت از ${order.status} به ${status} مجاز نیست` },
        { status: 400 }
      );
    }

    updateData.status = status;

    switch (status) {
      case "processing":
        updateData.paidAt = updateData.paidAt ?? now;
        break;
      case "shipped":
        updateData.shippedAt = now;
        break;
      case "delivered":
        updateData.deliveredAt = now;
        break;
      case "cancelled":
        updateData.cancelledAt = now;
        break;
    }
  }

  if (trackNo !== undefined) {
    if (typeof trackNo !== "string") {
      return NextResponse.json(
        { success: false, message: "کد رهگیری معتبر نیست" },
        { status: 400 }
      );
    }
    updateData.trackNo = trackNo.trim() || null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { success: false, message: "هیچ تغییری اعمال نشد" },
      { status: 400 }
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: BigInt(id) },
      data: updateData,
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: BigInt(id),
        status: (typeof status === "string" ? status : order.status) as "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "pending",
        note: note || (trackNo !== undefined && trackNo
          ? `کد رهگیری ثبت شد: ${trackNo}`
          : null),
        adminId,
      },
    }),
  ]);

  logActivity({
    userType: "admin",
    userId: admin.id,
    action: ActivityActions.ORDER_STATUS_CHANGED,
    subjectType: "Order",
    subjectId: updated.id,
    properties: {
      orderNumber: updated.orderNumber,
      oldStatus: order.status,
      newStatus: updated.status,
      trackNo: updated.trackNo ?? undefined,
    },
    ipAddress: extractIp(request.headers),
    userAgent: extractUserAgent(request.headers),
  });

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id.toString(),
      orderNumber: updated.orderNumber,
      status: updated.status,
      trackNo: updated.trackNo,
    },
  });
}