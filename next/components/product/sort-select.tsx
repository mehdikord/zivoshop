"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, type SortOption } from "@/stores/filter-store";
import { cn } from "@/lib/utils";

/** Product sort dropdown (PRD §15). */
export function SortSelect({
  value,
  onChange,
  className,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className={cn("w-fit gap-2", className)} aria-label="مرتب‌سازی محصولات">
        <ArrowUpDown className="size-4 text-text-muted" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
