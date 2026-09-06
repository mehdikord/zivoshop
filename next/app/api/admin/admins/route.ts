import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, hashPassword } from "@/lib/auth";
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
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "10"))
  );
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { mobile: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  const allowedSortFields = ["name", "mobile", "email", "isActive", "createdAt"];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const actualSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { [actualSortBy]: actualSortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.admin.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: admins.map((a) => ({
      ...a,
      id: a.id.toString(),
    })),
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
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
  const name = body.name?.trim();
  const mobile = toEnglishDigits(body.mobile).trim();
  const email = body.email ? body.email.trim() || null : null;
  const password = body.password;
  const isActive = body.isActive;

  if (!name || !mobile) {
    return NextResponse.json(
      { success: false, message: "نام و شماره موبایل الزامی است" },
      { status: 400 }
    );
  }

  if (!password || password.length < 6) {
    return NextResponse.json(
      { success: false, message: "گذرواژه باید حداقل ۶ کاراکتر باشد" },
      { status: 400 }
    );
  }

  const existing = await prisma.admin.findFirst({
    where: { OR: [{ mobile }, ...(email ? [{ email }] : [])] },
  });

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message:
          existing.mobile === mobile
            ? "این شماره موبایل قبلاً ثبت شده"
            : "این ایمیل قبلاً ثبت شده",
      },
      { status: 409 }
    );
  }

  const hashedPassword = await hashPassword(password);

  const created = await prisma.admin.create({
    data: {
      name,
      mobile,
      email,
      password: hashedPassword,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: created.id.toString(),
        name: created.name,
        mobile: created.mobile,
        email: created.email,
        isActive: created.isActive,
      },
    },
    { status: 201 }
  );
}
