import Link from "next/link";
import { Fragment } from "react";
import type { Route } from "next";
import {
  Breadcrumb as UIBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type CrumbItem = {
  label: string;
  href?: Route | string;
};

type BreadcrumbProps = {
  items: CrumbItem[];
  className?: string;
};

/**
 * Reusable site breadcrumb — always starts with «خانه».
 * The last item without an href is rendered as the current page.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <UIBreadcrumb className={cn("text-sm", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">خانه</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item) => (
          <Fragment key={`${item.label}-${item.href ?? "current"}`}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href as Route}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </UIBreadcrumb>
  );
}
