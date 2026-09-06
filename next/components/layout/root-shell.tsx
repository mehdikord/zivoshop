"use client";

import { usePathname } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <SiteShell>{children}</SiteShell>;
}
