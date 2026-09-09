import { Sparkles, Award, Gem, Truck } from "lucide-react";
import { Section } from "@/components/sections/section";
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
    description: "ضمین کیفیت و اصالت تمام کالا‌ها",
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

/** Minimal feature strip with elegant icons */
export function Features() {
  return (
    <Section className="py-8 lg:py-10">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4" role="list" aria-label="ویژگی‌های فروشگاه">
        {features.map((feature, index) => (
          <li key={index} className="group flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-surface border border-border/50 hover:border-gold-light/50 hover:bg-gold-light/5 transition-all duration-300">
            <div className="mb-4 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold-light/10 text-gold-dark group-hover:bg-gold-light/20 group-hover:scale-105 transition-all duration-300">
              <feature.icon className="size-7" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-text group-hover:text-primary transition-colors">
              {feature.title}
            </p>
            <p className="mt-1.5 text-sm leading-5 text-text-secondary">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}