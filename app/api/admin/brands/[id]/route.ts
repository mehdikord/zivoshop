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
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id: BigInt(id) },
    include: {
      _count: { select: { products: true } },
    },
  });

  if (!brand) {
    return NextResponse.json(
      { success: false, message: "برند یافت نشد" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: brand.id.toString(),
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
      sortOrder: brand.sortOrder,
      isActive: brand.isActive,
      productCount: brand._count.products,
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
  const { name, slug, description, logo, sortOrder, isActive } = body;

  const brand = await prisma.brand.findUnique({
    where: { id: BigInt(id) },
  });

  if (!brand) {
    return NextResponse.json(
      { success: false, message: "برند یافت نشد" },
      { status: 404 }
    );
  }

  if (name || slug) {
    const existing = await prisma.brand.findFirst({
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

  const updated = await prisma.brand.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description: description || null }),
      ...(logo !== undefined && { logo: logo || null }),
      ...(sortOrder !== undefined && { sortOrder: Number(toEnglishDigits(sortOrder)) }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.BRAND_UPDATED, subjectType: "Brand", subjectId: updated.id, properties: { name: updated.name }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

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
  const brand = await prisma.brand.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { products: true } } },
  });

  if (!brand) {
    return NextResponse.json(
      { success: false, message: "برند یافت نشد" },
      { status: 404 }
    );
  }

  if (brand._count.products > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `این برند ${brand._count.products} محصول دارد. ابتدا محصولات را حذف یا منتقل کنید.`,
      },
      { status: 409 }
    );
  }

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.BRAND_DELETED, subjectType: "Brand", subjectId: brand.id, properties: { name: brand.name }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

  await prisma.brand.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ success: true, data: null });
}