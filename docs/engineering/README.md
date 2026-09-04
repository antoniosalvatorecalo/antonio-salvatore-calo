# Engineering Documentation

> Architecture, technical stack, critical rules, and system design for the Antonio Salvatore Calò portfolio.
> Owner: Engineering

---

## Contents

| Document | Description |
|----------|-------------|
| [`README.md`](README.md) (this file) | Engineering overview, architecture, conventions |
| [`architecture.md`](architecture.md) | System architecture, entrypoint chain, rendering layers, component contracts |
| [`routing-and-pages.md`](routing-and-pages.md) | Routing, page structure, transitions, lazy loading |
| [`layouts.md`](layouts.md) | `PortfolioLayout`, `ProjectBrutalistLayout`, column behaviors |
| [`state-management.md`](state-management.md) | Providers, contexts, ref patterns, route-derived state |
| [`animation-system.md`](animation-system.md) | GSAP, Motion, entrance reveals, reduced motion |
| [`scrolling-system.md`](scrolling-system.md) | Lenis per-layout, ScrollTrigger, synchronization |
| [`navigation-and-theming.md`](navigation-and-theming.md) | `SiteHeader`, `useTheme`, swipe gestures, language |
| [`content-architecture.md`](content-architecture.md) | Project registry, media, authoring workflow |
| [`responsive-system.md`](responsive-system.md) | Three-tier responsive model, breakpoints, touch targets |
| [`performance-and-deployment.md`](performance-and-deployment.md) | Bundle splitting, GPU acceleration, Vercel deployment, security |
| [`rules.md`](rules.md) | 6 Critical Rules, styling, naming, z-index system |
| [`key-files.md`](key-files.md) | Key files map — every significant file and its role |
| [`agent-brief.md`](agent-brief.md) | Full agent orchestration brief (previously root `AI.md`) |

---

## Architecture

### Routes (current)

- `/` → `App` → lazy `PortfolioLayout` → `ProjectIndex` → `ProjectGrid`
- `/projects/bugonia`, `/projects/bugonia/credits` → `BugoniaPage`
- `/projects/newsquest`, `/projects/newsquest/credits` → `NewsquestPage`
- `/contact` → `ContactPage`

### Provider Tree

`LanguageProvider` is the **only** top-level provider. `MotionPreferenceProvider`, `ScrollProvider`, `ThemeProvider` are mounted at the page/layout that needs them. `FilterProvider` lives inside `PortfolioLayout`.

### Entrypoint Chain

```
main.tsx (StrictMode) → LanguageProvider → BrowserRouter → AnimatedRoutes
```

### Routing

- `BrowserRouter` + `AnimatePresence mode="wait"` wraps all `<Routes>`.
- Each route is a `motion.div` keyed by pathname.
- Crossfade ~0.25s.

### Path Alias

`@/` → `./src/` (configured in both `vite.config.ts` and `tsconfig.json`)

### Font

"TT Interphases Pro" is served as local `.ttf` files from `/public/fonts/`. Preloaded in `index.html`. No Google Fonts CDN — the CSP `font-src` only allows `'self'` and `fonts.gstatic.com`.

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 5.8.x |
| Bundler | Vite | 6.x |
| Styling | Tailwind CSS | 4.x |
| Animation | GSAP + Motion | 3.x / 12.x |
| Smooth Scroll | Lenis | 1.x |
| Routing | React Router | 7.x |

---

## Conventions

### Naming

| Artifact | Convention | Example |
|----------|-----------|---------|
| Components | `PascalCase.tsx` | `ProjectGallery.tsx` |
| Hooks | `useCamelCase.ts` | `useEntranceReveal.ts` |
| Logic/config | `kebab-case.ts` | `gsap-setup.ts` |
| Constants | `UPPER_SNAKE_CASE` | `MIN_DURATION_MS` |
| Booleans | `is`/`has`/`should`/`can` prefix | `isFirstLoad` |

### Styling

- Brutalist aesthetic: high-contrast, square corners (`--radius-none: 0px`), bold typography.
- Design tokens in `:root` of `src/index.css` — use CSS variables, not raw values.
- Tailwind v4 with `@tailwindcss/vite` plugin (no `tailwind.config.js`).
- `cn()` utility in `src/lib/utils.ts` (clsx + tailwind-merge).
- Tailwind is primarily used to wire up tokens; per-component styles still live in component CSS.

---

## Before Editing — Impact-Check Protocol

1. Read the target file fully.
2. `grep -r "[filename-stem]" src/ --include="*.tsx" --include="*.ts"`
3. If file touches scroll → trace Lenis ref chain (`ScrollProvider` refs → layout-local Lenis init).
4. If file touches animation → identify `gsap.context()` scope and what it cleans up.
5. If file touches routing → verify AnimatePresence key strategy.
6. List every affected component, then edit.

---

## Cross-References

- Architecture satisfies **Product** requirements → [`docs/product/`](../product/)
- Design tokens must match **Design** system → [`docs/design-system/`](../design-system/)
- **QA** validates engineering implementation → [`docs/qa/`](../qa/)
- See [critical rules](rules.md) before making any code change
- See [key files](key-files.md) for the source-of-truth file map
- See [agent brief](agent-brief.md) for the complete orchestration system

### Engineering Doc Quick Links

| Area | Doc |
|------|-----|
| Architecture | [`architecture.md`](architecture.md) |
| Routing & Pages | [`routing-and-pages.md`](routing-and-pages.md) |
| Layouts | [`layouts.md`](layouts.md) |
| State Management | [`state-management.md`](state-management.md) |
| Animation System | [`animation-system.md`](animation-system.md) |
| Scrolling System | [`scrolling-system.md`](scrolling-system.md) |
| Navigation & Theming | [`navigation-and-theming.md`](navigation-and-theming.md) |
| Content Architecture | [`content-architecture.md`](content-architecture.md) |
| Responsive System | [`responsive-system.md`](responsive-system.md) |
| Performance & Deployment | [`performance-and-deployment.md`](performance-and-deployment.md) |
| Critical Rules | [`rules.md`](rules.md) |
| Key Files Map | [`key-files.md`](key-files.md) |
| Agent Brief | [`agent-brief.md`](agent-brief.md) |
