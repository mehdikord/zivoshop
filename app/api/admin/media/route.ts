import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { toEnglishDigits } from "@/lib/utils";

const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];
const ALLOWED_VIDEO_MIME = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "24")));
  const search = (searchParams.get("search") ?? "").trim();
  const type = searchParams.get("type") ?? "";
  const folderId = searchParams.get("folderId") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { originalName: { contains: search } },
      { filename: { contains: search } },
      { alt: { contains: search } },
    ];
  }
  if (type) where.type = type;
  if (folderId) {
    where.folderId = BigInt(folderId);
  } else if (searchParams.get("folderId") === "none") {
    where.folderId = null;
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { folder: { select: { id: true, name: true } } },
    }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: media.map((m) => ({
      id: m.id.toString(),
      folderId: m.folderId?.toString() ?? null,
      folderName: m.folder?.name ?? null,
      filename: m.filename,
      originalName: m.originalName,
      url: m.url,
      type: m.type,
      mimeType: m.mimeType,
      size: m.size,
      width: m.width,
      height: m.height,
      alt: m.alt,
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

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folderIdRaw = toEnglishDigits((formData.get("folderId") as string) ?? "");

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "فایلی ارسال نشد" }, { status: 400 });
    }

    let folderId: bigint | null = null;
    if (folderIdRaw) {
      const folder = await prisma.mediaFolder.findUnique({ where: { id: BigInt(folderIdRaw) } });
      if (!folder) {
        return NextResponse.json({ success: false, message: "پوشه یافت نشد" }, { status: 404 });
      }
      folderId = folder.id;
    }

    const { writeFile } = await import("fs/promises");
    const { ensureStorageDir, storageFilePath, storagePublicUrl } = await import("@/lib/storage");
    await ensureStorageDir("media");

    const uploaded: {
      id: string;
      originalName: string;
      url: string;
      type: string;
      size: number;
      width: number | null;
      height: number | null;
      folderId: string | null;
    }[] = [];

    for (const file of files) {
      const mime = file.type || "";
      let type: "image" | "video";
      if (ALLOWED_IMAGE_MIME.includes(mime)) {
        type = "image";
      } else if (ALLOWED_VIDEO_MIME.includes(mime)) {
        type = "video";
      } else {
        continue;
      }

      if (file.size > MAX_SIZE) {
        continue;
      }

      const ext = (file.name.split(".").pop() ?? "").toLowerCase() || (type === "image" ? "jpg" : "mp4");
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = storageFilePath("media", filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      let width: number | null = null;
      let height: number | null = null;
      if (type === "image") {
        try {
          const size = await getImageSize(buffer, mime);
          width = size.width;
          height = size.height;
        } catch {
          // ignore size detection failures
        }
      }

      const created = await prisma.media.create({
        data: {
          folderId,
          filename,
          originalName: file.name.replace(/\.[^.]+$/, ""),
          url: storagePublicUrl("media", filename),
          type,
          mimeType: mime || null,
          size: file.size,
          width,
          height,
          alt: file.name.replace(/\.[^.]+$/, ""),
        },
      });

      uploaded.push({
        id: created.id.toString(),
        originalName: created.originalName,
        url: created.url,
        type: created.type,
        size: created.size,
        width: created.width,
        height: created.height,
        folderId: created.folderId?.toString() ?? null,
      });
    }

    return NextResponse.json({ success: true, data: uploaded, count: uploaded.length });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json({ success: false, message: "خطا در آپلود فایل" }, { status: 500 });
  }
}

async function getImageSize(
  buffer: Buffer,
  mime: string
): Promise<{ width: number; height: number }> {
  if (mime === "image/svg+xml") {
    const text = buffer.toString("utf8");
    const w = /width="?(\d+)/.exec(text)?.[1];
    const h = /height="?(\d+)/.exec(text)?.[1];
    return { width: w ? parseInt(w) : 0, height: h ? parseInt(h) : 0 };
  }
  if (mime === "image/gif") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }
  if (mime === "image/png") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (mime === "image/jpeg") {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      if (marker === 0xd8 || marker === 0xff) {
        offset += 2;
        continue;
      }
      if (
        marker !== undefined &&
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }
  // WebP / AVIF fallback via data URL proxy is complex; leave dimensions null
  return { width: 0, height: 0 };
}
