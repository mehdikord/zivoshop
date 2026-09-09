import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const position = searchParams.get("position") ?? "";
  const isActive = searchParams.get("isActive") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "sortOrder";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { subtitle: { contains: search } },
    ];
  }
  if (position && !position.startsWith("all-")) where.position = position;
  if (isActive && isActive !== "all-status" && isActive !== "") where.isActive = isActive === "true";

  const allowedSort = ["title", "position", "sortOrder", "isActive", "createdAt"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "sortOrder";

  try {
    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.banner.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: banners.map((b) => ({
        id: b.id.toString(),
        title: b.title,
        subtitle: b.subtitle,
        eyebrow: b.eyebrow,
        ctaLabel: b.ctaLabel,
        href: b.href,
        image: b.image,
        position: b.position,
        align: b.align,
        sortOrder: b.sortOrder,
        isActive: b.isActive,
      })),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("GET /api/admin/banners error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت بنرها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, eyebrow, ctaLabel, href, image, position, align, sortOrder, isActive } = body;

    if (!title || !image) {
      return NextResponse.json({ success: false, message: "عنوان و تصویر الزامی است" }, { status: 400 });
    }

    const validPositions = ["hero", "campaign", "special_offer", "footer", "sidebar"];
    const validAligns = ["start", "center"];
    if (position && !validPositions.includes(position)) {
      return NextResponse.json({ success: false, message: "موقعیت نامعتبر است" }, { status: 400 });
    }
    if (align && !validAligns.includes(align)) {
      return NextResponse.json({ success: false, message: "ترازبندی نامعتبر است" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        eyebrow: eyebrow || null,
        ctaLabel: ctaLabel || null,
        href: href || null,
        image,
        position: position ?? "hero",
        align: align ?? "center",
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.BANNER_CREATED, subjectType: "Banner", subjectId: banner.id, properties: { title: banner.title, position: banner.position }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

    return NextResponse.json({
      success: true,
      data: { id: banner.id.toString(), title: banner.title },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/banners error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ایجاد بنر" },
      { status: 500 }
    );
  }
}
