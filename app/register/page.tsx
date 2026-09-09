import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "ثبت‌نام | زیوو",
  description: "ساخت حساب کاربری جدید در زیوو",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="ساخت حساب جدید"
      subtitle="به زیوو خوش آمدید"
      footerText="قبلاً ثبت‌نام کرده‌اید؟"
      footerLink={{ href: "/login", label: "ورود کنید" }}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
