import type { Metadata } from "next";
import { AboutClient } from "./about-client";

export const metadata: Metadata = {
  title: "درباره زیوو | داستان برند",
  description:
    "زیوو فروشگاه تخصصی لباس زیر زنانه با برترین برندهای ایرانی و بین‌المللی. داستان ما را بخوانید.",
};

export default function AboutPage() {
  return <AboutClient />;
}
