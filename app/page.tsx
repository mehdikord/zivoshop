import type { Route } from "next";
import {
  HeroSlider,
  Features,
  CategoryCards,
  ProductSection,
  CampaignBanner,
  Brands,
  SpecialOffer,
} from "@/components/sections";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ "simulate-error"?: string }>;
}) {
  const params = await searchParams;
  const simulateError = params["simulate-error"] === "1";

  return (
    <main className="min-h-screen bg-background">
      {/* 1-3: Announcement bar, Header, Navigation — from SiteShell (Phase 01) */}

      {/* 4. Hero Slider (PRD §11) */}
      <HeroSlider />

      {/* 5. Features (PRD §12) */}
      <Features />

      {/* 6. Category Cards (PRD §13) */}
      <CategoryCards />

      {/* 7. Newest Products */}
      <ProductSection
        kind="newest"
        eyebrow="جدیدترین‌ها"
        title="جدیدترین محصولات"
        subtitle="آخرین کالکشن‌ها و محصولات تازه‌وارد را همین‌جا ببینید"
        actionLabel="مشاهده همه جدیدترین‌ها"
        actionHref={"/products?sort=newest" as Route}
        simulateError={simulateError}
        id="newest"
      />

      {/* 8. Bestseller Products */}
      <ProductSection
        kind="bestseller"
        eyebrow="پرفروش‌ترین‌ها"
        title="پرفروش‌ترین محصولات"
        subtitle="محبوب‌ترین انتخاب‌های مشتریان زیوو"
        actionLabel="مشاهده همه پرفروش‌ها"
        actionHref={"/products?sort=bestseller" as Route}
        id="bestseller"
      />

      {/* 9. Discounted Products */}
      <ProductSection
        kind="discounted"
        eyebrow="فروش ویژه"
        title="محصولات تخفیف‌دار"
        subtitle="فرصت خرید هوشمندانه از منتخب تخفیف‌های این فصل"
        actionLabel="مشاهده همه تخفیف‌ها"
        actionHref={"/products?sort=discount" as Route}
        id="discounted"
      />

      {/* 10. Campaign / Collection Banner */}
      <CampaignBanner />

      {/* 11. Brands */}
      <Brands />

      {/* 12. Special Offer */}
      <SpecialOffer />

      {/* 13. Newsletter — handled by Footer (Phase 01) */}

      {/* 14. Footer — from SiteShell (Phase 01) */}
    </main>
  );
}
