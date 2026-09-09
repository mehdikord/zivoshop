"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/admin/layout/admin-sidebar";
import { PanelLeft, LogOut, Bell, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface AdminInfo {
  id: string;
  name: string;
  mobile: string;
  email?: string;
}

export function AdminHeader() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/auth/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdmin(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4">
      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] md:hidden"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden items-center gap-1 text-sm text-[var(--text-muted)] md:flex">
          <a
            href="/admin"
            className="text-[var(--primary)] hover:underline"
          >
            خانه
          </a>
          {pathname !== "/admin" &&
            pathname
              .split("/")
              .filter(Boolean)
              .filter((p) => p !== "admin")
              .map((segment, i, arr) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span
                    className={
                      i === arr.length - 1
                        ? "font-medium text-[var(--text)]"
                        : ""
                    }
                  >
                    {segment}
                  </span>
                </span>
              ))}
        </nav>
      </div>

      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button className="relative rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--destructive)]" />
        </button>

        {/* Admin dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-[var(--surface-secondary)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-medium text-white">
              {admin?.name?.charAt(0) || "A"}
            </div>
            <span className="hidden text-sm font-medium text-[var(--text)] md:block">
              {admin?.name || "Admin"}
            </span>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
                <div className="border-b border-[var(--border)] px-4 py-2">
                  <p className="text-sm font-medium text-[var(--text)]">
                    {admin?.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {admin?.mobile}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--destructive-light)]"
                >
                  <LogOut className="h-4 w-4" />
                  خروج از سیستم
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
