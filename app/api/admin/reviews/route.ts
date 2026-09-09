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
  const rating = searchParams.get("rating") ?? "";
  const isApproved = searchParams.get("isApproved") ?? "";
  const productId = searchParams.get("productId") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
      { user: { name: { contains: search } } },
      { product: { name: { contains: search } } },
    ];
  }
  if (rating) where.rating = parseInt(rating);
  if (isApproved !== "") where.isApproved = isApproved === "true";
  if (productId) where.productId = BigInt(productId);

  const allowedSort = ["rating", "createdAt", "updatedAt"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      include: {
        user: { select: { id: true, name: true, mobile: true } },
        product: { select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: reviews.map((r) => ({
      id: r.id.toString(),
      rating: r.rating,
      title: r.title,
      content: r.content,
      verifiedPurchase: r.verifiedPurchase,
      isApproved: r.isApproved,
      createdAt: r.createdAt?.toISOString() ?? null,
      updatedAt: r.updatedAt?.toISOString() ?? null,
      user: r.user ? { id: r.user.id.toString(), name: r.user.name, mobile: r.user.mobile } : null,
      product: r.product ? {
        id: r.product.id.toString(),
        name: r.product.name,
        slug: r.product.slug,
        image: r.product.images[0]?.path ?? null,
      } : null,
      images: r.images.map((img) => ({ id: img.id.toString(), path: img.path })),
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}