# AGENTS.md

> Entry point for AI agents working on the Antonio Salvatore Calò portfolio.
> Full documentation in [`docs/INDEX.md`](docs/INDEX.md).
> Owner: All Teams

---

## Quick Start

```bash
npm run dev          # Vite dev server on port 3000 (--host 0.0.0.0)
npm run build        # Production build (~6-12s)
npm run lint         # tsc --noEmit (typecheck only — MUST pass before completing work)
npm run preview      # Preview production build
npm run clean        # Remove dist/
npm run hooks:install # Install pre-commit hook
npm run hooks:check   # Run hook check across working tree
```

---

## 6 Critical Rules — Violating These Breaks the App

1. **Hooks**: Never call `useTransform`/`useScroll`/`useSpring` conditionally — they must be top-level in the component body
2. **GSAP**: Never use `!important` on CSS properties that GSAP animates (opacity, transform, filter) — GSAP cannot override `!important`
3. **Scroll**: No global Lenis instance. `ScrollProvider` holds refs + responsive state; only `ProjectBrutalistLayout` initializes Lenis locally on the right column (desktop only)
4. **Router**: Never use `createBrowserRouter` — `BrowserRouter` + plain `<Routes>` only. There is **no `AnimatePresence` at the route level**
5. **Visibility**: Never hardcode `visibility:hidden` — let Motion's `AnimatePresence` (when used inside components) handle transitions
6. **Providers**: `MotionPreferenceProvider` and `ScrollProvider` are top-level (in `main.tsx`); `LanguageProvider` is router-scoped (in `AppRouter.tsx`). `FilterProvider` is local to `PortfolioLayout`. **There is no `ThemeProvider`** — theme is a `useTheme()` hook

> **Full details:** See [`docs/engineering/rules.md`](docs/engineering/rules.md) for the complete z-index system, styling conventions, naming rules, and known technical debt.

---

## Architecture Summary

**Home (`/`)**: `App` → lazy `PortfolioLayout` → `FilterProvider` → `ProjectIndex` → `ProjectGrid` (single-column). `PortfolioLayout` does **not** initialize Lenis — it only sets `gsap.ticker.lagSmoothing(500, 33)`. `SiteHeader` lives at the layout level. `ProjectPreview` shows the hovered project cover as an overlay; click navigates to `/projects/:slug` after 600ms.

**Project pages (`/projects/bugonia`, `/projects/newsquest` + `/credits`)**: Rendered by `BugoniaPage` / `NewsquestPage` inside `ProjectBrutalistLayout`. On desktop the layout is a 2-column split (20% / 80%); the right column owns a Lenis instance wired through `initLenis()` from `lib/lenis-manager.ts` and connected to the GSAP ticker. On mobile the split collapses to a single column with tab switching between `project` and `credits` (tab state derived from `location.pathname`). Mobile uses native scroll.

**Contact (`/contact`)**: `ContactPage` with the `ContactBuilder` interactive 7-step sentence-builder form. Posts to `/api/contact` (Vercel serverless).

**Entrypoint chain** (verified against `src/main.tsx` and `src/providers/AppRouter.tsx`):

```
main.tsx (StrictMode)
└── MotionPreferenceProvider          # OS reduced-motion + <MotionConfig>
    └── ScrollProvider                # isDesktop, isTablet, refs
        └── router (BrowserRouter)
            └── <Routes>              # no AnimatePresence
                └── LanguageProvider  # top-level (router-scoped) provider
                    └── <Routes>…</Routes>
```

**Routing**: `BrowserRouter` + plain `<Routes>` (no `AnimatePresence`). Six routes: `/`, `/projects/bugonia`, `/projects/bugonia/credits`, `/projects/newsquest`, `/projects/newsquest/credits`, `/contact`. Lazy-loaded pages use `<Suspense fallback={…}>`.

---

## Before Editing — Impact-Check Protocol

1. Read the target file fully
2. `grep -r "[filename-stem]" src/ --include="*.tsx" --include="*.ts"`
3. If file touches scroll → trace Lenis ref chain (`ProjectBrutalistLayout` is the only `initLenis` / `destroyLenis` call site)
4. If file touches animation → identify `gsap.context()` scope and what it cleans up
5. If file touches routing → verify `<Routes>` tree and lazy `Suspense` boundaries
6. If file touches providers → confirm provider placement (top-level vs local)
7. List every affected component, then edit

---

## Documentation Map

Refer to [`docs/INDEX.md`](docs/INDEX.md) for the full documentation tree.

| Area | Path | What You'll Find |
|------|------|------------------|
| **Product** | [`docs/product/`](docs/product/) | Vision, brand, users, design principles |
| **Design System** | [`docs/design-system/`](docs/design-system/) | Tokens, colors, typography, components, motion, z-index |
| **Animations** | [`docs/animations/README.md`](docs/animations/README.md) | GSAP setup, ScrollTrigger, reduced motion, hooks |
| **Engineering** | [`docs/engineering/`](docs/engineering/) | Architecture, rules, stack, key files, agent brief |
| **QA** | [`docs/qa/`](docs/qa/) | Testing strategy, validation pipeline, quality gates |
| **Agent Brief** | [`docs/engineering/agent-brief.md`](docs/engineering/agent-brief.md) | Full orchestrator system, skill routing, agent commands |
| **ADRs** | [`docs/adr/`](docs/adr/) | Architecture decision records |
| **Systems** | [`docs/systems/`](docs/systems/) | Cross-cutting system documentation |
