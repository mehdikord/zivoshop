import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "فایلی ارسال نشد" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const uploaded: { path: string; alt: string }[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      uploaded.push({
        path: `/uploads/products/${filename}`,
        alt: file.name.replace(/\.[^.]+$/, ""),
      });
    }

    return NextResponse.json({
      success: true,
      data: uploaded,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در آپلود فایل" },
      { status: 500 }
    );
  }
}
