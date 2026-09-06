import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));
  const search = searchParams.get("search") ?? "";
  const isRead = searchParams.get("isRead") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { mobile: { contains: search } },
      { email: { contains: search } },
      { subject: { contains: search } },
      { message: { contains: search } },
    ];
  }
  if (isRead !== "") where.isRead = isRead === "true";

  const allowedSort = ["name", "mobile", "subject", "isRead", "createdAt"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: messages.map((m) => ({
      id: m.id.toString(),
      name: m.name,
      mobile: m.mobile,
      email: m.email,
      subject: m.subject,
      message: m.message,
      isRead: m.isRead,
      repliedAt: m.repliedAt?.toISOString() ?? null,
      createdAt: m.createdAt?.toISOString() ?? null,
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, mobile, email, subject, message } = body;

  if (!name || !mobile || !message) {
    return NextResponse.json({ success: false, message: "نام، موبایل و پیام الزامی است" }, { status: 400 });
  }

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name,
      mobile,
      email: email || null,
      subject: subject || null,
      message,
    },
  });

  return NextResponse.json({
    success: true,
    data: { id: contactMessage.id.toString(), name: contactMessage.name },
  }, { status: 201 });
}