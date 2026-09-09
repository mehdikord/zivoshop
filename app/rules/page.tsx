import type { Metadata } from "next";
import { RulesClient } from "./rules-client";

export const metadata: Metadata = {
  title: "قوانین و مقررات | زیوو",
  description: "شرایط و قوانین خرید، ارسال، مرجوعی و حریم خصوصی فروشگاه زیوو.",
};

export default function RulesPage() {
  return <RulesClient />;
}
