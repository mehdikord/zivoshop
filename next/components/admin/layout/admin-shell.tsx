"use client";

import { SidebarProvider, useSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { cn } from "@/lib/utils";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "mr-16" : "mr-64"
        )}
      >
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellContent>{children}</ShellContent>
    </SidebarProvider>
  );
}
