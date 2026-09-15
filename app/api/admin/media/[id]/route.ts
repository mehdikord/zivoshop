import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";
import { logActivity, extractIp, extractUserAgent, ActivityActions } from "@/lib/activity-logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const media = await prisma.media.findUnique({ where: { id: BigInt(id) } });
  if (!media) {
    return NextResponse.json({ success: false, message: "فایل یافت نشد" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.originalName !== undefined) {
    const name = (body.originalName ?? "").trim();
    if (!name) {
      return NextResponse.json({ success: false, message: "نام فایل الزامی است" }, { status: 400 });
    }
    data.originalName = name;
  }

  if (body.alt !== undefined) {
    data.alt = body.alt ? String(body.alt).trim() : null;
  }

  if (body.folderId !== undefined) {
    const folderIdRaw = toEnglishDigits(body.folderId);
    if (folderIdRaw === "null" || folderIdRaw === "") {
      data.folderId = null;
    } else {
      const folder = await prisma.mediaFolder.findUnique({ where: { id: BigInt(folderIdRaw) } });
      if (!folder) {
        return NextResponse.json({ success: false, message: "پوشه یافت نشد" }, { status: 404 });
      }
      data.folderId = folder.id;
    }
  }

  const updated = await prisma.media.update({ where: { id: media.id }, data });

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id.toString(),
      folderId: updated.folderId?.toString() ?? null,
      originalName: updated.originalName,
      alt: updated.alt,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id: BigInt(id) } });
  if (!media) {
    return NextResponse.json({ success: false, message: "فایل یافت نشد" }, { status: 404 });
  }

  // Remove the physical file (best-effort)
  try {
    const { unlink } = await import("fs/promises");
    const { storageFilePath } = await import("@/lib/storage");
    const filePath = storageFilePath("media", media.filename);
    await unlink(filePath);
  } catch {
    // file may already be missing; ignore
  }

  logActivity({ userType: "admin", userId: admin.id, action: ActivityActions.MEDIA_DELETED, subjectType: "Media", subjectId: media.id, properties: { filename: media.filename }, ipAddress: extractIp(_request.headers), userAgent: extractUserAgent(_request.headers) });

  await prisma.media.delete({ where: { id: media.id } });

  return NextResponse.json({ success: true, data: null });
}
