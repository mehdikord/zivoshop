"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_SITE_BRANDING,
  type SiteBranding,
} from "@/lib/site-settings-defs";

const BrandingContext = createContext<SiteBranding>(DEFAULT_SITE_BRANDING);

/**
 * Makes the admin-managed branding (logo + site name) available to the
 * client-side storefront chrome. The value is read on the server in the
 * root layout, so the logo is part of the first paint — no flash.
 */
export function BrandingProvider({
  value,
  children,
}: {
  value: SiteBranding;
  children: React.ReactNode;
}) {
  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}

export function useBranding(): SiteBranding {
  return useContext(BrandingContext);
}
