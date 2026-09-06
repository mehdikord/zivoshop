import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAdminToken, setAdminAuthCookie } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { toEnglishDigits } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mobile = toEnglishDigits(body.mobile);
    const { password } = body;

    if (!mobile || !password) {
      return apiError("شماره موبایل و گذرواژه الزامی است", 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { mobile },
    });

    if (!admin) {
      return apiError("شماره موبایل یا گذرواژه اشتباه است", 401);
    }

    if (!admin.isActive) {
      return apiError("حساب شما غیرفعال است", 403);
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return apiError("شماره موبایل یا گذرواژه اشتباه است", 401);
    }

    const token = await signAdminToken({
      id: admin.id.toString(),
      name: admin.name,
      mobile: admin.mobile,
      role: "admin",
    });

    await setAdminAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: admin.id.toString(),
          name: admin.name,
          mobile: admin.mobile,
          email: admin.email,
          isActive: admin.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return apiError("خطای سرور", 500);
  }
}
