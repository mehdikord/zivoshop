"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavGroups } from "@/components/admin/admin-nav-items";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useState, createContext, useContext } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 z-30 flex h-screen flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--surface)] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-[var(--border)]",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!collapsed && (
          <a href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <span className="text-sm font-bold text-white">Z</span>
            </div>
            <span className="text-lg font-bold text-[var(--text)]">زیوو</span>
            <span className="rounded bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">
              پنل ادمین
            </span>
          </a>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
