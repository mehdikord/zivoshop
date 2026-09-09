import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

async function refreshProductReviewStats(productId: bigint) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id: BigInt(id) },
    include: {
      user: { select: { id: true, name: true, mobile: true, email: true } },
      product: { select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!review) {
    return NextResponse.json({ success: false, message: "نظر یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: review.id.toString(),
      rating: review.rating,
      title: review.title,
      content: review.content,
      verifiedPurchase: review.verifiedPurchase,
      isApproved: review.isApproved,
      createdAt: review.createdAt?.toISOString() ?? null,
      updatedAt: review.updatedAt?.toISOString() ?? null,
      user: review.user ? { id: review.user.id.toString(), name: review.user.name, mobile: review.user.mobile, email: review.user.email } : null,
      product: review.product ? {
        id: review.product.id.toString(),
        name: review.product.name,
        slug: review.product.slug,
        image: review.product.images[0]?.path ?? null,
      } : null,
      images: review.images.map((img) => ({ id: img.id.toString(), path: img.path })),
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
  const { isApproved } = body;

  if (isApproved === undefined) {
    return NextResponse.json({ success: false, message: "وضعیت تایید الزامی است" }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "نظر یافت نشد" }, { status: 404 });
  }

  const review = await prisma.review.update({
    where: { id: BigInt(id) },
    data: { isApproved },
  });

  logActivity({
    userType: "admin",
    userId: admin.id,
    action: isApproved ? ActivityActions.REVIEW_APPROVED : ActivityActions.REVIEW_REJECTED,
    subjectType: "Review",
    subjectId: review.id,
    properties: { isApproved },
    ipAddress: extractIp(request.headers),
    userAgent: extractUserAgent(request.headers),
  });

  await refreshProductReviewStats(existing.productId);

  return NextResponse.json({
    success: true,
    data: {
      id: review.id.toString(),
      isApproved: review.isApproved,
    },
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

  const existing = await prisma.review.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "نظر یافت نشد" }, { status: 404 });
  }

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.REVIEW_DELETED, subjectType: "Review", subjectId: existing.id, properties: { rating: existing.rating }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

  await prisma.review.delete({ where: { id: BigInt(id) } });

  await refreshProductReviewStats(existing.productId);

  return NextResponse.json({ success: true, message: "نظر حذف شد" });
}