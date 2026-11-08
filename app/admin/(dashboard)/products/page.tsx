"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Package, Plus, Pencil, Trash2, Eye, X,
  CheckCircle2, XCircle, AlertTriangle, Star,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, Column } from "@/components/admin/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  status: string;
  isNew: boolean;
  isBestseller: boolean;
  sortOrder: number;
  createdAt: string | null;
  categoryName: string;
  categoryId: string;
  brandName: string;
  brandId: string;
  thumbnail: string | null;
  colorCount: number;
  sizeCount: number;
  variantCount: number;
  [key: string]: unknown;
}

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "فعال", color: "var(--success)" },
  draft: { label: "پیش‌نویس", color: "var(--warning)" },
  archived: { label: "بایگانی", color: "var(--text-muted)" },
};

function formatPrice(price: number): string {
  return price.toLocaleString("fa-IR") + " تومان";
}

export default function ProductsPage() {
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [detailProduct, setDetailProduct] = useState<Record<string, unknown> | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [catFilter, setCatFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
    ]).then(([catData, brandData]) => {
      if (catData.success) setCategories(catData.data);
      if (brandData.success) setBrands(brandData.data);
    });
  }, []);

  const extraParams: Record<string, string> = {};
  if (catFilter) extraParams.categoryId = catFilter;
  if (brandFilter) extraParams.brandId = brandFilter;
  if (statusFilter) extraParams.status = statusFilter;

  const fetchData = useCallback(async (params: Record<string, string>) => {
    const searchParams = new URLSearchParams({ ...params, ...extraParams });
    const res = await fetch(`/api/admin/products?${searchParams.toString()}`);
    const json = await res.json();
    return { data: json.data, meta: json.meta };
  }, [catFilter, brandFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("محصول حذف شد");
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(data.message || "خطا در حذف");
    }
  };

  const handleViewDetail = async (product: ProductRow) => {
    const res = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    if (data.success) setDetailProduct(data.data);
  };

  const columns: Column<ProductRow>[] = [
    {
      key: "thumbnail",
      header: "تصویر",
      render: (row) => (
        <div className="h-12 w-12 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
          {row.thumbnail ? (
            <img src={row.thumbnail} alt={row.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "نام",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-[var(--text)] line-clamp-1">{row.name}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {row.isNew && <span className="rounded bg-[var(--info)] px-1 py-0.5 text-[10px] font-medium text-white">جدید</span>}
            {row.isBestseller && <span className="rounded bg-[var(--warning)] px-1 py-0.5 text-[10px] font-medium text-white">پرفروش</span>}
          </div>
        </div>
      ),
    },
    {
      key: "categoryName",
      header: "دسته‌بندی",
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.categoryName}</span>,
    },
    {
      key: "brandName",
      header: "برند",
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.brandName}</span>,
    },
    {
      key: "price",
      header: "قیمت",
      sortable: true,
      render: (row) => (
        <div className="text-left" dir="ltr">
          {row.discountPrice ? (
            <div>
              <span className="text-sm font-bold text-[var(--success)]">{formatPrice(row.discountPrice)}</span>
              <span className="mr-1 text-xs text-[var(--text-muted)] line-through">{formatPrice(row.price)}</span>
            </div>
          ) : (
            <span className="text-sm font-bold text-[var(--text)]">{formatPrice(row.price)}</span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "موجودی",
      sortable: true,
      render: (row) => (
        <span className={`text-sm font-medium ${row.stock <= 5 ? "text-[var(--destructive)]" : "text-[var(--text)]"}`}>
          {row.stock}
          {row.stock <= 5 && <AlertTriangle className="inline h-3 w-3 mr-1 text-[var(--destructive)]" />}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      render: (row) => {
        const config = statusConfig[row.status] ?? { label: row.status, color: "var(--text-muted)" };
        return (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: config.color }}>
            {row.status === "active" ? <CheckCircle2 className="h-3.5 w-3.5" /> : row.status === "draft" ? <Eye className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {config.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleViewDetail(row)} className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--info)]" title="جزئیات">
            <Eye className="h-4 w-4" />
          </button>
          <Link href={`/admin/products/${row.id}/edit`} className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--primary)]" title="ویرایش" aria-label={`ویرایش ${row.name}`}>
            <Pencil className="h-4 w-4" />
          </Link>
          <button onClick={() => setDeleteTarget(row)} className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--destructive-light)] hover:text-[var(--destructive)]" title="حذف">
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
          <Package className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">مدیریت محصولات</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          افزودن محصول
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none">
          <option value="">همه دسته‌بندی‌ها</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none">
          <option value="">همه برندها</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:outline-none">
          <option value="">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="draft">پیش‌نویس</option>
          <option value="archived">بایگانی</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        fetchData={fetchData}
        searchPlaceholder="جستجوی محصول..."
        extraParams={extraParams}
        refreshKey={refreshKey}
      />

      {/* Detail Dialog */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailProduct(null)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <h2 className="text-lg font-bold text-[var(--text)]">{detailProduct.name as string}</h2>
              <div className="flex items-center gap-1">
              <Link href={`/admin/products/${detailProduct.id as string}/edit`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--surface-secondary)]">
                <Pencil className="h-4 w-4" />
                ویرایش
              </Link>
              <button onClick={() => setDetailProduct(null)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)]"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-[var(--text-muted)]">Slug:</span> <span className="font-mono" dir="ltr">{detailProduct.slug as string}</span></div>
                <div><span className="text-[var(--text-muted)]">دسته:</span> {detailProduct.categoryName as string}</div>
                <div><span className="text-[var(--text-muted)]">برند:</span> {detailProduct.brandName as string}</div>
                <div><span className="text-[var(--text-muted)]">قیمت:</span> <span className="font-bold">{formatPrice(Number(detailProduct.price))}</span></div>
                {detailProduct.discountPrice != null && <div><span className="text-[var(--text-muted)]">تخفیف:</span> <span className="font-bold text-[var(--success)]">{formatPrice(Number(detailProduct.discountPrice))}</span></div>}
                <div><span className="text-[var(--text-muted)]">موجودی:</span> {detailProduct.stock as number}</div>
                <div><span className="text-[var(--text-muted)]">امتیاز:</span> <Star className="inline h-3.5 w-3.5 text-[var(--warning)]" /> {detailProduct.rating as number}</div>
                <div><span className="text-[var(--text-muted)]">وضعیت:</span> {(statusConfig[detailProduct.status as string]?.label) ?? detailProduct.status as string}</div>
              </div>
              {(detailProduct.colors as { name: string; hex: string }[])?.length > 0 && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">رنگ‌ها:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(detailProduct.colors as { name: string; hex: string }[]).map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(detailProduct.sizes as { name: string }[])?.length > 0 && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">سایزها:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(detailProduct.sizes as { name: string }[]).map((s, i) => (
                      <span key={i} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {(detailProduct.images as { path: string; alt: string }[])?.length > 0 && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">تصاویر:</span>
                  <div className="mt-1 grid grid-cols-5 gap-2">
                    {(detailProduct.images as { path: string; alt: string }[]).map((img, i) => (
                      <img key={i} src={img.path} alt={img.alt ?? ""} className="h-16 w-16 rounded-lg object-cover border border-[var(--border)]" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmDialog title="حذف محصول" message={`آیا از حذف "${deleteTarget.name}" اطمینان دارید؟`} onClose={() => setDeleteTarget(null)} onConfirmed={handleDelete} />
      )}
    </div>
  );
}
