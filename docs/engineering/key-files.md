# Key Files Reference

> Source-of-truth map for every significant file in the codebase.
> Owner: Engineering

---

## Application Core

| File | Role |
|------|------|
| `src/main.tsx` | Application entry point — initializes GSAP, renders ScrollProvider |
| `src/App.tsx` | Preloader orchestration + `isFirstLoad` detection |

## Layouts

| File | Role |
|------|------|
| `src/layouts/PortfolioLayout.tsx` | Dual-column shell, GSAP reveal orchestration |
| `src/layouts/ProjectBrutalistLayout.tsx` | Project detail pages, own Lenis + ScrollTrigger |

## Providers

| File | Role |
|------|------|
| `src/providers/AppRouter.tsx` | Routes + AnimatePresence |
| `src/providers/ScrollProvider.tsx` | Refs + isDesktop + activeTab (no scroll logic) |

## Hooks

| File | Role |
|------|------|
| `src/hooks/animation/useSmoothScroll.ts` | Per-column Lenis lifecycle, tied to GSAP ticker |

## Libraries & Config

| File | Role |
|------|------|
| `src/lib/gsap-setup.ts` | Plugin registration + deferred ScrollTrigger refresh |
| `src/lib/motion.ts` | Shared easing/spring constants |
| `src/lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |

## Components

| File | Role |
|------|------|
| `src/components/ui/ProjectCard.tsx` | Carousel: pointer events + GSAP drag + momentum |

## Content

| File | Role |
|------|------|
| `src/content/projects.ts` | `projectsRegistry` array — add new projects here |

## Motion System

| File | Role |
|------|------|
| `src/motion/engine/cascadeEngine.ts` | Blur-word cascade engine |
| `src/motion/utils/scrollCascade.ts` | Canonical scroll reveal constants (INITIAL/FINAL) |
| `src/motion/presets/presets.ts` | Animation presets |
| `src/hooks/animation/useScrollReveal.ts` | Primary scroll reveal hook |

## Build & Config

| File | Role |
|------|------|
| `vite.config.ts` | Vite bundler configuration |
| `tsconfig.json` | TypeScript configuration |
| `index.html` | HTML entry point, font preloading |
| `vercel.json` | Deployment configuration |

## Documentation

| File | Role |
|------|------|
| `docs/INDEX.md` | Documentation entry point |
| `docs/product/` | Product documentation |
| `docs/design/` | Design system documentation |
| `docs/engineering/` | Engineering documentation |
| `docs/qa/` | QA & testing documentation |
