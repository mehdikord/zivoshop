import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: BigInt(id) },
    include: {
      parent: { select: { id: true, name: true } },
      children: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, slug: true, sortOrder: true, isActive: true },
      },
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    return NextResponse.json(
      { success: false, message: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: category.id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      parentId: category.parentId?.toString() ?? null,
      parentName: category.parent?.name ?? null,
      productCount: category._count.products,
      children: category.children.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
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
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { name, slug, description, image, sortOrder, parentId, isActive } = body;

  const category = await prisma.category.findUnique({
    where: { id: BigInt(id) },
  });

  if (!category) {
    return NextResponse.json(
      { success: false, message: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  }

  if (name || slug) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          ...(name ? [{ name }] : []),
          ...(slug ? [{ slug }] : []),
        ],
        NOT: { id: BigInt(id) },
      },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "نام یا slug تکراری است" },
        { status: 409 }
      );
    }
  }

  if (parentId && BigInt(parentId) === BigInt(id)) {
    return NextResponse.json(
      { success: false, message: "دسته‌بندی نمی‌تواند والد خودش باشد" },
      { status: 400 }
    );
  }

  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: BigInt(parentId) },
    });
    if (!parent) {
      return NextResponse.json(
        { success: false, message: "دسته‌بندی والد یافت نشد" },
        { status: 404 }
      );
    }
  }

  const updated = await prisma.category.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description: description || null }),
      ...(image !== undefined && { image: image || null }),
      ...(sortOrder !== undefined && { sortOrder: Number(toEnglishDigits(sortOrder)) }),
      ...(parentId !== undefined && {
        parentId: parentId ? BigInt(parentId) : null,
      }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id.toString(),
      name: updated.name,
      slug: updated.slug,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { products: true, children: true } } },
  });

  if (!category) {
    return NextResponse.json(
      { success: false, message: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  }

  if (category._count.children > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "این دسته‌بندی دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف کنید.",
      },
      { status: 409 }
    );
  }

  if (category._count.products > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `این دسته‌بندی ${category._count.products} محصول دارد. ابتدا محصولات را حذف یا منتقل کنید.`,
      },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ success: true, data: null });
}
