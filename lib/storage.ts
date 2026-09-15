import path from "path";
import { mkdir } from "fs/promises";

/** Allowed top-level folders inside storage/ */
export const STORAGE_CATEGORIES = ["media", "products"] as const;
export type StorageCategory = (typeof STORAGE_CATEGORIES)[number];

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogg",
  mov: "video/quicktime",
  qt: "video/quicktime",
};

/**
 * Absolute root for uploaded files.
 * Override with STORAGE_PATH on the server if you keep uploads outside the deploy tree.
 */
export function getStorageRoot(): string {
  const fromEnv = process.env.STORAGE_PATH?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "storage");
}

export function isStorageCategory(value: string): value is StorageCategory {
  return (STORAGE_CATEGORIES as readonly string[]).includes(value);
}

/** Public URL kept stable so existing DB rows keep working. */
export function storagePublicUrl(category: StorageCategory, filename: string): string {
  return `/uploads/${category}/${filename}`;
}

export function storageDir(category: StorageCategory): string {
  return path.join(getStorageRoot(), category);
}

export async function ensureStorageDir(category: StorageCategory): Promise<string> {
  const dir = storageDir(category);
  await mkdir(dir, { recursive: true });
  return dir;
}

export function storageFilePath(category: StorageCategory, filename: string): string {
  const safeName = path.basename(filename);
  if (!safeName || safeName === "." || safeName === "..") {
    throw new Error("Invalid filename");
  }
  return path.join(storageDir(category), safeName);
}

/**
 * Resolve a request path like ["media", "file.webp"] to an absolute file under storage/.
 * Rejects path traversal and unknown categories.
 */
export function resolveStoragePath(segments: string[]): string | null {
  if (segments.length !== 2) return null;

  const category = segments[0];
  const filename = segments[1];
  if (category === undefined || filename === undefined) return null;
  if (!isStorageCategory(category)) return null;

  const safeName = path.basename(filename);
  if (!safeName || safeName === "." || safeName === ".." || safeName !== filename) {
    return null;
  }

  const root = path.resolve(storageDir(category));
  const absolute = path.resolve(root, safeName);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    return null;
  }

  return absolute;
}

export function mimeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}
