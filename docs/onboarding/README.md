# Onboarding Guide

> New developer entry point. Start here.
> Owner: Engineering

---

## Quick Links

| Guide | What It Covers |
|-------|----------------|
| [Setup](setup.md) | Clone, install, dev server, build, preview |
| [Coding Standards](coding-standards.md) | TS patterns, naming, components, CSS, hooks |
| [Workflow](workflow.md) | Git, commits, PRs, deploy, quality gates |

### Must Read First

- [`README.md`](../../README.md) — Project overview, architecture philosophy
- [`AGENTS.md`](../../AGENTS.md) — 6 critical rules, impact-check protocol
- [`docs/engineering/rules.md`](../engineering/rules.md) — Z-index, styling, known debt

---

## Project DNA

| Attribute | Value |
|-----------|-------|
| Framework | React 19 + TypeScript strict |
| Build | Vite 6 |
| Styling | Tailwind v4 + CSS custom properties |
| Animation | GSAP 3 + Motion 12 |
| Scroll | Lenis (per-column, desktop only) |
| Router | BrowserRouter + AnimatePresence |
| Tests | Playwright E2E |
| Deploy | Vercel (auto) |

### Architecture in 30s

Dual-column layout. Left = About (30%), Right = Work (70%). Each column owns its own Lenis smooth-scroll instance. GSAP handles all animation via `gsap.context()`. React owns rendering and routing only. No animation state in React state — refs and data attributes only.

---

## First Steps

1. Follow [Setup](setup.md) to get running
2. Read [Coding Standards](coding-standards.md) before writing code
3. Read [Workflow](workflow.md) before opening a PR
4. Run `npm run lint` before every commit
5. Run `npm run build` before pushing

---

## Cross-References

- [Architecture](../engineering/architecture.md) — Full system design
- [Animation System](../engineering/animation-system.md) — GSAP, orchestrator, reveals
- [Scrolling System](../engineering/scrolling-system.md) — Lenis per-column
- [Routing & Pages](../engineering/routing-and-pages.md) — Route config, transitions
- [Performance & Deployment](../engineering/performance-and-deployment.md) — Bundle, Vercel
- [QA & Testing](../qa/README.md) — Validation pipeline, Playwright
