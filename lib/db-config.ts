import "dotenv/config";

export type DbConfig = {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  connectionLimit?: number;
  acquireTimeout?: number;
  connectTimeout?: number;
  initializationTimeout?: number;
};

// Shared MariaDB connection configuration used by the app (lib/prisma.ts) and
// the standalone seeders (prisma/seed.ts, prisma/seed-locations.ts).
//
// Everything is driven by DATABASE_URL (the same value prisma.config.ts uses),
// so the deploy target only has to configure .env. Explicit overrides below are
// optional and rarely needed.

const DEV_FALLBACK = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mehdi123",
  database: "zivo_shop",
};

function positiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseDatabaseUrl(url: string | undefined) {
  if (!url) return DEV_FALLBACK;
  try {
    const u = new URL(url);
    return {
      host: u.hostname || DEV_FALLBACK.host,
      port: u.port ? Number(u.port) : DEV_FALLBACK.port,
      user: decodeURIComponent(u.username) || DEV_FALLBACK.user,
      password: decodeURIComponent(u.password) || DEV_FALLBACK.password,
      database: (u.pathname ?? "").replace(/^\//, "") || DEV_FALLBACK.database,
    };
  } catch {
    return DEV_FALLBACK;
  }
}

export function getDbConfig(): DbConfig {
  const creds = parseDatabaseUrl(process.env.DATABASE_URL);

  return {
    ...creds,
    // Build-time static generation fires many concurrent product/catalog
    // queries, so a pool of 5 easily starves. 15 + generous timeouts keeps the
    // build from tripping the default 10s pool acquire timeout on slower hosts.
    connectionLimit: positiveInt(process.env.DATABASE_CONNECTION_LIMIT, 15),
    acquireTimeout: positiveInt(process.env.DATABASE_ACQUIRE_TIMEOUT, 30000),
    connectTimeout: positiveInt(process.env.DATABASE_CONNECT_TIMEOUT, 30000),
    initializationTimeout: positiveInt(
      process.env.DATABASE_INITIALIZATION_TIMEOUT,
      30000
    ),
  };
}