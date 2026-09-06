import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts all Persian and Arabic-Indic digits found in a string to English
 * digits. Useful before storing numeric/mobile values in the database.
 */
export function toEnglishDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/**
 * Builds an OpenStreetMap embed URL for the given coordinates.
 * Returns null when the coordinates are missing or out of range.
 */
export function buildMapEmbedUrl(
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined
): string | null {
  const lat = Number.parseFloat(String(latitude ?? ""));
  const lng = Number.parseFloat(String(longitude ?? ""));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  const dLat = 0.008;
  const dLng = 0.012;
  const bbox = `${lng - dLng}%2C${lat - dLat}%2C${lng + dLng}%2C${lat + dLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fa-IR").format(Math.round(num));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "—";
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "همین الان";
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return formatDate(dateString);
  } catch {
    return "—";
  }
}