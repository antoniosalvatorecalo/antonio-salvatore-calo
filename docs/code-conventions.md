# Code conventions

## Modules and naming

- Use `PascalCase` for components and types, `camelCase` for values/functions, `useSomething`
  for hooks, and `UPPER_SNAKE_CASE` only for genuine constants.
- Prefer named exports. Keep default exports for route-level lazy imports or APIs that require them.
- Order imports: React, third-party, `@/` application modules, local relatives, then styles.
- Use `@/` across features; use relative paths inside a tightly coupled module.
- Keep UI, providers/hooks, domain/lib, and CMS adapters flowing in that dependency direction.
  Generated Sanity types stay inside CMS adapters and are never edited manually.

## React and TypeScript

- Build focused semantic components; derive values instead of duplicating state.
- Effects synchronize external systems. Declare dependencies and always clean up listeners, observers,
  animation contexts, timers, and requests.
- Avoid speculative memoization and new context providers without shared state ownership.
- Do not add `any`, `@ts-ignore`, or unjustified non-null assertions. Prefer `unknown`, type guards,
  explicit domain types, and early validation.
- Handle async failures at the nearest recoverable boundary. Never expose secrets or raw production
  errors to users.

## CSS and accessibility

- Keep global tokens and resets in `index.css`; keep component rules beside their component.
- Use systematic component-oriented classes. Remove selectors only after reference and runtime checks.
- Animate `transform` and `opacity` where practical; apply `will-change` only during active animation.
- Use native semantic HTML first. Navigation is a link, actions are buttons, focus remains visible,
  keyboard and reduced-motion behavior are required, and ARIA must reflect actual state.

## Quality gates

Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, and the relevant
behavior tests before moving to the next refactor phase.
