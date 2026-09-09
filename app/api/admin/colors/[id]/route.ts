import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
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
  const color = await prisma.color.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { productColors: true } } },
  });

  if (!color) {
    return NextResponse.json({ success: false, message: "رنگ یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: color.id.toString(),
      name: color.name,
      hex: color.hex,
      productCount: color._count.productColors,
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
  const { name, hex } = body;

  const color = await prisma.color.findUnique({ where: { id: BigInt(id) } });
  if (!color) {
    return NextResponse.json({ success: false, message: "رنگ یافت نشد" }, { status: 404 });
  }

  if (name) {
    const existing = await prisma.color.findFirst({
      where: { name, NOT: { id: BigInt(id) } },
    });
    if (existing) {
      return NextResponse.json({ success: false, message: "این نام تکراری است" }, { status: 409 });
    }
  }

  const updated = await prisma.color.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(hex !== undefined && { hex }),
    },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.COLOR_UPDATED, subjectType: "Color", subjectId: updated.id, properties: { name: updated.name }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

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
  const color = await prisma.color.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { productColors: true, productVariants: true } } },
  });

  if (!color) {
    return NextResponse.json({ success: false, message: "رنگ یافت نشد" }, { status: 404 });
  }

  const usage = color._count.productColors + color._count.productVariants;
  if (usage > 0) {
    return NextResponse.json(
      { success: false, message: `این رنگ در ${usage} محصول/варیانت استفاده شده.` },
      { status: 409 }
    );
  }

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.COLOR_DELETED, subjectType: "Color", subjectId: color.id, properties: { name: color.name }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

  await prisma.color.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true, data: null });
}
