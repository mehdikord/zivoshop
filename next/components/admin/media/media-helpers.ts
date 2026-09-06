export interface MediaItem {
  id: string;
  folderId: string | null;
  folderName: string | null;
  filename: string;
  originalName: string;
  url: string;
  type: "image" | "video";
  mimeType: string | null;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string | null;
}

export interface MediaFolder {
  id: string;
  name: string;
  count: number;
  createdAt: string | null;
}

export type MediaAcceptType = "image" | "video" | "all";

export function formatBytes(bytes: number): string {
  if (!bytes) return "۰";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  return (
    new Intl.NumberFormat("fa-IR").format(Number(digits)) + " " + units[unit]
  );
}

export function formatMediaDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function isAllowedType(type: string, accept: MediaAcceptType): boolean {
  if (accept === "all") return true;
  return type === accept;
}
