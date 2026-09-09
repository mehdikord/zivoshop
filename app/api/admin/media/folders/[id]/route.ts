import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

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
  const name = (body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ success: false, message: "نام پوشه الزامی است" }, { status: 400 });
  }

  const folder = await prisma.mediaFolder.findUnique({ where: { id: BigInt(id) } });
  if (!folder) {
    return NextResponse.json({ success: false, message: "پوشه یافت نشد" }, { status: 404 });
  }

  const existing = await prisma.mediaFolder.findUnique({ where: { name } });
  if (existing && existing.id !== folder.id) {
    return NextResponse.json({ success: false, message: "این نام پوشه قبلاً استفاده شده" }, { status: 409 });
  }

  const updated = await prisma.mediaFolder.update({ where: { id: folder.id }, data: { name } });

  return NextResponse.json({
    success: true,
    data: { id: updated.id.toString(), name: updated.name },
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
  const folder = await prisma.mediaFolder.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { media: true } } },
  });

  if (!folder) {
    return NextResponse.json({ success: false, message: "پوشه یافت نشد" }, { status: 404 });
  }

  if (folder._count.media > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `این پوشه ${folder._count.media} فایل دارد. ابتدا فایلها را حذف یا انتقال دهید.`,
      },
      { status: 409 }
    );
  }

  await prisma.mediaFolder.delete({ where: { id: folder.id } });

  return NextResponse.json({ success: true, data: null });
}
