import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeader } from "@/components/sections/section-header";
import { getAllCategories } from "@/lib/storefront";
import { formatNumber } from "@/lib/format";

/**
 * Compact category discovery (PRD §13):
 * — mobile/tablet: horizontal snap rail (short height, swipeable)
 * — desktop: equal 4-column tiles (no oversized masonry)
 */
export async function CategoryCards() {
  const allCategories = await getAllCategories();
  const categories = allCategories.filter((c) => c.parentId === null);
  if (categories.length === 0) return null;

  return (
    <Section className="bg-surface-secondary/35 py-8 lg:py-12">
      <SectionHeader
        eyebrow="دسته‌بندی‌ها"
        title="خرید بر اساس دسته‌بندی"
        subtitle="از سوتین تا لباس شب؛ همه‌چیز برای یک استایل کامل"
        actionLabel="مشاهده همه محصولات"
        actionHref={"/products" as Route}
        className="mb-5 sm:mb-6"
      />

      <ul
        className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 scrollbar-none lg:mx-0 lg:grid lg:snap-none lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
        role="list"
        aria-label="دسته‌بندی محصولات"
      >
        {categories.map((category) => {
          const subcount = allCategories.filter(
            (c) => c.parentId === category.id,
          ).length;

          return (
            <li
              key={category.id}
              className="w-[34%] max-w-[132px] shrink-0 snap-start sm:w-[28%] sm:max-w-[148px] lg:w-auto lg:max-w-none lg:shrink"
            >
              <Link
                href={`/products?category=${category.slug}` as Route}
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border/40 transition-[box-shadow,ring-color] duration-300 hover:shadow-soft-lg hover:ring-gold-dark/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark sm:aspect-[4/5] lg:aspect-[3/4]"
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 34vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/15 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-3.5">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white sm:text-[15px]">
                      {category.name}
                    </h3>
                    {subcount > 0 ? (
                      <p className="mt-0.5 text-[11px] text-white/75">
                        {formatNumber(subcount)} زیردسته
                      </p>
                    ) : null}
                  </div>
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0"
                    aria-hidden
                  >
                    <ArrowLeft className="size-3.5" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
