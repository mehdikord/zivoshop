import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signUserToken, setUserAuthCookie } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل و گذرواژه الزامی است" },
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

    const user = await prisma.user.findUnique({ where: { mobile: cleanMobile } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل یا گذرواژه اشتباه است" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل یا گذرواژه اشتباه است" },
        { status: 401 }
      );
    }

    const token = await signUserToken({
      id: user.id.toString(),
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: "customer",
    });

    await setUserAuthCookie(token);

    logActivity({ userType: "user", userId: user.id, action: ActivityActions.AUTH_LOGIN, properties: { name: user.name }, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}