# React 19 Best Practices

Apply these rules whenever React code is created or modified. Follow the project's installed React version and existing architecture.

## React 19

- Use React 19 APIs when appropriate:
  - `use()`
  - `useActionState()`
  - `useFormStatus()`
  - `useOptimistic()`
  - Actions
- Prefer `useActionState()` over deprecated `useFormState()`.
- For Server Actions, prefer:
  - `<form action={serverAction}>`
  - `useActionState()` for action state
  - `useFormStatus()` for pending state
- Use `use()` for Promise/context consumption when it simplifies the component.
- Use `useId()` for stable SSR/CSR IDs, especially form and accessibility attributes.
- Use `useTransition()` and `useDeferredValue()` for non-urgent UI updates.
- Keep Client Components small; prefer Server Components for data fetching and static UI.
- Use `useLayoutEffect()` only in Client Components and only when DOM measurement/synchronous layout work is required. Prefer `useEffect()` otherwise.

## React Compiler

When React Compiler is enabled:

- Prefer relying on automatic memoization.
- Do not add `React.memo`, `useMemo`, or `useCallback` by default.
- Use manual memoization only when there is a concrete reason, such as precise control or effect dependencies.
- Never mutate props or state directly.
- Keep components compatible with the Rules of React.
- Avoid side effects during rendering.
- Use `"use no memo"` only when a specific component must opt out of compiler optimization.
- Before removing existing manual memoization, verify that behavior and performance remain correct.

## React 19.2

- `<Activity>` may be used when preserving component state while hiding UI is required, such as tabs, sidebars, and multi-step interfaces.
- Prefer normal conditional rendering when state preservation is not required.
- Next.js 16 may manage `<Activity>` automatically when Cache Components are enabled; do not add manual `<Activity>` unnecessarily.
- Use `useEffectEvent()` when event-like logic needs to be separated from effect dependencies.
- View Transitions are experimental; do not enable or depend on them unless explicitly required and supported by the project.

## Component Purity

Components must be pure:

- Same inputs should produce the same rendered output.
- Never mutate props, state, module-level variables, or external objects during render.
- Never perform side effects during rendering.
- Local mutation of values created during the current render is acceptable.
- Keep data fetching, subscriptions, timers, DOM operations, and mutations outside render logic.
- Pure components improve predictability, SSR compatibility, caching, testing, and compiler optimization.

## Server/Client Boundaries

For Next.js projects:

- Prefer Server Components by default.
- Use Client Components only when browser APIs, state, effects, event handlers, or client-only libraries are required.
- Keep the client boundary as small as possible.
- Do not move server-side data fetching into Client Components unnecessarily.
- Follow `Next.js.md` for Server/Client architecture and data fetching.

## Keys

List keys must be:

- Unique.
- Stable across renders.
- Derived from the underlying data.

Prefer:

```tsx
key={item.id}
```

Avoid:

```tsx
key={index}
key={Math.random()}
```

Array indexes are acceptable only for truly static lists that never reorder, insert, or remove items.

## Effects

Use Effects only to synchronize React with external systems.

Appropriate uses:

- Browser APIs.
- DOM synchronization.
- Subscriptions/WebSockets/SSE.
- Timers and intervals.
- Third-party libraries/widgets.
- Focus or keyboard integrations.

Avoid Effects for:

- Derived/rendered data.
- Transforming props into state.
- Handling user events.
- Synchronizing state that can be calculated during render.
- Data fetching in Next.js Server Components.
- Replacing normal event handlers.
- Caching calculations.

Prefer:

```tsx
const filtered = items.filter(...)
```

over storing derived values through an Effect.

### Effect Rules

- Effects must be safe to execute more than once.
- Effects must not depend on execution order relative to other Effects.
- Always clean up subscriptions, timers, listeners, and external resources.
- Prevent stale async responses/race conditions when asynchronous Effects are unavoidable.
- Keep each Effect focused on one external synchronization concern.
- Prefer `useEffectEvent()` for event-like logic inside complex Effects.

## State

- Keep state minimal.
- Do not store values that can be derived from existing props/state.
- Calculate derived values during rendering.
- Use state only for values that genuinely change independently over time.
- Use a `key` when component state must reset because the identity of the component changed.
- Avoid unnecessary global state.

## Error Boundaries

- Error Boundaries must be Client Components.
- Use `error.tsx` in Next.js for route-level error handling.
- Add boundaries at meaningful application/feature boundaries.
- Combine Error Boundaries with Suspense where granular loading/error isolation is useful.
- Do not expose internal errors, stack traces, or sensitive information to users.
- Send unexpected errors to the project's error-monitoring system when configured.

## Loading & Async UI

- Use Suspense for asynchronous UI boundaries and progressive rendering.
- Keep loading states close to the component/feature they represent.
- Avoid blocking the entire application for independent async content.
- Prefer framework-level data fetching over client-side Effect-based fetching.

## Performance

- Measure before optimizing.
- Use React DevTools Profiler to identify actual rendering bottlenecks.
- Prefer React Compiler automatic optimization when enabled.
- Avoid unnecessary re-renders caused by redundant state or unstable component structure.
- Use dynamic imports/code splitting for expensive client-side features.
- Prefer Server Components to reduce client JavaScript.
- Use `useMemo`/`useCallback` only when they provide measurable or architectural value.
- Avoid premature optimization.

## Rendering Architecture

- Build UI from small, focused, composable components.
- Separate data concerns from presentation when complexity requires it.
- Prefer composition over deeply coupled components.
- Avoid unnecessarily large Client Components.
- Keep reusable components independent from page-specific business logic.
- Split complex UI into independently renderable sections.

## Accessibility

- Use semantic HTML.
- Associate form controls with labels.
- Use stable IDs from `useId()` when needed.
- Preserve keyboard accessibility.
- Use ARIA only when native HTML semantics are insufficient.
- Ensure interactive elements have accessible names and states.

## Agent Requirements

When modifying React code:

1. Inspect existing component structure and conventions first.
2. Preserve the existing Server/Client boundary.
3. Prefer Server Components unless client behavior is required.
4. Keep components pure.
5. Avoid unnecessary Effects and derived state.
6. Use stable data-based keys.
7. Keep state minimal.
8. Clean up every external subscription/timer/listener.
9. Avoid unnecessary memoization when React Compiler is enabled.
10. Measure performance before introducing complex optimizations.
11. Preserve accessibility.
12. Run TypeScript, ESLint, and relevant tests after meaningful changes.
