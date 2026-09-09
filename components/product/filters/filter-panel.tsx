"use client";

import { useFilterContext } from "@/components/product/filters/filter-context";
import { FilterBrands } from "@/components/product/filters/filter-brands";
import { FilterCategories } from "@/components/product/filters/filter-categories";
import { FilterColors } from "@/components/product/filters/filter-colors";
import { FilterOnSale } from "@/components/product/filters/filter-on-sale";
import { FilterPrice } from "@/components/product/filters/filter-price";
import { FilterRating } from "@/components/product/filters/filter-rating";
import { FilterSection } from "@/components/product/filters/filter-section";
import { FilterSizes } from "@/components/product/filters/filter-sizes";

/** The full set of filters, shared by the desktop sidebar and mobile sheet. */
export function FilterPanel() {
  const { query } = useFilterContext();

  return (
    <div>
      <FilterSection title="دسته‌بندی">
        <FilterCategories />
      </FilterSection>
      <FilterSection title="برند">
        <FilterBrands />
      </FilterSection>
      <FilterSection title="سایز">
        <FilterSizes />
      </FilterSection>
      <FilterSection title="رنگ">
        <FilterColors />
      </FilterSection>
      <FilterSection title="محدوده قیمت">
        <FilterPrice key={`price-${query.minPrice}-${query.maxPrice}`} />
      </FilterSection>
      <FilterSection title="تخفیف">
        <FilterOnSale />
      </FilterSection>
      <FilterSection title="امتیاز" defaultOpen={false}>
        <FilterRating />
      </FilterSection>
    </div>
  );
}
