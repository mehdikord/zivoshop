"use client";

import { useState, useCallback } from "react";
import { Palette, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { AttributeFormDialog } from "@/components/admin/forms/attribute-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";

interface ColorRow {
  id: string;
  name: string;
  hex: string;
  productCount: number;
  [key: string]: unknown;
}

export default function ColorsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ColorRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ColorRow | null>(null);

  const fetchData = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`/api/admin/colors?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/colors/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("رنگ حذف شد");
      setDeleteTarget(null);
    } else {
      toast.error(data.message || "خطا در حذف");
    }
  };

  const columns: Column<ColorRow>[] = [
    {
      key: "name",
      header: "رنگ",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: row.hex }}
          />
          <span className="font-medium text-[var(--text)]">{row.name}</span>
        </div>
      ),
    },
    {
      key: "hex",
      header: "کد رنگ",
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]" dir="ltr">
          {row.hex}
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
          <Palette className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">مدیریت رنگ‌ها</h1>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          افزودن رنگ
        </button>
      </div>

      <DataTable columns={columns} fetchData={fetchData} searchPlaceholder="جستجوی رنگ..." />

      {showForm && (
        <AttributeFormDialog mode="create" type="color" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />
      )}
      {editItem && (
        <AttributeFormDialog mode="edit" type="color" item={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          title="حذف رنگ"
          message={`آیا از حذف "${deleteTarget.name}" اطمینان دارید؟`}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDelete}
        />
      )}
    </div>
  );
}
