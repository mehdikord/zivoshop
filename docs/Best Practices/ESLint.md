# ESLint Best Practices

## Core Rules

- Use ESLint Flat Config (`eslint.config.js` or `.mjs`); do not use legacy `.eslintrc`.
- Use ESLint v9+ conventions. For Next.js 16, never use the removed `next lint`; use `eslint` via the project's lint script.
- Install ESLint and plugins locally; never rely on a global ESLint installation.
- Start from recommended configs and add only project-relevant rules.
- Keep ESLint rules consistent across the project.
- Code generated or modified by the agent MUST pass ESLint with zero errors.

## Next.js

- Use `eslint-config-next` and its recommended rules.
- Follow the project's installed Next.js/ESLint versions; do not introduce incompatible plugin versions.
- Lint source files only; ignore generated/build artifacts.

## TypeScript

Use `typescript-eslint` with recommended rules.

Required:
- `@typescript-eslint/no-unused-vars`: `error`
- `@typescript-eslint/no-floating-promises`: `error`
- `@typescript-eslint/no-explicit-any`: `warn`
- Prefer proper types over `any`.
- Remove unused variables/imports rather than suppressing the rule.
- `explicit-function-return-type` may remain disabled unless the project requires it.

## React

- Use `eslint-plugin-react` and `eslint-plugin-react-hooks` where applicable.
- Enforce:
  - `react-hooks/rules-of-hooks`: `error`
  - `react-hooks/exhaustive-deps`: `warn`
- Disable `react/react-in-jsx-scope` for React 17+.
- Disable `react/prop-types` when TypeScript provides prop typing.
- For React 19, use a current `eslint-plugin-react-hooks` version compatible with the project's React version.

## General Rules

Recommended baseline:
- `prefer-const`: `error`
- `no-var`: `error`
- `no-console`: `warn` (use `error` in production if project policy requires it)

Rule levels:
- `off` / `0`: disabled
- `warn` / `1`: warning
- `error` / `2`: fails lint/CI

Do not disable rules casually. If a rule must be disabled, do so narrowly and only when justified.

## File Scope & Ignores

Use Flat Config `files` and `ignores`.

Ignore generated/dependency directories such as:
- `node_modules/**`
- `.next/**`
- `dist/**`
- `build/**`
- `coverage/**`

Prefer `ignores` in `eslint.config.*` over legacy `.eslintignore`.

Use separate config blocks when different file types or environments require different rules.

## Auto-fix

- Use `eslint --fix` for auto-fixable issues.
- Run lint/fix before committing when appropriate.
- Never use auto-fix as a substitute for reviewing the resulting code.

## Git & CI

- Use Husky + lint-staged when the project has pre-commit hooks.
- Run ESLint in CI/CD.
- CI MUST fail on ESLint errors.
- Lint staged files during commits rather than unnecessarily linting the entire repository.

## Performance

- Keep ESLint cache enabled where supported.
- Avoid linting generated files, dependencies, and unrelated artifacts.
- Keep ESLint configuration minimal; avoid unnecessary plugins/rules.

## Custom Rules & Plugins

- Prefer established community plugins over custom rules.
- Add custom rules only for genuine project-specific requirements.
- Document non-obvious custom rules and their rationale.

## Migration

When encountering legacy `.eslintrc`:
1. Migrate to Flat Config.
2. Update plugin/config syntax as required.
3. Verify all rules still work.
4. Run ESLint and fix resulting errors.

## Agent Requirements

When modifying code:
1. Follow the existing project's ESLint configuration if present.
2. Do not replace or weaken existing rules without a clear reason.
3. Reuse existing ESLint configuration/plugins before adding new ones.
4. Remove unused code/imports.
5. Run the project's lint command after meaningful changes.
6. Deliver code with zero ESLint errors.