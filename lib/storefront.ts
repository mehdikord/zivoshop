import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";
import type { Brand, Category, Product, ProductColorWithImage, ProductSizeWithStock, Review, RichBlock } from "@/types";

const ID_ONLY_RE = /^\d+$/;

async function findCategoryBySlugOrId(
  value: string
): Promise<{ id: bigint; name: string } | null> {
  const byId = ID_ONLY_RE.test(value) ? BigInt(value) : null;
  return prisma.category.findFirst({
    where: byId !== null ? { OR: [{ id: byId }, { slug: value }] } : { slug: value },
    select: { id: true, name: true },
  });
}

async function findBrandBySlugOrId(
  value: string
): Promise<{ id: bigint } | null> {
  const byId = ID_ONLY_RE.test(value) ? BigInt(value) : null;
  return prisma.brand.findFirst({
    where: byId !== null ? { OR: [{ id: byId }, { slug: value }] } : { slug: value },
    select: { id: true },
  });
}

function mapReview(r: { id: bigint; rating: number; title: string | null; content: string; verifiedPurchase: boolean; createdAt: Date | null; user: { name: string | null } | null; images: { path: string }[] }): Review {
  return {
    id: r.id.toString(),
    productId: "",
    userName: r.user?.name ?? "کاربر",
    rating: r.rating,
    title: r.title ?? undefined,
    content: r.content,
    date: r.createdAt?.toISOString() ?? "",
    images: r.images.map((i) => i.path),
    verifiedPurchase: r.verifiedPurchase,
  };
}

/**
 * Table detail blocks store `{ headers: string[], rows: string[][] }` as JSON
 * (or a bare `rows` array). Anything malformed yields an empty table, which
 * the UI skips.
 */
function parseTableBlock(content: string | null): Extract<RichBlock, { type: "table" }> {
  const empty = { type: "table" as const, headers: [] as string[], rows: [] as string[][] };
  if (!content) return empty;
  try {
    const parsed: unknown = JSON.parse(content);
    const toRow = (r: unknown) => (Array.isArray(r) ? r.map((c) => String(c ?? "")) : []);
    if (Array.isArray(parsed)) {
      return { ...empty, rows: parsed.map(toRow).filter((r) => r.length > 0) };
    }
    if (parsed && typeof parsed === "object") {
      const obj = parsed as { headers?: unknown; rows?: unknown };
      return {
        type: "table",
        headers: Array.isArray(obj.headers) ? obj.headers.map((h) => String(h ?? "")) : [],
        rows: Array.isArray(obj.rows) ? obj.rows.map(toRow).filter((r) => r.length > 0) : [],
      };
    }
  } catch {
    // fall through
  }
  return empty;
}

export async function mapProduct(p: {
  id: bigint; name: string; slug: string; description: string; price: bigint;
  discountPrice: bigint | null; discountPercent: number | null; stock: number;
  rating: Prisma.Decimal; reviewCount: number; isNew: boolean; isBestseller: boolean;
  status: string; createdAt: Date | null; categoryId: bigint; brandId: bigint;
  category: { id: bigint; name: string; slug: string; image: string | null };
  brand: { id: bigint; name: string; slug: string; logo: string | null };
  images: { path: string; sortOrder: number }[];
  videos: { url: string }[];
  productColors: { color: { name: string; hex: string; id: bigint }; image: string | null }[];
  productSizes: { size: { id: bigint; name: string }; stock: number; isActive: boolean }[];
  reviews: { id: bigint; rating: number; title: string | null; content: string; verifiedPurchase: boolean; createdAt: Date | null; user: { name: string | null } | null; images: { path: string }[] }[];
  details: { type: string; content: string | null; src: string | null; alt: string | null; sortOrder: number }[];
}): Promise<Product> {
  const images = p.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.path);
  const videoPaths = p.videos.map((v) => v.url);
  const colors = p.productColors
    .map((pc) => ({ name: pc.color.name, hex: pc.color.hex, image: pc.image ?? undefined }));
  const sizes = p.productSizes.map((ps) => ps.size.name);
  const reviews = p.reviews.map(mapReview);

  // Detailed productColors and productSizes for specs tab
  const productColors: ProductColorWithImage[] = p.productColors.map((pc) => ({
    id: pc.color.id.toString(),
    name: pc.color.name,
    hex: pc.color.hex,
    image: pc.image ?? undefined,
  }));

  const productSizes: ProductSizeWithStock[] = p.productSizes.map((ps) => ({
    id: ps.size.id.toString(),
    name: ps.size.name,
    stock: ps.stock,
    isActive: ps.isActive,
    isAvailable: ps.isActive && ps.stock > 0,
  }));

  const priceNum = Number(p.price);
  const discountPriceNum = p.discountPrice ? Number(p.discountPrice) : null;
  const ratingNum = Number(p.rating);

  let details: RichBlock[] | undefined;
  if (p.details.length > 0) {
    details = p.details
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((d: { type: string; content: string | null; src: string | null; alt: string | null; sortOrder: number }) => {
        switch (d.type) {
          case "text":
            return { type: "text" as const, text: d.content ?? "" };
          case "heading":
            return { type: "heading" as const, text: d.content ?? "" };
          case "list":
            return { type: "list" as const, items: d.content ? JSON.parse(d.content) : [] };
          case "image":
            return { type: "image" as const, src: d.src ?? "", alt: d.alt ?? "" };
          case "table":
            return parseTableBlock(d.content);
          default:
            return { type: "text" as const, text: d.content ?? "" };
        }
      });
  }

  return {
    id: p.id.toString(),
    name: p.name,
    slug: p.slug,
    category: p.categoryId.toString(),
    brand: p.brandId.toString(),
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    brandName: p.brand.name,
    brandSlug: p.brand.slug,
    description: p.description,
    details: details && details.length > 0 ? details : undefined,
    images: images.length > 0 ? images : ["/images/placeholder.jpg"],
    videos: videoPaths.length > 0 ? videoPaths : undefined,
    sizes,
    colors,
    productColors,
    productSizes,
    price: priceNum,
    discountPrice: discountPriceNum,
    discountPercent: p.discountPercent,
    rating: ratingNum,
    reviewCount: p.reviewCount,
    reviews,
    stock: p.stock,
    status: p.status as Product["status"],
    createdAt: p.createdAt?.toISOString() ?? "",
    isNew: p.isNew,
    isBestseller: p.isBestseller,
  };
}

const productInclude = {
  category: { select: { id: true, name: true, slug: true, image: true } },
  brand: { select: { id: true, name: true, slug: true, logo: true } },
  images: { select: { path: true, sortOrder: true }, orderBy: { sortOrder: "asc" as const } },
  videos: { select: { url: true } },
  productColors: { select: { color: { select: { id: true, name: true, hex: true } }, image: true }, orderBy: { color: { name: "asc" as const } } },
  productSizes: { select: { size: { select: { id: true, name: true } }, stock: true, isActive: true }, orderBy: { size: { sortOrder: "asc" as const } } },
  reviews: {
    where: { isApproved: true },
    include: {
      user: { select: { name: true } },
      images: { select: { path: true } },
    },
    orderBy: { createdAt: "desc" as const },
    take: 20,
  },
  details: { select: { type: true, content: true, src: true, alt: true, sortOrder: true }, orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const p = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  return p ? mapProduct(p) : null;
}

export async function getNewestProducts(limit = 8): Promise<Product[]> {
  const items = await prisma.product.findMany({
    where: { status: "active", stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: productInclude,
  });
  return Promise.all(items.map(mapProduct));
}

export async function getBestsellerProducts(limit = 8): Promise<Product[]> {
  const items = await prisma.product.findMany({
    where: { status: "active", stock: { gt: 0 }, isBestseller: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: productInclude,
  });
  if (items.length >= limit) return Promise.all(items.map(mapProduct));
  const remaining = limit - items.length;
  const extra = await prisma.product.findMany({
    where: { status: "active", stock: { gt: 0 }, id: { notIn: items.map((i) => i.id) } },
    orderBy: { reviewCount: "desc" },
    take: remaining,
    include: productInclude,
  });
  return Promise.all([...items, ...extra].slice(0, limit).map(mapProduct));
}

export async function getDiscountedProducts(limit = 8): Promise<Product[]> {
  const items = await prisma.product.findMany({
    where: { status: "active", stock: { gt: 0 }, discountPrice: { not: null } },
    orderBy: { discountPercent: "desc" },
    take: limit,
    include: productInclude,
  });
  return Promise.all(items.map(mapProduct));
}

export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const items = await prisma.product.findMany({
    where: {
      status: "active",
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { brand: { name: { contains: q } } },
        { category: { name: { contains: q } } },
      ],
    },
    orderBy: { reviewCount: "desc" },
    take: limit,
    include: productInclude,
  });
  return Promise.all(items.map(mapProduct));
}

export async function getAllCategories(): Promise<Category[]> {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, image: true, description: true, parentId: true },
  });
  return cats.map((c) => ({
    id: c.id.toString(),
    name: c.name,
    slug: c.slug,
    image: c.image ?? "/images/placeholder.jpg",
    description: c.description ?? undefined,
    parentId: c.parentId?.toString() ?? null,
  }));
}

export async function getAllBrands(): Promise<Brand[]> {
  const b = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, logo: true, description: true },
  });
  return b.map((br) => ({
    id: br.id.toString(),
    name: br.name,
    slug: br.slug,
    logo: br.logo ?? "",
    description: br.description ?? undefined,
  }));
}

export async function getAllBanners() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return banners.map((b) => ({
    id: b.id.toString(),
    eyebrow: b.eyebrow,
    title: b.title,
    subtitle: b.subtitle,
    ctaLabel: b.ctaLabel,
    href: b.href,
    image: b.image,
    position: b.position,
    align: b.align,
    sortOrder: b.sortOrder,
    isActive: true,
  }));
}

export async function getAllFeatures() {
  const features = await prisma.feature.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return features.map((f) => ({
    id: f.id.toString(),
    title: f.title,
    description: f.description,
    icon: f.icon,
  }));
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sameCategory = await prisma.product.findMany({
    where: { status: "active", stock: { gt: 0 }, categoryId: BigInt(product.category), id: { not: BigInt(product.id) } },
    orderBy: { reviewCount: "desc" },
    take: limit + 2,
    include: productInclude,
  });
  if (sameCategory.length >= limit) return Promise.all(sameCategory.slice(0, limit).map(mapProduct));

  const sameBrand = await prisma.product.findMany({
    where: {
      status: "active", stock: { gt: 0 },
      brandId: BigInt(product.brand), id: { not: BigInt(product.id) },
      categoryId: { not: BigInt(product.category) },
    },
    orderBy: { reviewCount: "desc" },
    take: limit - sameCategory.length + 2,
    include: productInclude,
  });
  const all = [...sameCategory, ...sameBrand.filter((p) => !sameCategory.some((sc) => sc.id === p.id))];
  return Promise.all(all.slice(0, limit).map(mapProduct));
}

export async function getCatalogProducts(params: {
  category?: string; brands?: string[]; sizes?: string[]; colors?: string[];
  minPrice?: number; maxPrice?: number; onSale?: boolean; minRating?: number;
  keyword?: string; sort?: string; page?: number; pageSize?: number;
}): Promise<{ items: Product[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const { category, brands, sizes, colors, minPrice, maxPrice, onSale, minRating, keyword, sort, page = 1, pageSize = 12 } = params;

  const where: Prisma.ProductWhereInput = { status: "active", stock: { gt: 0 } };

  if (category) {
    const cat = await findCategoryBySlugOrId(category);
    if (cat) {
      const subCats = await prisma.category.findMany({ where: { parentId: cat.id } });
      const catIds = [cat.id, ...subCats.map((c) => c.id)];
      where.categoryId = { in: catIds };
    }
  }

  if (brands && brands.length > 0) {
    const brandIds: bigint[] = [];
    for (const b of brands) {
      const br = await findBrandBySlugOrId(b);
      if (br) brandIds.push(br.id);
    }
    if (brandIds.length > 0) where.brandId = { in: brandIds };
  }

  if (sizes && sizes.length > 0) {
    where.productSizes = { some: { size: { name: { in: sizes } } } };
  }

  if (colors && colors.length > 0) {
    where.productColors = { some: { color: { hex: { in: colors } } } };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = BigInt(minPrice);
    if (maxPrice) where.price.lte = BigInt(maxPrice);
  }

  if (onSale) {
    where.discountPrice = { not: null };
  }

  if (minRating) {
    where.rating = { gte: minRating };
  }

  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
      { brand: { name: { contains: keyword } } },
      { category: { name: { contains: keyword } } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "popular") orderBy = { reviewCount: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };
  else if (sort === "cheapest") orderBy = { price: "asc" };
  else if (sort === "expensive") orderBy = { price: "desc" };
  else if (sort === "top_rated") orderBy = { rating: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: await Promise.all(items.map(mapProduct)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductSlugs(): Promise<string[]> {
  const items = await prisma.product.findMany({
    where: { status: "active" },
    select: { slug: true },
  });
  return items.map((i) => i.slug);
}

export async function getCatalogFacets(categoryId?: string) {
  const baseWhere: Prisma.ProductWhereInput = { status: "active", stock: { gt: 0 } };

  if (categoryId) {
    const cat = await findCategoryBySlugOrId(categoryId);
    if (cat) {
      const subCats = await prisma.category.findMany({ where: { parentId: cat.id } });
      baseWhere.categoryId = { in: [cat.id, ...subCats.map((c) => c.id)] };
    }
  }

  const [categories, brands, colors, sizes, priceAgg] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, products: { some: baseWhere } },
      select: { id: true, name: true, slug: true, description: true, _count: { select: { products: { where: baseWhere } } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.brand.findMany({
      where: { isActive: true, products: { some: baseWhere } },
      select: { id: true, name: true, slug: true, logo: true, _count: { select: { products: { where: baseWhere } } } },
      orderBy: { name: "asc" },
    }),
    prisma.color.findMany({
      where: { productColors: { some: { product: baseWhere } } },
      select: { id: true, name: true, hex: true, _count: { select: { productColors: { where: { product: baseWhere } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.size.findMany({
      where: { productSizes: { some: { product: baseWhere } } },
      select: { id: true, name: true, _count: { select: { productSizes: { where: { product: baseWhere } } } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.aggregate({ where: baseWhere, _min: { price: true }, _max: { price: true } }),
  ]);

  return {
    categories: categories.map((c) => ({ id: c.id.toString(), name: c.name, slug: c.slug, description: c.description ?? "", count: c._count.products })),
    brands: brands.map((b) => ({ id: b.id.toString(), name: b.name, slug: b.slug, logo: b.logo ?? "", count: b._count.products })),
    colors: colors.map((c) => ({ id: c.id.toString(), name: c.name, hex: c.hex, count: c._count.productColors })),
    sizes: sizes.map((s) => ({ id: s.id.toString(), label: s.name, count: s._count.productSizes })),
    priceRange: { min: Number(priceAgg._min.price ?? 0), max: Number(priceAgg._max.price ?? 0) },
  };
}
