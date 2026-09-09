"use client";

import { useState, useEffect } from "react";
import { FolderTree, Plus, List, LayoutGrid, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { CategoryTree, CategoryItem } from "@/components/admin/category-tree";
import { CategoryFormDialog } from "@/components/admin/forms/category-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Package,
  Loader2,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch {
      toast.error("خطا در بارگذاری دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("دسته‌بندی حذف شد");
        setDeleteTarget(null);
        fetchCategories();
      } else {
        toast.error(data.message || "خطا در حذف");
      }
    } catch {
      toast.error("خطای ارتباط با سرور");
    }
  };

  const parentCategories = categories.filter((c) => c.childCount > 0 || !c.parentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <FolderTree className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text)]">
            مدیریت دسته‌بندی‌ها
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "tree"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              درختی
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
              }`}
            >
              <List className="h-4 w-4" />
              جدولی
            </button>
          </div>

          <button
            onClick={() => {
              setEditCategory(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            <Plus className="h-4 w-4" />
            افزودن دسته‌بندی
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : viewMode === "tree" ? (
        <CategoryTree
          categories={categories}
          onEdit={(cat) => setEditCategory(cat)}
          onDelete={(cat) => setDeleteTarget(cat)}
        />
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  نام
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Slug
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  والد
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  محصولات
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <span className="font-medium text-[var(--text)]">
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {cat.parentName || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span className="text-sm">{cat.productCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--destructive)]">
                        <XCircle className="h-3.5 w-3.5" />
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditCategory(cat)}
                        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--primary)]"
                        title="ویرایش"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--destructive-light)] hover:text-[var(--destructive)]"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <CategoryFormDialog
          mode="create"
          parentCategories={parentCategories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchCategories();
          }}
        />
      )}

      {editCategory && (
        <CategoryFormDialog
          mode="edit"
          category={editCategory}
          parentCategories={parentCategories}
          onClose={() => setEditCategory(null)}
          onSaved={() => {
            setEditCategory(null);
            fetchCategories();
          }}
        />
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          title="حذف دسته‌بندی"
          message={`آیا از حذف "${deleteTarget.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDelete}
        />
      )}
    </div>
  );
}
