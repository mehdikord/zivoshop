import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET() {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const folders = await prisma.mediaFolder.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { media: true } } },
  });

  return NextResponse.json({
    success: true,
    data: folders.map((f) => ({
      id: f.id.toString(),
      name: f.name,
      count: f._count.media,
      createdAt: f.createdAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = (body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ success: false, message: "نام پوشه الزامی است" }, { status: 400 });
  }
  if (name.length > 255) {
    return NextResponse.json({ success: false, message: "نام پوشه طولانی است" }, { status: 400 });
  }

  const existing = await prisma.mediaFolder.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ success: false, message: "این نام پوشه قبلاً استفاده شده" }, { status: 409 });
  }

  const folder = await prisma.mediaFolder.create({ data: { name } });

  return NextResponse.json(
    {
      success: true,
      data: { id: folder.id.toString(), name: folder.name, count: 0 },
    },
    { status: 201 }
  );
}
