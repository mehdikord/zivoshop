import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "ایمیل الزامی است" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "فرمت ایمیل نامعتبر است" },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, message: "این ایمیل قبلاً عضو شده است" },
          { status: 409 }
        );
      }
      await prisma.newsletter.update({
        where: { email },
        data: { isActive: true },
      });
    } else {
      await prisma.newsletter.create({ data: { email } });
    }

    return NextResponse.json({
      success: true,
      message: "با موفقیت عضو شدید",
    });
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در عضویت در خبرنامه" },
      { status: 500 }
    );
  }
}
