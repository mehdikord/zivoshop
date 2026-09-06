import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));

    const where = {
      productId: BigInt(productId),
      isApproved: true,
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          images: { select: { path: true }, orderBy: { sortOrder: "asc" as const } },
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
        productId: r.productId.toString(),
        userName: r.user?.name ?? "کاربر",
        rating: r.rating,
        title: r.title ?? undefined,
        content: r.content,
        date: r.createdAt?.toISOString() ?? "",
        images: r.images.map((i) => i.path),
        verifiedPurchase: r.verifiedPurchase,
      })),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت نظرات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, content, title } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, message: "امتیاز باید بین ۱ تا ۵ باشد" },
        { status: 400 }
      );
    }

    const cleanContent = String(content ?? "").trim();
    if (cleanContent.length < 2) {
      return NextResponse.json(
        { success: false, message: "متن دیدگاه نامعتبر است" },
        { status: 400 }
      );
    }
    const cleanTitle = title ? String(title).trim().slice(0, 255) : null;

    const product = await prisma.product.findUnique({
      where: { id: BigInt(productId) },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    const purchased = await prisma.order.findFirst({
      where: {
        userId: BigInt(user.id),
        items: { some: { productId: BigInt(productId) } },
        status: "delivered",
      },
      select: { id: true },
    });

    const review = await prisma.review.create({
      data: {
        productId: BigInt(productId),
        userId: BigInt(user.id),
        rating: ratingNum,
        title: cleanTitle,
        content: cleanContent,
        verifiedPurchase: purchased !== null,
        isApproved: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "دیدگاه شما ثبت شد. پس از تایید مدیر نمایش داده خواهد شد.",
      data: { id: review.id.toString() },
    });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت دیدگاه" },
      { status: 500 }
    );
  }
}
