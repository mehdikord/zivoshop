import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";
  const categoryId = searchParams.get("categoryId") ?? "";
  const brandId = searchParams.get("brandId") ?? "";
  const status = searchParams.get("status") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (categoryId) where.categoryId = BigInt(categoryId);
  if (brandId) where.brandId = BigInt(brandId);
  if (status) where.status = status;

  const allowedSort = ["name", "price", "stock", "rating", "createdAt", "sortOrder"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        _count: { select: { productColors: true, productSizes: true, variants: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: products.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price.toString(),
      discountPrice: p.discountPrice?.toString() ?? null,
      discountPercent: p.discountPercent,
      stock: p.stock,
      rating: Number(p.rating),
      reviewCount: p.reviewCount,
      status: p.status,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt?.toISOString() ?? null,
      categoryName: p.category.name,
      categoryId: p.category.id.toString(),
      brandName: p.brand.name,
      brandId: p.brand.id.toString(),
      thumbnail: p.images[0]?.path ?? null,
      colorCount: p._count.productColors,
      sizeCount: p._count.productSizes,
      variantCount: p._count.variants,
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name, slug, description, categoryId, brandId,
    price, discountPrice, discountPercent,
    stock, status, isNew, isBestseller,
    seoTitle, seoDescription, sortOrder,
    colorIds, sizeIds, images,
  } = body;

  if (!name || !slug || !categoryId || !brandId || price === undefined || price === "" || price === null) {
    return NextResponse.json(
      { success: false, message: "نام، slug، دسته‌بندی، برند و قیمت الزامی است" },
      { status: 400 }
    );
  }

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ success: false, message: "این slug قبلاً استفاده شده" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || "",
      categoryId: BigInt(categoryId),
      brandId: BigInt(brandId),
      price: BigInt(toEnglishDigits(price)),
      discountPrice:
        discountPrice !== undefined && discountPrice !== "" && discountPrice !== null
          ? BigInt(toEnglishDigits(discountPrice))
          : null,
      discountPercent:
        discountPercent !== undefined && discountPercent !== "" && discountPercent !== null
          ? Number(toEnglishDigits(discountPercent))
          : null,
      stock: stock !== undefined && stock !== "" ? Number(toEnglishDigits(stock)) : 0,
      status: status || "active",
      isNew: isNew ?? false,
      isBestseller: isBestseller ?? false,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      sortOrder: sortOrder !== undefined ? Number(toEnglishDigits(sortOrder)) : 0,
    },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.PRODUCT_CREATED, subjectType: "Product", subjectId: product.id, properties: { name: product.name, price: product.price.toString() }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

  // Link colors
  if (colorIds && Array.isArray(colorIds) && colorIds.length > 0) {
    await prisma.productColor.createMany({
      data: colorIds.map((colorId: string) => ({
        productId: product.id,
        colorId: BigInt(colorId),
      })),
    });
  }

  // Link sizes
  if (sizeIds && Array.isArray(sizeIds) && sizeIds.length > 0) {
    await prisma.productSize.createMany({
      data: sizeIds.map((sizeId: string) => ({
        productId: product.id,
        sizeId: BigInt(sizeId),
      })),
    });
  }

  // Link images
  if (images && Array.isArray(images) && images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((img: { path: string; alt?: string }, idx: number) => ({
        productId: product.id,
        path: img.path,
        alt: img.alt || null,
        sortOrder: idx,
      })),
    });
  }

  return NextResponse.json({
    success: true,
    data: { id: product.id.toString(), name: product.name, slug: product.slug },
  }, { status: 201 });
}
