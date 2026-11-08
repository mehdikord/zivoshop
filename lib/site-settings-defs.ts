/**
 * Shared types, keys and defaults for structured site settings.
 * Pure module — no server-only imports — safe to import from both
 * Server Components and Client Components.
 */

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  /** Logo shown on light surfaces (header, menus). Empty = typographic wordmark. */
  siteLogo: string;
  /** Optional logo for dark surfaces (footer). Falls back to `siteLogo`. */
  siteLogoDark: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactHours: string;
  contactInstagram: string;
  contactTelegram: string;
  contactWhatsapp: string;
  mapLocation: string;
  mapLatitude: string;
  mapLongitude: string;
}

export interface SiteSettingsResult extends SiteSettings {
  updatedAt: string | null;
}

export const SITE_SETTING_KEYS = [
  "site_name",
  "site_description",
  "site_logo",
  "site_logo_dark",
  "contact_phone",
  "contact_email",
  "contact_address",
  "contact_hours",
  "contact_instagram",
  "contact_telegram",
  "contact_whatsapp",
  "contact_map_location",
  "contact_map_latitude",
  "contact_map_longitude",
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "زیوو",
  siteDescription:
    "زیوو فروشگاهی آنلاین و تخصصی در حوزه پوشاک بانوان است؛ از سوتین و شورت گرفته تا لباس خواب و لباس شب.",
  siteLogo: "",
  siteLogoDark: "",
  contactPhone: "021-26290000",
  contactEmail: "info@zivo.shop",
  contactAddress: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، شماره ۱۲۰",
  contactHours: "همه‌روزه ۹ صبح تا ۹ شب",
  contactInstagram: "https://instagram.com/zivo.shop",
  contactTelegram: "https://t.me/zivo.shop",
  contactWhatsapp: "",
  mapLocation: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، شماره ۱۲۰",
  mapLatitude: "35.7752",
  mapLongitude: "51.42",
};

/** Public branding subset passed from the root layout to client components. */
export interface SiteBranding {
  siteName: string;
  logo: string;
  logoDark: string;
}

export const DEFAULT_SITE_BRANDING: SiteBranding = {
  siteName: DEFAULT_SITE_SETTINGS.siteName,
  logo: "",
  logoDark: "",
};
