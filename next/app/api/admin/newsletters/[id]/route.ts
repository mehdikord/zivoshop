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
  const { isActive } = body;

  if (isActive === undefined) {
    return NextResponse.json({ success: false, message: "وضعیت الزامی است" }, { status: 400 });
  }

  const existing = await prisma.newsletter.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "ایمیل یافت نشد" }, { status: 404 });
  }

  const newsletter = await prisma.newsletter.update({
    where: { id: BigInt(id) },
    data: { isActive },
  });

  return NextResponse.json({
    success: true,
    data: { id: newsletter.id.toString(), isActive: newsletter.isActive },
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

  const existing = await prisma.newsletter.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "ایمیل یافت نشد" }, { status: 404 });
  }

  await prisma.newsletter.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ success: true, message: "ایمیل حذف شد" });
}