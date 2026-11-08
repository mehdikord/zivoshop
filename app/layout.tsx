import type { Metadata } from "next";
import { Vazirmatn, Cormorant } from "next/font/google";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/navigation/scroll-to-top";
import { RootShell } from "@/components/layout/root-shell";
import { BrandingProvider } from "@/components/layout/branding-provider";
import { getSiteBranding } from "@/lib/site-settings";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
});

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zivo.shop"),
  title: {
    default: "زیوو | فروشگاه اینترنتی لباس زیر و پوشاک بانوان",
    template: "%s | زیوو Zivo",
  },
  description:
    "زیوو، فروشگاه آنلاین لباس زیر زنانه؛ مجموعه‌ای لوکس و مدرن از سوتین، شورت، ست لباس زیر، لباس خواب، لباس شب، بادی و گن با بهترین برندها.",
  applicationName: "زیوو Zivo",
  keywords: [
    "لباس زیر زنانه",
    "فروشگاه لباس زیر",
    "سوتین",
    "شورت زنانه",
    "ست لباس زیر",
    "لباس خواب",
    "لباس شب",
    "بادی",
    "گن",
    "Zivo",
  ],
  authors: [{ name: "Zivo" }],
  category: "ecommerce",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://zivo.shop",
    siteName: "زیوو Zivo",
    title: "زیوو | فروشگاه اینترنتی لباس زیر و پوشاک بانوان",
    description:
      "فروشگاه آنلاین لباس زیر زنانه؛ مجموعه‌ای لوکس و مدرن از سوتین، شورت، ست لباس زیر، لباس خواب، لباس شب، بادی و گن.",
  },
  twitter: {
    card: "summary_large_image",
    title: "زیوو | فروشگاه اینترنتی لباس زیر و پوشاک بانوان",
    description:
      "فروشگاه آنلاین لباس زیر زنانه؛ مجموعه‌ای لوکس و مدرن از سوتین، شورت، ست لباس زیر، لباس خواب و بادی.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getSiteBranding();

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DirectionProvider dir="rtl">
          <BrandingProvider value={branding}>
            <TooltipProvider delayDuration={200}>
              <RootShell>{children}</RootShell>
            </TooltipProvider>
          </BrandingProvider>
        </DirectionProvider>
        <Toaster richColors position="top-center" />
        <ScrollToTop />
      </body>
    </html>
  );
}
