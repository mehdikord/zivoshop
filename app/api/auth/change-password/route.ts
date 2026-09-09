import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword, verifyUserToken } from "@/lib/auth";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyUserToken();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "لطفا وارد حساب کاربری شوید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "گذرواژه فعلی و جدید الزامی است" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "گذرواژه باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: BigInt(payload.id) } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "گذرواژه فعلی اشتباه است" },
        { status: 401 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logActivity({ userType: "user", userId: user.id, action: ActivityActions.AUTH_PASSWORD_CHANGE, ipAddress: extractIp(request.headers), userAgent: extractUserAgent(request.headers) });

    return NextResponse.json({ success: true, message: "گذرواژه با موفقیت تغییر کرد" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}