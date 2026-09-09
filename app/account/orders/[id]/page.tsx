import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";
import { OrderDetailClient } from "./order-detail-client";
import type { Order } from "@/types";

type Props = { params: Promise<{ id: string }> };

async function fetchOrder(id: string): Promise<Order | null> {
  try {
    const payload = await verifyUserToken();
    if (!payload) return null;

    const order = await prisma.order.findFirst({
      where: { id: BigInt(id), userId: BigInt(payload.id) },
      include: {
        items: { orderBy: { createdAt: "desc" } },
        payments: {
          select: {
            referenceId: true,
            cardPan: true,
            status: true,
            gateway: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) return null;

    const successfulPayment = order.payments.find((p) => p.status === "successful");

    return {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId.toString(),
      items: order.items.map((item) => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        name: item.productName,
        image: item.productImage ?? "",
        size: item.size ?? "",
        color: item.color ?? "",
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        unitDiscount: Number(item.unitDiscount),
      })),
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      shippingAddress: {
        id: order.id.toString(),
        title: "آدرس ارسال",
        province: order.province,
        city: order.city,
        postalCode: order.postalCode,
        fullAddress: order.fullAddress,
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
      },
      customerNote: order.customerNote ?? undefined,
      trackNo: order.trackNo ?? undefined,
      status: order.status as Order["status"],
      createdAt: order.createdAt?.toISOString() ?? "",
      paymentRefId: successfulPayment?.referenceId ?? null,
      paymentCardPan: successfulPayment?.cardPan ?? null,
    };
  } catch (error) {
    console.error("fetch order detail error:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const order = await fetchOrder(id);
  return {
    title: order ? `سفارش ${order.orderNumber} | زیوو` : "سفارش یافت نشد | زیوو",
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await fetchOrder(id);
  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}