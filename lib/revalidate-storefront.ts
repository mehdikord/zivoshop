import { revalidatePath } from "next/cache";

/**
 * Invalidate storefront caches after product mutations in admin.
 * PDP is statically generated; without this, new images stay invisible until rebuild.
 */
export function revalidateProductStorefront(slug: string, previousSlug?: string) {
  revalidatePath(`/products/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/products/${previousSlug}`);
  }
  revalidatePath("/products");
  revalidatePath("/");
}
