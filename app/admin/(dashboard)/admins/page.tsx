"use client";

import { useState, useCallback } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { AdminFormDialog } from "@/components/admin/forms/admin-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";

interface AdminRow {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  [key: string]: unknown;
}

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

const statusOptions = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غیرفعال" },
];

export default function AdminsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRow | null>(null);

  const fetchAdmins = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    if (statusFilter) searchParams.set("status", statusFilter);

    const res = await fetch(`/api/admin/admins?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, [statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/admins/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("مدیر حذف شد");
        setDeleteTarget(null);
        setStatusFilter("");
      } else {
        toast.error(data.message || "خطا در حذف");
        setDeleteTarget(null);
      }
    } catch {
      toast.error("خطای ارتباط با سرور");
    }
  };

  const columns: Column<AdminRow>[] = [
    {
      key: "id",
      header: "شناسه",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]">#{row.id}</span>
      ),
    },
    {
      key: "name",
      header: "نام",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-xs font-bold text-[var(--primary)]">
            {row.name.charAt(0)}
          </span>
          <span className="font-medium text-[var(--text)]">{row.name}</span>
        </div>
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
      key: "createdAt",
      header: "تاریخ ایجاد",
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
            onClick={() => setEditAdmin(row)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--primary)]"
            title="ویرایش"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--destructive-light)] hover:text-[var(--destructive)]"
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">مدیریت مدیران</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          افزودن مدیر
        </button>
      </div>

      <DataTable
        columns={columns}
        fetchData={fetchAdmins}
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

      {showForm && (
        <AdminFormDialog
          mode="create"
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}

      {editAdmin && (
        <AdminFormDialog
          mode="edit"
          admin={editAdmin}
          onClose={() => setEditAdmin(null)}
          onSaved={() => setEditAdmin(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          title="حذف مدیر"
          message={`آیا از حذف "${deleteTarget.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDelete}
        />
      )}
    </div>
  );
}
