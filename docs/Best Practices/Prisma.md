# Prisma Best Practices

Apply these rules whenever Prisma ORM is used. Follow the project's installed Prisma version and existing database architecture.

## 1. Schema & Database Changes

- Define the database schema in `prisma/schema.prisma`.
- Never modify the production database schema manually.
- All schema changes MUST go through Prisma migrations.
- Use descriptive PascalCase model names and camelCase field names.
- Use `@map()` for database column naming and `@@map()` for table naming when database naming differs from Prisma conventions.
- Review generated migration SQL before applying it.
- Never manually edit generated migration files.
- Commit migration files to version control.

### Migrations

Development:

```bash
npx prisma migrate dev --name <name>
```

Production:

```bash
npx prisma migrate deploy
```

Never use `migrate dev` against production databases.

## 2. Relations & Constraints

- Define relations explicitly with `@relation`.
- Add indexes to foreign-key fields when they are queried/used for joins.
- Use `onDelete: Cascade` only when child records should genuinely be deleted with the parent.
- Use `@unique` for values that must be unique.
- Use composite indexes for common multi-field filtering/sorting patterns.
- Do not add indexes blindly; consider actual query patterns and write overhead.

## 3. Soft Deletes

When the domain requires recoverable deletion:

- Use nullable `deletedAt` instead of hard deletion.
- Index `deletedAt` when frequently filtered.
- Normal queries MUST exclude soft-deleted records (`deletedAt: null`).
- Explicitly include deleted records only when the use case requires it.
- Never forget soft-delete filtering in repository/service queries.

## 4. Prisma Client

- Use a singleton Prisma Client instance in application code.
- Reuse the instance across Next.js development hot reloads.
- Do not instantiate `PrismaClient` repeatedly per request.
- Prisma manages normal connection lifecycle; do not manually disconnect the shared application client.
- Enable detailed query logging only in development.
- Production logging should normally be limited to errors.

## 5. Query Performance

- Select only required fields with `select`; avoid unnecessary over-fetching.
- Use `include` only when related data is actually needed.
- Prefer nested `select` over loading entire related records when possible.
- Avoid N+1 queries; use relational queries, `include`, batching, or appropriate aggregation.
- Add indexes based on actual `where`, `orderBy`, join, and uniqueness requirements.
- Use pagination for potentially large result sets.
- Avoid loading unbounded collections.
- Use `orderBy` explicitly when deterministic ordering matters.
- Keep filtering in the database rather than fetching large datasets and filtering in application code.

## 6. Pagination

- Use Prisma pagination (`skip`/`take`) for standard offset pagination.
- For large/high-volume datasets, prefer cursor pagination when appropriate.
- Always define deterministic ordering for pagination.
- Never fetch an entire large table merely to paginate it in application memory.

## 7. Transactions

Use `$transaction` when multiple database operations must succeed or fail atomically.

- Keep transactions short.
- Do not perform slow external API calls or unrelated work inside a transaction.
- Use appropriate isolation levels only when required by the consistency model.
- Do not wrap independent single operations in unnecessary transactions.

## 8. Type Safety

- Use Prisma-generated TypeScript types instead of duplicating database types manually.
- Use `Prisma.*Input`, `Prisma.*WhereInput`, and `Prisma.*GetPayload` where appropriate.
- Preserve type safety when using `select` and `include`.
- Avoid `any` for Prisma data.
- Do not duplicate model definitions in application types unless a separate domain/API representation is intentionally required.

## 9. Error Handling

Handle Prisma errors explicitly when the application can recover or return a meaningful response.

Common errors:

- `P2002` → unique constraint violation
- `P2003` → foreign-key constraint violation
- `P2025` → required record not found

Do not expose raw Prisma/database errors directly to users. Map them to appropriate domain/API errors.

## 10. Validation & Security

- Validate external input before passing it to Prisma.
- Use Zod or the project's established validation layer for Server Actions, API routes, forms, and other untrusted input.
- Never construct raw SQL from untrusted user input.
- Prefer Prisma's parameterized query APIs.
- If `$queryRaw`/`$executeRaw` is necessary, use parameterized/tagged-template queries.
- Never commit database credentials or secrets.
- Keep `DATABASE_URL` and other credentials in environment variables.

## 11. Seeding

- Keep development/test seed logic in `prisma/seed.ts` or the project's configured seed location.
- Make seeds deterministic/idempotent when practical.
- Do not place production secrets in seed files.
- Seed data must not accidentally overwrite real production data.
- Disconnect temporary Prisma clients created specifically for seed scripts.

## 12. Next.js Integration

Use Prisma only in server-side contexts:

- Server Components
- Server Actions
- Route Handlers/API routes
- Server-only services/repositories

Never expose Prisma Client or database credentials to Client Components.

Prefer a service/repository layer for non-trivial database logic rather than spreading complex Prisma queries across UI components.

Follow `Next.js.md` for Server/Client boundaries and data-fetching architecture.

## 13. Environment & Production

- Store the database connection in environment variables such as `DATABASE_URL`.
- Never commit `.env` files or credentials.
- Validate required environment variables at startup.
- Use `prisma migrate deploy` during production deployment.
- Do not run `prisma migrate dev` in production.
- Disable verbose query logging in production.
- Use connection pooling appropriately for the deployment architecture.
- Use read replicas only when justified by actual read workload.
- For multi-instance/serverless deployments, verify connection-pooling requirements before deployment.

## 14. Caching

- Do not cache database results blindly.
- Choose caching based on data freshness and consistency requirements.
- When using Next.js Cache Components, follow `Next.js.md` for `"use cache"`, `cacheTag`, `revalidateTag`, and invalidation strategy.
- Invalidate cached data after mutations when required.
- Never cache sensitive/request-specific data without an explicit, safe strategy.

## 15. Development Tools

- Use Prisma Studio for development/database inspection when appropriate:

```bash
npx prisma studio
```

- Query logging may be enabled during development for debugging.
- Do not rely on Prisma Studio as a substitute for migrations or application-level tests.

## 16. Agent Requirements

When modifying Prisma/database code:

1. Inspect the existing schema and related models before changing them.
2. Reuse existing relations, indexes, enums, and conventions.
3. Check whether the change requires a migration.
4. Never manually alter production schema.
5. Review query performance and N+1 risks.
6. Preserve soft-delete behavior where applicable.
7. Use transactions only when atomicity is required.
8. Validate external input before database operations.
9. Preserve generated Prisma/TypeScript type safety.
10. Never expose database credentials or raw database errors.
11. Run the appropriate Prisma generation, type-check, lint, tests, and migration validation after meaningful changes.

**Follow these Prisma-specific rules by default unless the user explicitly requests a different approach**
