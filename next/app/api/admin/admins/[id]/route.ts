import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, hashPassword } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";

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
  const fetched = await prisma.admin.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!fetched) {
    return NextResponse.json(
      { success: false, message: "مدیر یافت نشد" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      ...fetched,
      id: fetched.id.toString(),
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

  const name = body.name !== undefined ? body.name?.trim() : undefined;
  const mobile =
    body.mobile !== undefined ? toEnglishDigits(body.mobile).trim() : undefined;
  const email =
    body.email !== undefined
      ? (body.email ? String(body.email).trim() : null)
      : undefined;
  const password = body.password;
  const isActive = body.isActive;

  const target = await prisma.admin.findUnique({
    where: { id: BigInt(id) },
  });

  if (!target) {
    return NextResponse.json(
      { success: false, message: "مدیر یافت نشد" },
      { status: 404 }
    );
  }

  if (mobile || email) {
    const existing = await prisma.admin.findFirst({
      where: {
        OR: [
          ...(mobile ? [{ mobile }] : []),
          ...(email ? [{ email }] : []),
        ],
        NOT: { id: BigInt(id) },
      },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "شماره موبایل یا ایمیل تکراری است",
        },
        { status: 409 }
      );
    }
  }

  if (password !== undefined && password !== "" && password.length < 6) {
    return NextResponse.json(
      { success: false, message: "گذرواژه باید حداقل ۶ کاراکتر باشد" },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (mobile !== undefined) data.mobile = mobile;
  if (email !== undefined) data.email = email || null;
  if (isActive !== undefined) data.isActive = isActive;
  if (password && password !== "") data.password = await hashPassword(password);

  const updated = await prisma.admin.update({
    where: { id: BigInt(id) },
    data,
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      ...updated,
      id: updated.id.toString(),
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

  if (admin.id === id) {
    return NextResponse.json(
      { success: false, message: "شما نمیتوانید حساب خودتان را حذف کنید" },
      { status: 400 }
    );
  }

  const target = await prisma.admin.findUnique({
    where: { id: BigInt(id) },
  });

  if (!target) {
    return NextResponse.json(
      { success: false, message: "مدیر یافت نشد" },
      { status: 404 }
    );
  }

  if (target.isActive) {
    const activeCount = await prisma.admin.count({ where: { isActive: true } });
    if (activeCount <= 1) {
      return NextResponse.json(
        {
          success: false,
          message: "حداقل یک مدیر فعال باید وجود داشته باشد",
        },
        { status: 409 }
      );
    }
  }

  await prisma.admin.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ success: true, data: null });
}
