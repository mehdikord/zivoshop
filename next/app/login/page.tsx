import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "ورود | زیوو",
  description: "ورود به حساب کاربری زیوو",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="ورود به حساب"
      subtitle="خوش آمدید! برای ادامه وارد شوید"
      footerText="حساب کاربری ندارید؟"
      footerLink={{ href: "/register", label: "ثبت‌نام کنید" }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
