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
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const size = await prisma.size.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { productSizes: true } } },
  });

  if (!size) {
    return NextResponse.json({ success: false, message: "سایز یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: size.id.toString(),
      name: size.name,
      sortOrder: size.sortOrder,
      productCount: size._count.productSizes,
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
  const { name, sortOrder } = body;

  const size = await prisma.size.findUnique({ where: { id: BigInt(id) } });
  if (!size) {
    return NextResponse.json({ success: false, message: "سایز یافت نشد" }, { status: 404 });
  }

  if (name) {
    const existing = await prisma.size.findFirst({
      where: { name, NOT: { id: BigInt(id) } },
    });
    if (existing) {
      return NextResponse.json({ success: false, message: "این نام تکراری است" }, { status: 409 });
    }
  }

  const updated = await prisma.size.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(sortOrder !== undefined && { sortOrder: Number(toEnglishDigits(sortOrder)) }),
    },
  });

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
  const size = await prisma.size.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { productSizes: true, productVariants: true } } },
  });

  if (!size) {
    return NextResponse.json({ success: false, message: "سایز یافت نشد" }, { status: 404 });
  }

  const usage = size._count.productSizes + size._count.productVariants;
  if (usage > 0) {
    return NextResponse.json(
      { success: false, message: `این سایز در ${usage} محصول/واریانت استفاده شده.` },
      { status: 409 }
    );
  }

  await prisma.size.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true, data: null });
}
