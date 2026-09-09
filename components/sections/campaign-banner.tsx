import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Section } from "@/components/sections/section";
import { SectionHeader } from "@/components/sections/section-header";
import { getAllBanners } from "@/lib/storefront";
import { Button } from "@/components/ui/button";

/** Full-width campaign banners (PRD §10, item 10). */
export async function CampaignBanner() {
  const allBanners = await getAllBanners();
  const campaigns = allBanners.filter((b) => b.position === "campaign");

  return (
    <Section>
      <SectionHeader
        eyebrow="کالکشن‌های منتخب"
        title="کمپین‌های ویژه"
        align="center"
      />
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={(campaign.href ?? "/") as Route}
            className="group relative block aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-auto lg:h-[440px]"
          >
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text/75 via-text/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              {campaign.eyebrow && (
                <p className="text-xs font-bold tracking-[0.2em] text-gold-light">
                  {campaign.eyebrow}
                </p>
              )}
              <h3 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl">
                {campaign.title}
              </h3>
              {campaign.subtitle && (
                <p className="mt-3 max-w-md text-sm leading-7 text-white/85">
                  {campaign.subtitle}
                </p>
              )}
              {campaign.ctaLabel && (
                <div className="mt-6">
                  <Button variant="gold" asChild>
                    <span className="inline-flex items-center gap-2">
                      {campaign.ctaLabel}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
