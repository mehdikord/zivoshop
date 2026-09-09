import type { Metadata } from "next";
import { ContactClient } from "./contact-client";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "تماس با ما | زیوو",
  description:
    "ارتباط با فروشگاه زیوو — تلفن، آدرس، شبکه‌های اجتماعی و فرم تماس.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return <ContactClient settings={settings} />;
}