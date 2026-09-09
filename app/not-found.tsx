import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-gold-dark">
        ۴۰۴
      </p>
      <h1 className="mt-4 text-2xl font-bold text-primary">
        صفحه‌ای که دنبال آن بودید پیدا نشد
      </h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-text-secondary">
        شاید آدرس واردشده اشتباه است یا این بخش هنوز در حال تکمیل شدن است. از
        منوی بالا یکی از دسته‌بندی‌های دیگر را امتحان کنید.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">بازگشت به خانه</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={"/products" as Route}>مشاهده همه محصولات</Link>
        </Button>
      </div>
    </div>
  );
}
