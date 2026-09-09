import Link from "next/link";
import type { Route } from "next";
import { Section } from "@/components/sections/section";
import { getAllBrands } from "@/lib/storefront";

/**
 * Brands strip (PRD §50, «حداقل 5 برند»). The mock brands carry no
 * logo assets, so each is rendered as a refined wordmark that stays
 * coherent with the brand system.
 */
export async function Brands() {
  const brands = await getAllBrands();

  return (
    <Section className="bg-surface-secondary/40">
      <div className="flex flex-col items-center gap-8">
        <p className="text-xs font-bold tracking-[0.25em] text-gold-dark">
          برندهای معتبر
        </p>
        <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/products?brand=${brand.slug}` as Route}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="text-lg font-extrabold tracking-wide text-text-secondary transition-colors group-hover:text-primary">
                  {brand.name}
                </span>
                <span className="h-px w-8 bg-gold-dark/30 transition-all duration-300 group-hover:w-12 group-hover:bg-gold-dark" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
