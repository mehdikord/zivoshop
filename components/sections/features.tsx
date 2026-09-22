import { Sparkles, Award, Gem, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "جدیدترین‌ها",
    description: "محصولات تازه‌وارد و ترین مدل‌ها",
    icon: Sparkles,
  },
  {
    title: "کیفیت بالا",
    description: "تضمین کیفیت و اصالت تمام کالا‌ها",
    icon: Award,
  },
  {
    title: "برندهای اصیل",
    description: "مجموعه‌ای از برندهای معتبر و معروف",
    icon: Gem,
  },
  {
    title: "ارسال سریع",
    description: "تحویل در کمترین زمان ممکن",
    icon: Truck,
  },
];

/**
 * Compact trust strip under the hero — light footprint on mobile,
 * refined inline row on desktop (PRD §12).
 */
export function Features() {
  return (
    <section
      className="border-y border-border/40 bg-surface/70"
      aria-label="ویژگی‌های فروشگاه"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ul className="grid grid-cols-4" role="list">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="flex flex-col items-center justify-center gap-1.5 border-border/45 px-1.5 py-3.5 text-center not-last:border-e sm:gap-2 sm:px-3 sm:py-4 md:flex-row md:gap-3 md:py-3.5 md:text-start"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-light/15 text-gold-dark sm:size-9">
                <feature.icon className="size-3.5 sm:size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-tight text-text sm:text-sm">
                  {feature.title}
                </p>
                <p className="mt-0.5 hidden text-xs leading-5 text-text-secondary lg:block">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
