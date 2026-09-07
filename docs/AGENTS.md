# Coding Agent Rules

## Protected architecture

- Preserve the persistent `PortfolioLayout` and the shared `PortfolioScene` index/project planes.
- Preserve `idle`, `opening`, `project` and `closing` semantics, including delayed URL commit, browser history and focus restoration.
- Preserve `ProjectTransitionRequest` and the typed `ProjectMedia` catalog contract.
- Keep GSAP scene choreography separate from Motion component interactions.
- Do not change visual timing, easing, spacing or styling unless explicitly requested.

## Sanity constraints

- Bugonia is Sanity-only and must not receive a local fallback.
- Newsquest remains the canonical local project and must not be migrated implicitly.
- Treat `sanity/`, `src/cms/`, GROQ, generated types and import tooling as active code.
- Never run `sanity:import:bugonia` as validation or without explicit authorization.
- Never commit credentials or expose secrets through `VITE_` variables.

## No-regression rules

- Preserve keyboard access, focus visibility, focus restoration and reduced-motion behavior.
- Preserve `/`, `/projects/:slug`, `/contact` and `/api/contact`.
- Keep missing-media handling and transition input locking coherent.
- Do not deploy unless explicitly requested.

## Validation

```bash
npm run lint
npm run build
```

For Sanity changes, also run:

```bash
npm --prefix sanity run typecheck
npm run sanity:typegen
npm run sanity:build
```

Use [Architecture](architecture.md), [CMS](cms.md) and [Development](development.md) as the technical references.
