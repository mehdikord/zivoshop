"use client";

import { useState, useCallback } from "react";
import { Building2, CheckCircle2, XCircle, Pencil, Trash2, Package, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { BrandFormDialog } from "@/components/admin/forms/brand-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  [key: string]: unknown;
}

export default function BrandsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editBrand, setEditBrand] = useState<BrandRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandRow | null>(null);

  const fetchBrands = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`/api/admin/brands?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/brands/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("برند حذف شد");
        setDeleteTarget(null);
      } else {
        toast.error(data.message || "خطا در حذف");
      }
    } catch {
      toast.error("خطای ارتباط با سرور");
    }
  };

  const columns: Column<BrandRow>[] = [
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
            {row.logo ? (
              <img
                src={row.logo}
                alt={row.name}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
            )}
          </div>
          <span className="font-medium text-[var(--text)]">{row.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]" dir="ltr">
          {row.slug}
        </span>
      ),
    },
    {
      key: "productCount",
      header: "تعداد محصولات",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span className="text-sm">{row.productCount}</span>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "وضعیت",
      sortable: true,
      render: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            فعال
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--destructive)]">
            <XCircle className="h-3.5 w-3.5" />
            غیرفعال
          </span>
        ),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditBrand(row)}
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
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-[var(--primary)]" />
        <h1 className="text-2xl font-bold text-[var(--text)]">مدیریت برندها</h1>
      </div>

      <DataTable
        columns={columns}
        fetchData={fetchBrands}
        searchPlaceholder="جستجو بر اساس نام یا slug..."
      />

      {showForm && (
        <BrandFormDialog
          mode="create"
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}

      {editBrand && (
        <BrandFormDialog
          mode="edit"
          brand={editBrand}
          onClose={() => setEditBrand(null)}
          onSaved={() => setEditBrand(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          title="حذف برند"
          message={`آیا از حذف "${deleteTarget.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDelete}
        />
      )}
    </div>
  );
}