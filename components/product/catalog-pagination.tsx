"use client";

import { Pagination } from "@/components/ui/pagination";

export function CatalogPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
  );
}