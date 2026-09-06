"use client";

import { useState, useCallback } from "react";
import { SlidersHorizontal, Palette, Ruler, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { AttributeFormDialog } from "@/components/admin/forms/attribute-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";
import { cn } from "@/lib/utils";

type TabKey = "colors" | "sizes";

interface ColorRow {
  id: string;
  name: string;
  hex: string;
  productCount: number;
  [key: string]: unknown;
}

interface SizeRow {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
  [key: string]: unknown;
}

export default function ProductAttributesPage() {
  const [tab, setTab] = useState<TabKey>("colors");

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ColorRow | SizeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ColorRow | SizeRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchColors = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`/api/admin/colors?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, []);

  const fetchSizes = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`/api/admin/sizes?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const endpoint = tab === "colors" ? "colors" : "sizes";
    const res = await fetch(`/api/admin/${endpoint}/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success(tab === "colors" ? "رنگ حذف شد" : "سایز حذف شد");
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(data.message || "خطا در حذف");
    }
  };

  const colorColumns: Column<ColorRow>[] = [
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

  const sizeColumns: Column<SizeRow>[] = [
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

  const openCreate = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">ویژگی محصولات</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          افزودن {tab === "colors" ? "رنگ" : "سایز"}
        </button>
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        رنگها و سایزهای قابل انتخاب برای محصولات را در این بخش مدیریت کنید. این موارد هنگام
        ساخت یا ویرایش محصول در فرم محصول و در هنگام خرید، در لیستهای انتخاب نمایش داده میشوند.
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 w-fit">
        <button
          onClick={() => setTab("colors")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "colors"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          )}
        >
          <Palette className="h-4 w-4" />
          رنگها
        </button>
        <button
          onClick={() => setTab("sizes")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "sizes"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          )}
        >
          <Ruler className="h-4 w-4" />
          سایزها
        </button>
      </div>

      {tab === "colors" ? (
        <DataTable
          columns={colorColumns}
          fetchData={fetchColors}
          searchPlaceholder="جستجوی رنگ..."
          refreshKey={refreshKey}
        />
      ) : (
        <DataTable
          columns={sizeColumns}
          fetchData={fetchSizes}
          searchPlaceholder="جستجوی سایز..."
          refreshKey={refreshKey}
        />
      )}

      {showForm && (
        <AttributeFormDialog
          mode="create"
          type={tab === "colors" ? "color" : "size"}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            handleSaved();
          }}
        />
      )}
      {editItem && (
        <AttributeFormDialog
          mode="edit"
          type={tab === "colors" ? "color" : "size"}
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            handleSaved();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          title={tab === "colors" ? "حذف رنگ" : "حذف سایز"}
          message={`آیا از حذف "${deleteTarget.name}" اطمینان دارید؟`}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDelete}
        />
      )}
    </div>
  );
}
