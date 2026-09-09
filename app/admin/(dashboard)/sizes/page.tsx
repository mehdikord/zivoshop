"use client";

import { useState, useCallback } from "react";
import { Ruler, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { AttributeFormDialog } from "@/components/admin/forms/attribute-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";

interface SizeRow {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
  [key: string]: unknown;
}

export default function SizesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<SizeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SizeRow | null>(null);

  const fetchData = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`/api/admin/sizes?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/sizes/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("سایز حذف شد");
      setDeleteTarget(null);
    } else {
      toast.error(data.message || "خطا در حذف");
    }
  };

  const columns: Column<SizeRow>[] = [
    {
      key: "name",
      header: "سایز",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-[var(--text)]">{row.name}</span>
      ),
    },
    {
      key: "sortOrder",
      header: "ترتیب",
      sortable: true,
      render: (row) => <span className="text-sm">{row.sortOrder}</span>,
    },
    {
      key: "productCount",
      header: "محصولات",
      sortable: true,
      render: (row) => <span className="text-sm">{row.productCount}</span>,
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
          <Ruler className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">مدیریت سایزها</h1>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          افزودن سایز
        </button>
      </div>

      <DataTable columns={columns} fetchData={fetchData} searchPlaceholder="جستجوی سایز..." />

      {showForm && (
        <AttributeFormDialog mode="create" type="size" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
      )}
      {editItem && (
        <AttributeFormDialog mode="edit" type="size" item={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          title="حذف سایز"
          message={`آیا از حذف "${deleteTarget.name}" اطمینان دارید؟`}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDelete}
        />
      )}
    </div>
  );
}
