# Best Practices Index

Use these documents as the project's technical guidelines. Read the relevant document(s) when working on that technology or concern. Do not load unrelated documents.

## Documents

| Document | Scope |
|---|---|
| [Next.js.md](./Next.js.md) | Next.js 16, App Router, Cache Components/PPR, Server Actions, data fetching, SEO, i18n, build & deployment |
| [React.md](./React.md) | React 19, Compiler, components, effects, error boundaries, performance |
| [TypeScript.md](./TypeScript.md) | Type safety, strictness, types/interfaces, async/promises, React/Next.js patterns |
| [Tailwind.md](./Tailwind.md) | Tailwind configuration, classes, dark mode, theme, variants, responsive styling |
| [shadcn.md](./shadcn.md) | shadcn/ui, customization, `cn()`, CVA, forms, accessibility |
| [Zod.md](./Zod.md) | Schemas, validation, errors, inference, forms, Server Actions, APIs |
| [Prisma.md](./Prisma.md) | Schema, migrations, queries, transactions, type safety, soft deletes, Next.js integration |
| [Testing.md](./Testing.md) | Playwright, Vitest, React Testing Library, testing strategy |
| [ESLint.md](./ESLint.md) | ESLint, Flat Config, framework integrations, rules, linting, CI |
| [Shared.md](./Shared.md) | Architecture, project structure, state, forms, auth/RBAC, security, testing, environment variables, general standards |

## Loading Rules

- Do NOT read every Best Practice document for every task.
- Read only documents relevant to the current task.
- For cross-cutting tasks, read all directly relevant documents.
- `Shared.md` applies to general architectural/code-quality decisions.
- Technology-specific documents take precedence for technology-specific rules.
- `AGENTS.md` project instructions take precedence over these documents when explicitly specified.
- If documents conflict, follow the most specific applicable rule and preserve existing project conventions unless explicitly instructed otherwise.

## Default

Follow applicable Best Practices for all code generation and modification unless the user explicitly requests a different approach.