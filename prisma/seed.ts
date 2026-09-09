import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mehdi123",
  database: "zivo_shop",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ---------------------------------------------------------------------------
  // 1. Admin
  // ---------------------------------------------------------------------------
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { mobile: "09120000000" },
    update: {},
    create: {
      name: "Admin",
      mobile: "09120000000",
      email: "admin@zivo.shop",
      password: adminPassword,
      isActive: true,
    },
  });
  console.log("  Admin seeded.");

  // ---------------------------------------------------------------------------
  // 2. Categories
  // ---------------------------------------------------------------------------
  const categoriesData = [
    {
      name: "Bra",
      slug: "bra",
      description: "Women's lingerie bras",
      image: "/images/editorial-c.jpg",
      children: [
        { name: "Fancy Bra", slug: "fancy-bra", sortOrder: 1, image: "/images/editorial-b.jpg" },
        { name: "Sports Bra", slug: "sports-bra", sortOrder: 2, image: "/images/editorial-i.jpg" },
        { name: "Classic Bra", slug: "classic-bra", sortOrder: 3, image: "/images/editorial-a.jpg" },
        { name: "Padded Bra", slug: "padded-bra", sortOrder: 4, image: "/images/editorial-white.jpg" },
      ],
    },
    {
      name: "Panties",
      slug: "panties",
      description: "Women's panties",
      image: "/images/editorial-d.jpg",
      children: [
        { name: "Fancy Panties", slug: "fancy-panties", sortOrder: 1, image: "/images/editorial-a.jpg" },
        { name: "Classic Panties", slug: "classic-panties", sortOrder: 2, image: "/images/editorial-c.jpg" },
        { name: "Thong", slug: "thong", sortOrder: 3, image: "/images/editorial-b.jpg" },
      ],
    },
    {
      name: "Underwear Set",
      slug: "underwear-set",
      description: "Matching lingerie sets",
      image: "/images/editorial-b.jpg",
      children: [],
    },
    {
      name: "Sleepwear",
      slug: "sleepwear",
      description: "Nightwear and sleepwear",
      image: "/images/editorial-coat2.jpg",
      children: [
        { name: "Nightgown", slug: "nightgown", sortOrder: 1, image: "/images/editorial-red.jpg" },
        { name: "Pajama Set", slug: "pajama-set", sortOrder: 2, image: "/images/editorial-e.jpg" },
        { name: "Robe", slug: "robe", sortOrder: 3, image: "/images/editorial-hat.jpg" },
      ],
    },
    {
      name: "Bodysuit & Shapewear",
      slug: "bodysuit-shapewear",
      description: "Body shapers and bodysuits",
      image: "/images/editorial-black.jpg",
      children: [
        { name: "Bodysuit", slug: "bodysuit", sortOrder: 1, image: "/images/editorial-black.jpg" },
        { name: "Shapewear", slug: "shapewear", sortOrder: 2, image: "/images/editorial-j.jpg" },
      ],
    },
    {
      name: "Night Dress",
      slug: "night-dress",
      description: "Sexy night dresses",
      image: "/images/editorial-red.jpg",
      children: [],
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Lingerie accessories",
      image: "/images/beauty-1.jpg",
      children: [
        { name: "Garter Belt", slug: "garter-belt", sortOrder: 1, image: "/images/beauty-2.jpg" },
        { name: "Stockings", slug: "stockings", sortOrder: 2, image: "/images/beauty-3.jpg" },
        { name: "Eye Mask", slug: "eye-mask", sortOrder: 3, image: "/images/beauty-2.jpg" },
      ],
    },
    {
      name: "Plus Size",
      slug: "plus-size",
      description: "Plus size lingerie",
      image: "/images/editorial-e.jpg",
      children: [
        { name: "Plus Size Bra", slug: "plus-size-bra", sortOrder: 1, image: "/images/editorial-e.jpg" },
        { name: "Plus Size Panties", slug: "plus-size-panties", sortOrder: 2, image: "/images/editorial-white.jpg" },
      ],
    },
  ];

  for (const cat of categoriesData) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!existing) {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image || null,
          sortOrder: categoriesData.indexOf(cat),
        },
      });

      for (const child of cat.children) {
        await prisma.category.create({
          data: {
            name: child.name,
            slug: child.slug,
            parentId: created.id,
            image: child.image || null,
            sortOrder: child.sortOrder,
          },
        });
      }
    }
  }
  console.log("  Categories seeded.");

  // ---------------------------------------------------------------------------
  // 3. Brands
  // ---------------------------------------------------------------------------
  const brandsData = [
    { name: "Zivo", slug: "zivo", description: "Premium lingerie brand" },
    { name: "Lacy", slug: "lacy", description: "Elegant lace lingerie" },
    { name: "Comfort Plus", slug: "comfort-plus", description: "Comfortable everyday wear" },
    { name: "Elegance", slug: "elegance", description: "Luxury sleepwear" },
    { name: "Active Line", slug: "active-line", description: "Sports and active lingerie" },
    { name: "Soft Touch", slug: "soft-touch", description: "Ultra-soft fabrics" },
  ];

  for (const brand of brandsData) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  console.log("  Brands seeded.");

  // ---------------------------------------------------------------------------
  // 4. Colors
  // ---------------------------------------------------------------------------
  const colorsData = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Red", hex: "#DC2626" },
    { name: "Pink", hex: "#EC4899" },
    { name: "Cream", hex: "#FDE68A" },
    { name: "Nude", hex: "#D4A574" },
    { name: "Purple", hex: "#9333EA" },
    { name: "Blue", hex: "#2563EB" },
    { name: "Green", hex: "#16A34A" },
    { name: "Brown", hex: "#92400E" },
  ];

  for (const color of colorsData) {
    await prisma.color.upsert({
      where: { name: color.name },
      update: {},
      create: color,
    });
  }
  console.log("  Colors seeded.");

  // ---------------------------------------------------------------------------
  // 5. Sizes
  // ---------------------------------------------------------------------------
  const sizesData = [
    { name: "XS", sortOrder: 1 },
    { name: "S", sortOrder: 2 },
    { name: "M", sortOrder: 3 },
    { name: "L", sortOrder: 4 },
    { name: "XL", sortOrder: 5 },
  ];

  for (const size of sizesData) {
    await prisma.size.upsert({
      where: { name: size.name },
      update: {},
      create: size,
    });
  }
  console.log("  Sizes seeded.");

  // ---------------------------------------------------------------------------
  // 6. Shipping settings
  // ---------------------------------------------------------------------------
  const shippingSettings = [
    {
      key: "free_shipping_threshold",
      value: "2000000",
      type: "integer" as const,
      label: "آستانه ارسال رایگان",
    },
    {
      key: "shipping_fee_base",
      value: "45000",
      type: "integer" as const,
      label: "هزینه ارسال پیش‌فرض",
    },
  ];

  for (const setting of shippingSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
      },
    });
    console.log(`  Setting "${setting.key}" (${setting.label}) ensured.`);
  }

  // ---------------------------------------------------------------------------
  // 7. Contact & social settings
  // ---------------------------------------------------------------------------
  const contactSettings = [
    {
      key: "site_name",
      value: "زیوو",
      label: "نام سایت",
    },
    {
      key: "site_description",
      value:
        "زیوو فروشگاهی آنلاین و تخصصی در حوزه پوشاک بانوان است؛ از سوتین و شورت گرفته تا لباس خواب و لباس شب.",
      label: "توضیحات سایت",
    },
    {
      key: "contact_phone",
      value: "021-26290000",
      label: "تلفن تماس",
    },
    {
      key: "contact_email",
      value: "info@zivo.shop",
      label: "ایمیل",
    },
    {
      key: "contact_address",
      value: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، شماره ۱۲۰",
      label: "آدرس",
    },
    {
      key: "contact_hours",
      value: "همه‌روزه ۹ صبح تا ۹ شب",
      label: "ساعت کاری",
    },
    {
      key: "contact_instagram",
      value: "https://instagram.com/zivo.shop",
      label: "لینک اینستاگرام",
    },
    {
      key: "contact_telegram",
      value: "https://t.me/zivo.shop",
      label: "لینک تلگرام",
    },
    {
      key: "contact_whatsapp",
      value: "",
      label: "لینک واتس‌اپ",
    },
    {
      key: "contact_map_location",
      value: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، شماره ۱۲۰",
      label: "موقعیت روی نقشه",
    },
    {
      key: "contact_map_latitude",
      value: "35.7752",
      label: "عرض جغرافیایی",
    },
    {
      key: "contact_map_longitude",
      value: "51.42",
      label: "طول جغرافیایی",
    },
  ];

  for (const setting of contactSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        type: "text",
      },
    });
    console.log(`  Setting "${setting.key}" (${setting.label}) ensured.`);
  }

  // ---------------------------------------------------------------------------
  // Done
  // ---------------------------------------------------------------------------
  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
