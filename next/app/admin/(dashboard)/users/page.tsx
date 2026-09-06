"use client";

import { useState } from "react";
import {
  Users,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { UserDetailDialog } from "@/components/admin/forms/user-detail-dialog";
import { UserEditDialog } from "@/components/admin/forms/user-edit-dialog";

interface UserRow {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  orderCount: number;
  [key: string]: unknown;
}

interface UserDetail {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalSpent: number;
  orderCount: number;
  orders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

const statusOptions = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غیرفعال" },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function UsersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [editUser, setEditUser] = useState<UserRow | null>(null);

  const fetchUsers = async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    if (statusFilter) searchParams.set("status", statusFilter);

    const res = await fetch(`/api/admin/users?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  };

  const handleViewDetail = async (user: UserRow) => {
    const res = await fetch(`/api/admin/users/${user.id}`);
    const json = await res.json();
    if (json.success) {
      setDetailUser(json.data);
    }
  };

  const columns: Column<UserRow>[] = [
    {
      key: "id",
      header: "شناسه",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]">
          #{row.id}
        </span>
      ),
    },
    {
      key: "name",
      header: "نام",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-[var(--text)]">{row.name}</span>
      ),
    },
    {
      key: "mobile",
      header: "موبایل",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm" dir="ltr">
          {row.mobile}
        </span>
      ),
    },
    {
      key: "email",
      header: "ایمیل",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.email || "-"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "وضعیت",
      sortable: true,
      render: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--success)]">
            <CheckCircle2 className="h-3 w-3" />
            فعال
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--destructive-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--destructive)]">
            <XCircle className="h-3 w-3" />
            غیرفعال
          </span>
        ),
    },
    {
      key: "orderCount",
      header: "سفارشات",
      sortable: true,
      render: (row) => <span className="text-sm">{row.orderCount}</span>,
    },
    {
      key: "createdAt",
      header: "تاریخ ثبت‌نام",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-[var(--text-muted)]">
          {formatDate(row.createdAt as string)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetail(row)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--info)]"
            title="جزئیات"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEditUser(row)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--primary)]"
            title="ویرایش"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-[var(--primary)]" />
        <h1 className="text-2xl font-bold text-[var(--text)]">
          مدیریت کاربران
        </h1>
      </div>

      <DataTable
        columns={columns}
        fetchData={fetchUsers}
        searchPlaceholder="جستجو بر اساس نام، موبایل یا ایمیل..."
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        }
      />

      {detailUser && (
        <UserDetailDialog
          user={detailUser}
          onClose={() => setDetailUser(null)}
        />
      )}

      {editUser && (
        <UserEditDialog
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={() => {
            setEditUser(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
