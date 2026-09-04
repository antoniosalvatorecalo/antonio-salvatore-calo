# AI.md — Antonio Salvatore Calò — Portfolio Agent Instructions

> Master brain for the Antonio Salvatore Calò portfolio. Read on every session start.
> Owner: Antonio Salvatore (Salvo) — Web & UI Designer
>
> **Documentation has moved to [`docs/`](docs/INDEX.md).**
> This file is the concise orchestrator config. Full reference at `/docs/engineering/agent-brief.md`.

---

## Session Start Protocol

**Execute on every session start (in order):**

1. Read `docs/INDEX.md` → load documentation map
2. Read `docs/AGENTS.md` → load agent quick-start
3. Read `.claude/memory/MEMORY.md` → load persistent feedback + decisions (if it exists)

**After significant work:** Update relevant `docs/engineering/` or `docs/design-system/` files to match code changes.

---

## 6 Critical Rules — NEVER VIOLATE

```
1. HOOKS:      Never call useTransform/useScroll/useSpring conditionally
2. GSAP:       Never use !important on CSS properties GSAP animates
3. SCROLL:     ProjectBrutalistLayout owns Lenis on the right column (desktop only); no global Lenis
4. ROUTER:     Never use createBrowserRouter — BrowserRouter + Routes only (no AnimatePresence at route level)
5. VISIBILITY: Never hard visibility:hidden — let Motion AnimatePresence handle transitions
6. PROVIDERS:  LanguageProvider is the only top-level (router-scoped) provider; everything else is local
```

---

## Architecture

### Routes (current)

- `/` → `App` → lazy `PortfolioLayout` → `ProjectIndex` → `ProjectGrid`
- `/projects/bugonia`, `/projects/bugonia/credits` → `BugoniaPage`
- `/projects/newsquest`, `/projects/newsquest/credits` → `NewsquestPage`
- `/contact` → `ContactPage`

### Providers

- `MotionPreferenceProvider` — top-level, mounted in `main.tsx`. Reads OS `prefers-reduced-motion`, sets `data-motion` on `<html>`, wraps children in `<MotionConfig>`.
- `ScrollProvider` — top-level, mounted in `main.tsx`. Holds responsive state (`isDesktop`, `isTablet`) and `activeTab`.
- `LanguageProvider` — router-scoped (mounted in `AppRouter.tsx` inside `<Routes>`). EN/IT locale + `t(key)`.
- `FilterProvider` (from `FilterContext`) — local to `PortfolioLayout`. Home filter state.
- `ThemeProvider` — **does not exist**. Theme is a `useTheme()` hook that reads/writes `localStorage` and `data-theme` on `<html>` directly.

### Home rendering

`PortfolioLayout` is a single-column shell composing `SiteHeader` → `FilterProvider` → `ProjectIndex` → `ProjectGrid`. `ProjectPreview` shows the hovered project cover as an overlay. Click on a project navigates after a 600ms delay.

### Project pages

`ProjectBrutalistLayout` is a 2-column (20% / 80%) split on desktop, single-column with tab switching on mobile. The right column owns a Lenis instance on desktop via `initLenis()` from `lib/lenis-manager.ts`; mobile falls back to native scroll. The left column hosts `ScrollingProjectText` and credits. Active tab is derived from URL pathname (`/projects/:slug` = `project`, `/projects/:slug/credits` = `credits`).

### Contact

`ContactPage` renders `SiteHeader` + `ContactBuilder` — an interactive 7-step sentence-builder form (`name → project type → client → focus → budget → timeline → email`) that posts to `/api/contact`.

### Routing

- `BrowserRouter` → `<Routes>` (no `AnimatePresence`)
- Six routes total: `/`, `/projects/bugonia`, `/projects/bugonia/credits`, `/projects/newsquest`, `/projects/newsquest/credits`, `/contact`
- Active tab on project pages is derived from `location.pathname.endsWith('/credits')`

### Entrypoint chain

```
main.tsx
└── StrictMode
    └── MotionPreferenceProvider       (top-level)
        └── ScrollProvider             (top-level)
            └── router                 (BrowserRouter)
                └── AnimatedRoutes     (plain <Routes>)
                    └── LanguageProvider
                        └── <Routes>…</Routes>
```

---

## Quick Commands

```bash
npm run dev          # Vite dev server (port 3000, host 0.0.0.0)
npm run build        # Production build (~6-12s)
npm run preview      # Preview production build
npm run lint         # tsc --noEmit — MUST pass before completing any stage
npm run clean        # Remove dist/
npm run hooks:install # Install pre-commit hook
npm run hooks:check   # Run hook check across working tree
```

---

## Documentation

All documentation lives in [`docs/`](docs/INDEX.md):

| Area | Path |
|------|------|
| **Entry point** | [`docs/INDEX.md`](docs/INDEX.md) |
| **Agent quick-start** | [`docs/AGENTS.md`](docs/AGENTS.md) |
| **Product** | [`docs/product/`](docs/product/) |
| **Design System** | [`docs/design-system/`](docs/design-system/) |
| **Engineering** | [`docs/engineering/`](docs/engineering/) |
| **Animations** | [`docs/animations/README.md`](docs/animations/README.md) |
| **QA** | [`docs/qa/`](docs/qa/) |
| **Agent Orchestration** | [`docs/engineering/agent-brief.md`](docs/engineering/agent-brief.md) |
| **Key Files** | [`docs/engineering/key-files.md`](docs/engineering/key-files.md) |
| **Rules** | [`docs/engineering/rules.md`](docs/engineering/rules.md) |

---

## Naming Conventions

- Logic/config files: `kebab-case.ts`
- React components: `PascalCase.tsx`
- Custom hooks: `use` prefix + `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Booleans: `is`, `has`, `should`, `can` prefix

---

## Design Identity

- Brutalist aesthetic, high-contrast
- Single-column home; left/right split only on project pages (desktop)
- Typography: bold statements — no generic defaults
- Motion: purposeful — reveal hierarchy, one memorable moment
- **Language:** Italian primary for communication, English for code + technical docs
- **Voice:** brutalist, minimalist, high-impact, direct — no decorative symbols (Zero-Icon Policy)

---

*Version 3.0 — Documentation rewritten to match actual code (entrypoint chain, providers, routes) | 2026-09-03*
