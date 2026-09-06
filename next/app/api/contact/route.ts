import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, mobile, email, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: "نام و پیام الزامی است" },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
      data: {
        name,
        mobile: mobile || "",
        email: email || null,
        subject: subject || null,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      message: "پیام شما با موفقیت ارسال شد",
    });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ارسال پیام" },
      { status: 500 }
    );
  }
}
