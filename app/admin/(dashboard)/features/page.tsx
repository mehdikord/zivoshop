"use client";

import { useState, useCallback } from "react";
import { Sparkles, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { AttributeFormDialog } from "@/components/admin/forms/attribute-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";

interface FeatureRow {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  [key: string]: unknown;
}

export default function FeaturesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<FeatureRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeatureRow | null>(null);

  const fetchData = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`/api/admin/features?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/features/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("ویژگی حذف شد");
      setDeleteTarget(null);
    } else {
      toast.error(data.message || "خطا در حذف");
    }
  };

  const columns: Column<FeatureRow>[] = [
    {
      key: "title",
      header: "عنوان",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-[var(--text)]">{row.title}</span>
      ),
    },
    {
      key: "description",
      header: "توضیحات",
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)] truncate max-w-[200px] block">
          {row.description || "-"}
        </span>
      ),
    },
    {
      key: "icon",
      header: "آیکون",
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]" dir="ltr">
          {row.icon || "-"}
        </span>
      ),
    },
    {
      key: "productCount",
      header: "محصولات",
      sortable: true,
      render: (row) => <span className="text-sm">{row.productCount}</span>,
    },
    {
      key: "isActive",
      header: "وضعیت",
      sortable: true,
      render: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
            <CheckCircle2 className="h-3.5 w-3.5" /> فعال
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--destructive)]">
            <XCircle className="h-3.5 w-3.5" /> غیرفعال
          </span>
        ),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditItem(row)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--primary)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--destructive-light)] hover:text-[var(--destructive)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">مدیریت ویژگی‌ها</h1>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          افزودن ویژگی
        </button>
      </div>

      <DataTable columns={columns} fetchData={fetchData} searchPlaceholder="جستجوی ویژگی..." />

      {showForm && (
        <AttributeFormDialog mode="create" type="feature" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
      )}
      {editItem && (
        <AttributeFormDialog mode="edit" type="feature" item={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          title="حذف ویژگی"
          message={`آیا از حذف "${deleteTarget.title}" اطمینان دارید؟`}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDelete}
        />
      )}
    </div>
  );
}
