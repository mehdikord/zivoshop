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

  try {
    const { id } = await params;
    const banner = await prisma.banner.findUnique({
      where: { id: BigInt(id) },
    });

    if (!banner) {
      return NextResponse.json({ success: false, message: "بنر یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: banner.id.toString(),
        title: banner.title,
        subtitle: banner.subtitle,
        eyebrow: banner.eyebrow,
        ctaLabel: banner.ctaLabel,
        href: banner.href,
        image: banner.image,
        position: banner.position,
        align: banner.align,
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/banners/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت بنر" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, eyebrow, ctaLabel, href, image, position, align, sortOrder, isActive } = body;

    const existing = await prisma.banner.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "بنر یافت نشد" }, { status: 404 });
    }

    const validPositions = ["hero", "campaign", "special_offer", "footer", "sidebar"];
    const validAligns = ["start", "center"];
    if (position && !validPositions.includes(position)) {
      return NextResponse.json({ success: false, message: "موقعیت نامعتبر است" }, { status: 400 });
    }
    if (align && !validAligns.includes(align)) {
      return NextResponse.json({ success: false, message: "ترازبندی نامعتبر است" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (eyebrow !== undefined) updateData.eyebrow = eyebrow;
    if (ctaLabel !== undefined) updateData.ctaLabel = ctaLabel;
    if (href !== undefined) updateData.href = href;
    if (image !== undefined) updateData.image = image;
    if (position !== undefined) updateData.position = position;
    if (align !== undefined) updateData.align = align;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const banner = await prisma.banner.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.BANNER_UPDATED, subjectType: "Banner", subjectId: banner.id, properties: { title: banner.title }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

    return NextResponse.json({
      success: true,
      data: { id: banner.id.toString(), title: banner.title },
    });
  } catch (error) {
    console.error("PATCH /api/admin/banners/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در به‌روزرسانی بنر" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "بنر یافت نشد" }, { status: 404 });
    }

    logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.BANNER_DELETED, subjectType: "Banner", subjectId: existing.id, properties: { title: existing.title }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

    await prisma.banner.delete({ where: { id: BigInt(id) } });

    return NextResponse.json({ success: true, message: "بنر حذف شد" });
  } catch (error) {
    console.error("DELETE /api/admin/banners/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در حذف بنر" },
      { status: 500 }
    );
  }
}
