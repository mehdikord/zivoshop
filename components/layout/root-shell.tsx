"use client";

import { usePathname } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { AuthInitializer } from "@/components/auth/auth-initializer";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <AuthInitializer>
      <SiteShell>{children}</SiteShell>
    </AuthInitializer>
  );
}
