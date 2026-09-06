# Next.js 16 Best Practices

Apply these rules to all Next.js code. Follow the project's installed Next.js version and existing architecture. Do not introduce deprecated APIs or patterns.

## 1. Next.js 16 Breaking Changes

- Use `proxy.ts` instead of `middleware.ts` for new network-level proxy logic.
- `params`, `searchParams`, `cookies()`, `headers()`, and `draftMode()` are async; always `await` them before use.
- Use `PageProps`, `LayoutProps`, and `RouteContext` type helpers when useful; run `next typegen` when needed.
- `next lint` is removed. Use the project's ESLint/Biome command.
- `next build` does not run lint automatically.
- Next.js 16 requires Node.js 20.9+ and TypeScript 5.1+.
- `serverRuntimeConfig`, `publicRuntimeConfig`, and AMP are removed; use environment variables and modern Next.js APIs instead.
- Metadata/image generation APIs using async `params`/`id` must await them.
- `generateSitemaps` sitemap `id` is async; await it when applicable.
- Do not use deprecated `next/legacy/image`; use `next/image`.

## 2. App Router Architecture

- Use the App Router.
- Server Components are the default.
- Use Client Components only for interactivity, browser APIs, client state, or required client-only libraries.
- `'use client'` must be the first directive in the file.
- Never use React client hooks/browser APIs in Server Components.
- Keep Server Components pure: data fetching + rendering; no subscriptions, timers, browser APIs, global mutations, or render-time side effects.
- Put mutations in Server Actions or Route Handlers.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` where appropriate.
- Use `Suspense` for streaming and progressive rendering.
- Use Route Groups `(group)` for organization without changing URLs.
- Every parallel route slot must have `default.tsx` in Next.js 16.

## 3. Proxy / Middleware

- `proxy.ts` is for lightweight network-level concerns only:
  - redirects
  - rewrites
  - routing/i18n
  - lightweight header/cookie manipulation
  - lightweight A/B routing
- Do NOT put authentication, authorization, permissions, business logic, logging, or application data logic in `proxy.ts`.
- Put auth/authorization in Route Handlers, Server Actions, or layout/page-level checks.
- Do NOT use `revalidateTag`, `updateTag`, or `refresh` in `proxy.ts`.
- `proxy.ts` uses Node.js runtime and is not configurable to Edge.
- For Edge runtime, use Route Handlers or another supported Edge-compatible mechanism.
- Do not create new `middleware.ts`; migrate existing middleware to `proxy.ts` or the appropriate Route Handler.
- `skipMiddlewareUrlNormalize` is now `skipProxyUrlNormalize`.
- Treat experimental proxy options such as `proxyClientMaxBodySize` cautiously and use only when explicitly required.

## 4. Rendering Strategy

Choose rendering based on data requirements:

- **Static/ISR**: content pages, blogs, product/catalog pages, and infrequently changing data.
- **SSR/dynamic**: authenticated, personalized, or always-fresh data.
- **Hybrid**: prefer a static shell with dynamic sections streamed through `Suspense`.

Guidelines:
- Prefer ISR/static rendering when freshness does not require per-request execution.
- Use `cache: 'no-store'` only when data must be fresh per request.
- Use `generateStaticParams` for suitable dynamic routes.
- Use `connection()` when request-time execution must be explicitly forced.
- Do not use dynamic APIs merely because they are convenient.

## 5. Cache Components / PPR

When beneficial and compatible with the project, enable:

```ts
cacheComponents: true