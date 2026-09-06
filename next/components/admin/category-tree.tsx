"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Package,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  childCount: number;
  children?: CategoryItem[];
}

interface CategoryTreeProps {
  categories: CategoryItem[];
  onEdit: (cat: CategoryItem) => void;
  onDelete: (cat: CategoryItem) => void;
}

function TreeNode({
  category,
  level,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: CategoryItem & { children?: CategoryItem[] };
  level: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (cat: CategoryItem) => void;
  onDelete: (cat: CategoryItem) => void;
}) {
  const isExpanded = expanded.has(category.id);
  const hasChildren = (category.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        className="group flex items-center gap-2 border-b border-[var(--border)] px-4 py-3 hover:bg-[var(--background)]"
        style={{ paddingRight: `${level * 24 + 16}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => onToggle(category.id)}
          className={`h-5 w-5 shrink-0 ${
            hasChildren ? "visible" : "invisible"
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
          )}
        </button>

        {/* Name & Slug */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--text)]">
                {category.name}
              </span>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {category.slug}
              </span>
              {category.childCount > 0 && (
                <span className="rounded-full bg-[var(--surface-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                  {category.childCount} زیرمجموعه
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product count */}
        <div className="hidden items-center gap-1 sm:flex">
          <Package className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-secondary)]">
            {category.productCount} محصول
          </span>
        </div>

        {/* Status */}
        <div className="hidden sm:block">
          {category.isActive ? (
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--primary)]"
            title="ویرایش"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--destructive-light)] hover:text-[var(--destructive)]"
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded &&
        category.children?.map((child) => (
          <TreeNode
            key={child.id}
            category={child}
            level={level + 1}
            expanded={expanded}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (cats: CategoryItem[]) => {
      cats.forEach((c) => {
        if ((c.children?.length ?? 0) > 0) {
          allIds.add(c.id);
        }
        if (c.children) collect(c.children);
      });
    };
    collect(categories);
    setExpanded(allIds);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  // Build tree from flat list
  const buildTree = (items: CategoryItem[]): (CategoryItem & { children: CategoryItem[] })[] => {
    const map = new Map<string, CategoryItem & { children: CategoryItem[] }>();
    const roots: (CategoryItem & { children: CategoryItem[] })[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = buildTree(categories);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h3 className="font-semibold text-[var(--text)]">
          ساختار درختی دسته‌بندی‌ها
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="rounded-md px-3 py-1 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          >
            باز کردن همه
          </button>
          <button
            onClick={collapseAll}
            className="rounded-md px-3 py-1 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
          >
            بستن همه
          </button>
        </div>
      </div>

      {/* Tree */}
      {tree.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)]">
          دسته‌بندی‌ای وجود ندارد
        </div>
      ) : (
        <div>
          {tree.map((cat) => (
            <TreeNode
              key={cat.id}
              category={cat}
              level={0}
              expanded={expanded}
              onToggle={toggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
