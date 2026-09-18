import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductSlugs } from "@/lib/storefront";
import { ProductDetailPage } from "@/components/product/product-detail-page";

type Params = Promise<{ slug: string }>;

/** Keep PDP fresh after admin image/content updates (ISR). */
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "محصول یافت نشد" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | زیوو`,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailPage product={product} />;
}
