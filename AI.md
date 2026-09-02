# AI.md — Antonio Salvatore Calò — Portfolio Agent Instructions

> Master brain for the Antonio Salvatore Calò portfolio. Read on every session start.
> Owner: Antonio Salvatore (Salvo) — Web & UI Designer
>
> **Documentation has moved to [`docs/`](docs/INDEX.md).**
> This file is the concise orchestrator config. Full reference at `/docs/engineering/agent-brief.md`.

---

## Session Start Protocol

**Execute on every session start (in order):**

1. Read `Maximum Effort/Maximum Effort/index.md` → load knowledge context
2. Read `.planning/STATE.md` → detect GSD phase + active milestone
3. Read `.claude/memory/MEMORY.md` → load persistent feedback + decisions

**After significant work:** Append to `Maximum Effort/Maximum Effort/log.md` using format:
```
## [YYYY-MM-DD] [operation] | [description]
```

---

## 6 Critical Rules — NEVER VIOLATE

```
1. HOOKS:      Never call useTransform/useScroll/useSpring conditionally
2. GSAP:       Never use !important on CSS properties GSAP animates
3. LENIS:      Never create global Lenis — useSmoothScroll per-column only
4. CAROUSEL:   Never use motion.div with drag="x" — pointer events + GSAP only
5. ROUTER:     Never use createBrowserRouter — BrowserRouter + AnimatePresence only
6. VISIBILITY: Never hard visibility:hidden — let AnimatePresence handle transitions
```

---

## Architecture

### Layout
- Dual-column: `w-[calc(30%-8px)]` (left) + `w-[calc(70%-8px)]` (right)
- Equidistant gap: `md:px-4 md:gap-4`
- Full viewport, `overflow: hidden` on html/body (Lenis owns scroll)

### Scroll System
- **NO global Lenis** — per-column instances via `useSmoothScroll`
- `ScrollProvider` provides refs + desktop/mobile state only
- Each column owns its Lenis lifecycle

### Routing
- `BrowserRouter` → flat routes + `AnimatePresence`
- Home: fade in/out `0.25s`
- Project pages: slide up/down `0.5s`
- Keys on `motion.div` for correct AnimatePresence tracking

### Carousel (ProjectCard)
- Pointer events + GSAP tweens — NOT motion.div drag
- `power3.out` easing, momentum tracking (`>500px/s` → next slide)
- 20% drag threshold for snap decision
- GPU-accelerated via `translate3d`

### Preloader
- `MIN_DURATION_MS = 3200`
- `isFirstLoad` detection — skips hero GSAP on back-navigation
- Back-nav: route transition handles reveal

---

## Quick Commands

```bash
npm run dev      # Vite dev server (port 3000)
npm run build    # Production build (~6-12s)
npm run preview  # Preview production build
npm run lint     # tsc --noEmit — MUST pass before completing any stage
npm run clean    # Remove dist/

npx playwright test
npx playwright test --headed
```

---

## Documentation

All documentation lives in [`docs/`](docs/INDEX.md):

| Area | Path |
|------|------|
| **Entry point** | [`docs/INDEX.md`](docs/INDEX.md) |
| **Product** | [`docs/product/`](docs/product/) |
| **Design** | [`docs/design/`](docs/design/) |
| **Engineering** | [`docs/engineering/`](docs/engineering/) |
| **QA** | [`docs/qa/`](docs/qa/) |
| **Agent Orchestration** | [`docs/engineering/agent-brief.md`](docs/engineering/agent-brief.md) |
| **Key Files** | [`docs/engineering/key-files.md`](docs/engineering/key-files.md) |
| **Rules** | [`docs/engineering/rules.md`](docs/engineering/rules.md) |

---

## Technical Debt

| Issue | Location | Priority |
|-------|----------|---------|
| XSS: innerHTML with DOM manipulation | `AboutBio.tsx:28`, `AboutPrinciples.tsx:28` | HIGH |
| Bundle ~606KB (target <700KB) | All chunks | MEDIUM |
| Three.js integration | Roadmap | LOW |

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
- Left column: light theme (white bg, black typography)
- Right column: dark theme
- Typography: bold statements — no generic defaults
- Motion: purposeful — reveal hierarchy, one memorable moment
- **Language:** Italian primary for communication, English for code + technical docs
- **Voice:** brutalist, minimalist, high-impact, direct — no decorative symbols (Zero-Icon Policy)

---

*Version 2.1 — Documentation consolidated into `/docs/` | 2026-06-03*
