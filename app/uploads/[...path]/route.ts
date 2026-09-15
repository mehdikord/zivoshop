import { NextRequest, NextResponse } from "next/server";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { mimeFromFilename, resolveStoragePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { path: segments } = await context.params;
  const filePath = resolveStoragePath(segments);

  if (!filePath) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const filename = segments[segments.length - 1] ?? "file";
    const contentType = mimeFromFilename(filename);
    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}

/** HEAD for probes / CDNs without downloading the body */
export async function HEAD(_request: NextRequest, context: RouteContext) {
  const { path: segments } = await context.params;
  const filePath = resolveStoragePath(segments);

  if (!filePath) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new NextResponse(null, { status: 404 });
    }

    const filename = segments[segments.length - 1] ?? "file";
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": mimeFromFilename(filename),
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
