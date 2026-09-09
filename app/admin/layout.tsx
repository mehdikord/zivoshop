import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت | زیوو",
    template: "%s | پنل مدیریت زیوو",
  },
  description: "پنل مدیریت فروشگاه اینترنتی زیوو",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
