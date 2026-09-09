import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeader } from "@/components/sections/section-header";
import { getAllCategories } from "@/lib/storefront";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * Editorial category cards (PRD §13): one featured tall card plus the
 * remaining categories. Hover reveals the CTA and a very slight zoom.
 */
export async function CategoryCards() {
  const allCategories = await getAllCategories();
  const categories = allCategories.filter((c) => c.parentId === null);
  if (categories.length === 0) return null;
  const featured = categories[0]!;
  const rest = categories.slice(1);

  return (
    <Section className="bg-surface-secondary/40">
      <SectionHeader
        eyebrow="دسته‌بندی‌ها"
        title="خرید بر اساس دسته‌بندی"
        subtitle="از سوتین تا لباس شب؛ همه‌چیز برای یک استایل کامل"
        actionLabel="مشاهده همه محصولات"
        actionHref={"/products" as Route}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:grid-rows-2">
        <CategoryLink
          category={featured}
          allCategories={allCategories}
          featured
          className="col-span-2"
        />
        {rest.map((category) => (
          <CategoryLink
            key={category.id}
            category={category}
            allCategories={allCategories}
          />
        ))}
      </div>
    </Section>
  );
}

function CategoryLink({
  category,
  allCategories,
  featured = false,
  className,
}: {
  category: Category;
  allCategories: Category[];
  featured?: boolean;
  className?: string;
}) {
  const subcount = allCategories.filter((c) => c.parentId === category.id).length;
  return (
    <Link
      href={`/products?category=${category.slug}` as Route}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        featured
          ? "aspect-[16/10] md:row-span-2 md:aspect-auto md:min-h-full"
          : "aspect-[4/5]",
        className,
      )}
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-text/70 via-text/15 to-transparent transition-colors duration-300 group-hover:from-text/80" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div>
          <h3 className="text-base font-extrabold text-white sm:text-lg">
            {category.name}
          </h3>
          {subcount > 0 ? (
            <p className="mt-1 text-xs text-white/75">
              {formatNumber(subcount)} دسته
            </p>
          ) : null}
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 sm:size-9">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
