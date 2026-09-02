# AGENTS.md

> Entry point for AI agents working on the Antonio Salvatore Calò portfolio.
> Full documentation in [`docs/INDEX.md`](docs/INDEX.md).
> Owner: All Teams

---

## Quick Start

```bash
npm run dev        # Vite dev server on port 3000
npm run build      # Production build (~6-12s)
npm run lint       # tsc --noEmit (typecheck only — MUST pass before completing work)
npm run preview    # Preview production build
npm run clean      # Remove dist/
```

Playwright E2E tests run against the preview server after a production build:

```bash
npm run build && npm run preview & npx playwright test
```

---

## 6 Critical Rules — Violating These Breaks the App

1. **Hooks**: Never call `useTransform`/`useScroll`/`useSpring` conditionally — they must be top-level in the component body
2. **GSAP**: Never use `!important` on CSS properties that GSAP animates (opacity, transform, etc.) — GSAP cannot override `!important`
3. **Lenis**: Never create a global Lenis instance — use `useSmoothScroll` hook per-column only
4. **Carousel**: Never use `motion.div` with `drag="x"` — pointer events + GSAP tweens only (`power3.out`, momentum tracking, 20% drag threshold)
5. **Router**: Never use `createBrowserRouter` — `BrowserRouter` + `AnimatePresence` only
6. **Visibility**: Never hardcode `visibility:hidden` — let `AnimatePresence` handle transitions

> **Full details:** See [`docs/engineering/rules.md`](docs/engineering/rules.md) for the complete z-index system, styling conventions, naming rules, and known technical debt.

---

## Architecture Summary

**Dual-column layout**: Left (30%) = About, Right (70%) = Work. Each column has its own Lenis smooth-scroll instance via `useSmoothScroll`. `ScrollProvider` only holds refs and desktop/mobile state — no scroll logic.

**Entrypoint chain**: `main.tsx` → `initGSAP()` → `ScrollProvider` → `App` (preloader) → `PortfolioLayout`

**Routing**: `BrowserRouter` + `AnimatePresence mode="wait"` wraps all `<Routes>`. Each route is a `motion.div` keyed by pathname. Home: fade 0.25s. Project pages: fade 0.25s.

**Preloader**: `MIN_DURATION_MS = 3200`. `isFirstLoad` module-level flag — skips hero GSAP on back-navigation (route transition handles reveal instead).

**CSS loading gate**: `html` starts with class `loading` (opacity:0), swapped to `ready` on window load. `.project-card-wrapper` starts at `opacity:0; translateY(40px)` — GSAP reveals them. Do not set these to visible by default or you get a flash.

---

## Before Editing — Impact-Check Protocol

1. Read the target file fully
2. `grep -r "[filename-stem]" src/ --include="*.tsx" --include="*.ts"`
3. If file touches scroll → trace Lenis ref chain (`useSmoothScroll` → column ref)
4. If file touches animation → identify `gsap.context()` scope and what it cleans up
5. If file touches routing → verify AnimatePresence key strategy
6. List every affected component, then edit

---

## Documentation Map

Refer to [`docs/INDEX.md`](docs/INDEX.md) for the full documentation tree.

| Area | Path | What You'll Find |
|------|------|-----------------|
| **Product** | [`docs/product/`](docs/product/) | Vision, brand, users, design principles |
| **Design** | [`docs/design/`](docs/design/) | Design system, colors, typography, components |
| **Engineering** | [`docs/engineering/`](docs/engineering/) | Architecture, rules, stack, key files, agent brief |
| **QA** | [`docs/qa/`](docs/qa/) | Testing strategy, validation pipeline, quality gates |
| **Agent Brief** | [`docs/engineering/agent-brief.md`](docs/engineering/agent-brief.md) | Full orchestrator system, skill routing, agent commands |

---

## graphify

Knowledge graph at `graphify-out/`. Read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure before searching files.
