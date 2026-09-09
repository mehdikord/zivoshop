import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { readFileSync, existsSync } from "fs";
import path from "path";

// ============================================================================
// Dedicated Province & City seeder
// ----------------------------------------------------------------------------
// Loads the complete Iranian provinces/cities data from the SQL dump files:
//   docs/data/provinces.sql
//   docs/data/cities.sql
// and stores them into the system's `provinces` and `cities` tables with the
// correct structure (unique slugs) and the cities ↔ provinces foreign key.
//
// This is a STANDALONE seeder. It is intentionally NOT part of the regular
// `db:seed` command. Run it with its own dedicated command:
//
//   pnpm run db:seed:locations
// ============================================================================

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mehdi123",
  database: "zivo_shop",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// File discovery (robust across working directories)
// ---------------------------------------------------------------------------
const candidates = [
  path.resolve(process.cwd(), "..", "docs", "data", "provinces.sql"),
  path.resolve(process.cwd(), "docs", "data", "provinces.sql"),
  path.resolve(__dirname ?? "", "..", "..", "docs", "data", "provinces.sql"),
];

function resolveSqlFile(baseName: "provinces.sql" | "cities.sql"): string {
  for (const base of candidates) {
    const candidate = path.join(path.dirname(base), baseName);
    if (existsSync(candidate)) return candidate;
  }
  // Fallback: look next to the provinces file relative to cwd
  const fallback = path.resolve(process.cwd(), "..", "docs", "data", baseName);
  if (existsSync(fallback)) return fallback;
  throw new Error(
    `فایل ${baseName} در مسیر docs/data یافت نشد. مطمئن شوید seeder را از پوشه next/ اجرا میکنید.`
  );
}

// ---------------------------------------------------------------------------
// SQL parsing
// ---------------------------------------------------------------------------
interface ProvinceRow {
  sourceId: number;
  name: string;
}

interface CityRow {
  sourceId: number;
  provinceId: number;
  name: string;
}

/** Extract (id, 'name') rows from an `INSERT INTO provinces` statement. */
function parseProvinces(sql: string): ProvinceRow[] {
  const rows: ProvinceRow[] = [];
  const re = /INSERT INTO `provinces` VALUES \((\d+), '([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    rows.push({ sourceId: Number(m[1]), name: cleanName(m[2] ?? "") });
  }
  return rows;
}

/** Extract (id, province_id, 'name') rows from an `INSERT INTO cities` statement. */
function parseCities(sql: string): CityRow[] {
  const rows: CityRow[] = [];
  const re = /INSERT INTO `cities` VALUES \((\d+), (\d+), '([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    rows.push({
      sourceId: Number(m[1]),
      provinceId: Number(m[2]),
      name: cleanName(m[3] ?? ""),
    });
  }
  return rows;
}

/** Strip literal `\n`, `\r\n` suffixes and surrounding whitespace. */
function cleanName(raw: string): string {
  return raw
    .replace(/\\r\\n/g, " ")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Persian → Latin transliteration (for stable unique slugs)
// ---------------------------------------------------------------------------
const FA_TO_EN: Record<string, string> = {
  "آ": "a", "ا": "a", "ب": "b", "پ": "p", "ت": "t", "ث": "s",
  "ج": "j", "چ": "ch", "ح": "h", "خ": "kh", "د": "d", "ذ": "z",
  "ر": "r", "ز": "z", "ژ": "zh", "س": "s", "ش": "sh", "ص": "s",
  "ض": "z", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f",
  "ق": "gh", "ک": "k", "گ": "g", "ل": "l", "م": "m", "ن": "n",
  "و": "v", "ه": "h", "ی": "y", "ئ": "y", "ء": "", "ؤ": "v",
  "ي": "y", "ك": "k", "ة": "h", "إ": "a", "أ": "a", "ٱ": "a",
};

function transliterate(input: string): string {
  let out = "";
  for (const ch of input) {
    if (FA_TO_EN[ch] !== undefined) out += FA_TO_EN[ch];
    else if (/[a-zA-Z0-9]/.test(ch)) out += ch;
    else if (ch === "\u200c") out += "-"; // ZWNJ
    else out += "-"; // any other non-latin/non-digit
  }
  return out;
}

function slugify(value: string): string {
  const slug = transliterate(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || "item";
}

/** Ensures a globally-unique slug by appending -2, -3, ... when needed. */
function makeUniqueSlug(base: string, used: Set<string>): string {
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  used.add(slug);
  return slug;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const provincesFile = resolveSqlFile("provinces.sql");
  const citiesFile = resolveSqlFile("cities.sql");

  console.log("Seeding provinces & cities from SQL dumps...");
  console.log(`  Provinces: ${provincesFile}`);
  console.log(`  Cities:    ${citiesFile}\n`);

  const provinces = parseProvinces(
    readFileSync(provincesFile, "utf-8")
  );
  const cities = parseCities(readFileSync(citiesFile, "utf-8"));

  if (provinces.length === 0) {
    throw new Error("هیچ استانی در فایل provinces.sql یافت نشد.");
  }
  if (cities.length === 0) {
    throw new Error("هیچ شهری در فایل cities.sql یافت نشد.");
  }

  console.log(`Parsed ${provinces.length} provinces and ${cities.length} cities.`);

  // Group cities by source province id.
  const citiesByProvince = new Map<number, CityRow[]>();
  for (const city of cities) {
    const list = citiesByProvince.get(city.provinceId) ?? [];
    list.push(city);
    citiesByProvince.set(city.provinceId, list);
  }

  await prisma.$transaction(async (tx) => {
    // Clean pass: remove any province/city rows that are NOT referenced by an
    // existing address, so re-runs are idempotent and this seeder remains the
    // authoritative source. Referenced rows are kept to respect FKs.
    const orphanCities = await tx.city.deleteMany({
      where: { addresses: { none: {} } },
    });
    const orphanProvinces = await tx.province.deleteMany({
      where: { addresses: { none: {} } },
    });
    console.log(`Cleaned ${orphanCities.count} orphan cities, ${orphanProvinces.count} orphan provinces.`);

    const usedProvinceSlugs = new Set<string>();
    const usedCitySlugs = new Set<string>();

    // Seed provinces, remembering the created id for each source id.
    const sourceToProvinceId = new Map<number, bigint>();
    for (const province of provinces) {
      let record = await tx.province.findFirst({
        where: { name: province.name },
        select: { id: true },
      });

      if (!record) {
        record = await tx.province.create({
          data: {
            name: province.name,
            slug: makeUniqueSlug(slugify(province.name), usedProvinceSlugs),
          },
          select: { id: true },
        });
      }

      sourceToProvinceId.set(province.sourceId, record.id);
    }

    // Seed cities linked to their province via the foreign key.
    let cityCount = 0;
    for (const province of provinces) {
      const provinceId = sourceToProvinceId.get(province.sourceId);
      if (provinceId === undefined) continue;

      const rows = citiesByProvince.get(province.sourceId) ?? [];
      for (const city of rows) {
        const existing = await tx.city.findFirst({
          where: { name: city.name, provinceId },
          select: { id: true },
        });
        if (existing) continue;

        await tx.city.create({
          data: {
            name: city.name,
            slug: makeUniqueSlug(slugify(city.name), usedCitySlugs),
            provinceId,
          },
        });
        cityCount++;
      }
    }

    console.log(`Inserted ${sourceToProvinceId.size} provinces and ${cityCount} cities.`);
  });

  const totalProvinces = await prisma.province.count();
  const totalCities = await prisma.city.count();
  console.log(`\nDone! Database now has ${totalProvinces} provinces and ${totalCities} cities.`);
}

main()
  .catch((e) => {
    console.error("Seed locations failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
