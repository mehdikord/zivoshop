import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signUserToken, setUserAuthCookie } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, mobile, password } = body;

    if (!name || !mobile || !password) {
      return NextResponse.json(
        { success: false, message: "تمام فیلدها الزامی است" },
        { status: 400 }
      );
    }

    const cleanMobile = toEnglishDigits(mobile).replace(/\D/g, "");
    if (!/^09\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "گذرواژه باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { mobile: cleanMobile } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "این شماره موبایل قبلاً ثبت نام کرده است" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        mobile: cleanMobile,
        password: hashedPassword,
      },
    });

    const token = await signUserToken({
      id: user.id.toString(),
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: "customer",
    });

    await setUserAuthCookie(token);

    logActivity({ userType: "user", userId: user.id, action: ActivityActions.AUTH_REGISTER, properties: { name: user.name }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

    return NextResponse.json({
      success: true,
      message: `خوش آمدید ${user.name}`,
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          mobile: user.mobile,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}