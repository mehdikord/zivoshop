import { prisma } from "@/lib/prisma";
import {
  SITE_SETTING_KEYS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SITE_BRANDING,
  type SiteBranding,
  type SiteSettings,
  type SiteSettingsResult,
} from "@/lib/site-settings-defs";

/**
 * Server-only helpers that read structured settings from `site_settings`.
 * Presentational values (phone, address, social URLs, map coordinates)
 * are surfaced here with typed keys and sane defaults so the storefront
 * and the admin panel share one source of truth.
 */

type SettingRow = {
  key: string;
  value: string | null;
  updatedAt: Date | null;
};

const FIELD_BY_KEY: Record<(typeof SITE_SETTING_KEYS)[number], keyof SiteSettings> = {
  site_name: "siteName",
  site_description: "siteDescription",
  site_logo: "siteLogo",
  site_logo_dark: "siteLogoDark",
  contact_phone: "contactPhone",
  contact_email: "contactEmail",
  contact_address: "contactAddress",
  contact_hours: "contactHours",
  contact_instagram: "contactInstagram",
  contact_telegram: "contactTelegram",
  contact_whatsapp: "contactWhatsapp",
  contact_map_location: "mapLocation",
  contact_map_latitude: "mapLatitude",
  contact_map_longitude: "mapLongitude",
};

export function buildSiteSettings(rows: SettingRow[]): SiteSettingsResult {
  const saved = { ...DEFAULT_SITE_SETTINGS };

  for (const row of rows) {
    const field = FIELD_BY_KEY[row.key as (typeof SITE_SETTING_KEYS)[number]];
    if (field && row.value !== null && row.value !== "") {
      (saved[field] as string) = row.value;
    }
  }

  const updatedTimes = rows
    .map((row) => row.updatedAt)
    .filter((date): date is Date => date !== null);

  return {
    ...saved,
    updatedAt:
      updatedTimes.length > 0
        ? new Date(Math.max(...updatedTimes.map((date) => date.getTime()))).toISOString()
        : null,
  };
}

export async function getSiteSettings(): Promise<SiteSettingsResult> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [...SITE_SETTING_KEYS] } },
    select: {
      key: true,
      value: true,
      updatedAt: true,
    },
  });

  return buildSiteSettings(rows);
}

/**
 * Branding for the storefront chrome (logo + name). Never throws: if the
 * database is unreachable the typographic wordmark is used instead.
 */
export async function getSiteBranding(): Promise<SiteBranding> {
  try {
    const settings = await getSiteSettings();
    return {
      siteName: settings.siteName,
      logo: settings.siteLogo,
      logoDark: settings.siteLogoDark,
    };
  } catch (error) {
    console.error("getSiteBranding error:", error);
    return DEFAULT_SITE_BRANDING;
  }
}
