import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: BigInt(id) },
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      productColors: { include: { color: { select: { id: true, name: true, hex: true } } } },
      productSizes: { include: { size: { select: { id: true, name: true } } } },
      details: { orderBy: { sortOrder: "asc" } },
      _count: { select: { variants: true, reviews: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ success: false, message: "محصول یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: product.id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() ?? null,
      discountPercent: product.discountPercent,
      stock: product.stock,
      rating: Number(product.rating),
      reviewCount: product.reviewCount,
      status: product.status,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      sortOrder: product.sortOrder,
      createdAt: product.createdAt?.toISOString() ?? null,
      categoryName: product.category.name,
      categoryId: product.category.id.toString(),
      brandName: product.brand.name,
      brandId: product.brand.id.toString(),
      images: product.images.map((img) => ({
        id: img.id.toString(),
        path: img.path,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
      colors: product.productColors.map((pc) => ({
        id: pc.color.id.toString(),
        name: pc.color.name,
        hex: pc.color.hex,
      })),
      sizes: product.productSizes.map((ps) => ({
        id: ps.size.id.toString(),
        name: ps.size.name,
        stock: ps.stock,
      })),
      details: product.details.map((d) => ({
        id: d.id.toString(),
        type: d.type,
        content: d.content,
        src: d.src,
        alt: d.alt,
        sortOrder: d.sortOrder,
      })),
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
  const {
    name, slug, description, categoryId, brandId,
    price, discountPrice, discountPercent,
    stock, status, isNew, isBestseller,
    seoTitle, seoDescription, sortOrder,
    colorIds, sizeIds, images,
  } = body;

  const product = await prisma.product.findUnique({ where: { id: BigInt(id) } });
  if (!product) {
    return NextResponse.json({ success: false, message: "محصول یافت نشد" }, { status: 404 });
  }

  if (slug && slug !== product.slug) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: "این slug تکراری است" }, { status: 409 });
    }
  }

  const updated = await prisma.product.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(categoryId !== undefined && { categoryId: BigInt(categoryId) }),
      ...(brandId !== undefined && { brandId: BigInt(brandId) }),
      ...(price !== undefined && { price: BigInt(toEnglishDigits(price)) }),
      ...(discountPrice !== undefined && {
        discountPrice:
          discountPrice !== "" && discountPrice !== null && discountPrice !== 0
            ? BigInt(toEnglishDigits(discountPrice))
            : null,
      }),
      ...(discountPercent !== undefined && {
        discountPercent:
          discountPercent !== "" && discountPercent !== null && discountPercent !== 0
            ? Number(toEnglishDigits(discountPercent))
            : null,
      }),
      ...(stock !== undefined && { stock: Number(toEnglishDigits(stock)) }),
      ...(status !== undefined && { status }),
      ...(isNew !== undefined && { isNew }),
      ...(isBestseller !== undefined && { isBestseller }),
      ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
      ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
      ...(sortOrder !== undefined && { sortOrder: Number(toEnglishDigits(sortOrder)) }),
    },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.PRODUCT_UPDATED, subjectType: "Product", subjectId: updated.id, properties: { name: updated.name }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

  // Update colors
  if (colorIds && Array.isArray(colorIds)) {
    await prisma.productColor.deleteMany({ where: { productId: updated.id } });
    if (colorIds.length > 0) {
      await prisma.productColor.createMany({
        data: colorIds.map((colorId: string) => ({
          productId: updated.id,
          colorId: BigInt(colorId),
        })),
      });
    }
  }

  // Update sizes
  if (sizeIds && Array.isArray(sizeIds)) {
    await prisma.productSize.deleteMany({ where: { productId: updated.id } });
    if (sizeIds.length > 0) {
      await prisma.productSize.createMany({
        data: sizeIds.map((sizeId: string) => ({
          productId: updated.id,
          sizeId: BigInt(sizeId),
        })),
      });
    }
  }

  // Update images ONLY if explicitly provided in the request
  if (images !== undefined && Array.isArray(images)) {
    await prisma.productImage.deleteMany({ where: { productId: updated.id } });
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img: { path: string; alt?: string }, idx: number) => ({
          productId: updated.id,
          path: img.path,
          alt: img.alt || null,
          sortOrder: idx,
        })),
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: { id: updated.id.toString(), name: updated.name, slug: updated.slug },
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
  const product = await prisma.product.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { orderItems: true, wishlists: true } } },
  });

  if (!product) {
    return NextResponse.json({ success: false, message: "محصول یافت نشد" }, { status: 404 });
  }

  if (product._count.orderItems > 0) {
    return NextResponse.json(
      { success: false, message: `این محصول در ${product._count.orderItems} سفارش وجود دارد. امکان حذف نیست.` },
      { status: 409 }
    );
  }

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.PRODUCT_DELETED, subjectType: "Product", subjectId: product.id, properties: { name: product.name }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

  await prisma.product.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true, data: null });
}
