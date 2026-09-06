import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";

export async function GET() {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      _count: {
        select: { products: true, children: true },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: categories.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      parentId: c.parentId?.toString() ?? null,
      parentName: c.parent?.name ?? null,
      productCount: c._count.products,
      childCount: c._count.children,
    })),
  });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { name, slug, description, image, sortOrder, parentId, isActive } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { success: false, message: "نام و slug الزامی است" },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message:
          existing.name === name
            ? "این نام قبلاً استفاده شده"
            : "این slug قبلاً استفاده شده",
      },
      { status: 409 }
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

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
      image: image || null,
      sortOrder: Number(toEnglishDigits(sortOrder ?? 0)),
      parentId: parentId ? BigInt(parentId) : null,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: category.id.toString(),
      name: category.name,
      slug: category.slug,
    },
  }, { status: 201 });
}
