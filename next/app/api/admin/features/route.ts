import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "sortOrder";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  const where: Record<string, unknown> = search ? { title: { contains: search } } : {};
  const allowedSort = ["title", "sortOrder", "isActive"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "sortOrder";

  const [features, total] = await Promise.all([
    prisma.feature.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feature.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: features.map((f) => ({
      id: f.id.toString(),
      title: f.title,
      description: f.description,
      icon: f.icon,
      sortOrder: f.sortOrder,
      isActive: f.isActive,
      productCount: 0,
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
  const { title, description, icon, sortOrder, isActive } = body;

  if (!title) {
    return NextResponse.json({ success: false, message: "عنوان ویژگی الزامی است" }, { status: 400 });
  }

  const feature = await prisma.feature.create({
    data: {
      title,
      description: description || "",
      icon: icon || null,
      sortOrder: Number(toEnglishDigits(sortOrder ?? 0)),
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({
    success: true,
    data: { id: feature.id.toString(), title: feature.title },
  }, { status: 201 });
}
