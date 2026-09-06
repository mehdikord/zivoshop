import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
  }

  const allowedSort = ["id", "name", "slug", "sortOrder", "isActive", "createdAt", "productCount"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";
  const dir = sortOrder === "asc" ? "asc" : "desc";

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy:
        actualSort === "productCount"
          ? { products: { _count: dir } }
          : { [actualSort]: dir },
      include: {
        _count: { select: { products: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.brand.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: brands.map((b) => ({
      id: b.id.toString(),
      name: b.name,
      slug: b.slug,
      description: b.description,
      logo: b.logo,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      createdAt: b.createdAt?.toISOString() ?? null,
      productCount: b._count.products,
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
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
  const { name, slug, description, logo, sortOrder, isActive } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { success: false, message: "نام و slug الزامی است" },
      { status: 400 }
    );
  }

  const existing = await prisma.brand.findFirst({
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

  const brand = await prisma.brand.create({
    data: {
      name,
      slug,
      description: description || null,
      logo: logo || null,
      sortOrder: Number(toEnglishDigits(sortOrder ?? 0)),
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: brand.id.toString(),
      name: brand.name,
      slug: brand.slug,
    },
  }, { status: 201 });
}