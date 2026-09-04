# Key Files Reference

> Source-of-truth map for every significant file in the codebase.
> Owner: Engineering

---

## Application Core

| File | Role |
|------|------|
| `src/main.tsx` | Application entry point — wraps tree in `LanguageProvider`, mounts router |
| `src/App.tsx` | Routes home (`/`) through `PortfolioLayout` |

## Layouts

| File | Role |
|------|------|
| `src/layouts/PortfolioLayout.tsx` | Single-column home shell, owns Lenis instance, hosts `SiteHeader` + `FilterProvider` |
| `src/layouts/ProjectBrutalistLayout.tsx` | Project detail pages, split left/right, owns right-column Lenis + ScrollTrigger |

## Providers

| File | Role |
|------|------|
| `src/providers/AppRouter.tsx` | Routes + `AnimatePresence` |
| `src/providers/LanguageProvider.tsx` | Only top-level provider — language toggle context |
| `src/providers/ScrollProvider.tsx` | Refs + `isDesktop` + `activeTab` (no scroll logic) |
| `src/providers/ThemeProvider.tsx` | localStorage + OS fallback, sets `data-theme` |
| `src/providers/MotionPreferenceProvider.tsx` | Reads `prefers-reduced-motion`, sets `data-motion` attribute |
| `src/providers/FilterProvider.tsx` | Home gallery filter state (local to `PortfolioLayout`) |

## Hooks

| File | Role |
|------|------|
| `src/hooks/useItalyTime.ts` | Italian-time clock used by `SiteHeader` |
| `src/hooks/usePressedState.ts` | Pressed-state primitive used by interactive elements |
| `src/hooks/useTheme.ts` | Theme toggle context (read/write) |
| `src/hooks/useSwipeNavigation.ts` | Pointer-event swipe detection for project pages |
| `src/hooks/useEntranceReveal.ts` | Generic scroll-reveal (blur + translateY) |
| `src/hooks/useProjectTextScroll.ts` | Project page text/image section index tracking |

## Libraries & Config

| File | Role |
|------|------|
| `src/lib/gsap-setup.ts` | Plugin registration + multi-stage `ScrollTrigger.refresh()` |
| `src/lib/reduced-motion.ts` | `runOrSetFinal` helper + reduced-motion utilities |
| `src/lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |

## Components

### Home

| File | Role |
|------|------|
| `src/components/home/ProjectIndex.tsx` | Home gallery index — composes `ProjectGrid` |
| `src/components/home/ProjectGrid.tsx` | Gallery grid — composes individual project rows/cards |

### UI Primitives

| File | Role |
|------|------|
| `src/components/ui/SiteHeader.tsx` | Global header — logo, nav links, language toggle, theme toggle |
| `src/components/ui/ContactBuilder.tsx` | Sentence-builder form on `/contact` |
| `src/components/ui/ProjectCreditsSection.tsx` | Project credits / acknowledgments block |
| `src/components/ui/ProjectGallery.tsx` | Image/video gallery (used in project pages and home) |
| `src/components/ui/ProjectLeftTextReveal.tsx` | Left-column text reveal paired with right-column media |
| `src/components/ui/ProjectListRow.tsx` | Compact project row in the home gallery |
| `src/components/ui/ProjectSection.tsx` | Project page section block (text + media) |
| `src/components/ui/RollingText.tsx` | Animated rolling text primitive |
| `src/components/ui/ScrollingProjectText.tsx` | Left-column text synced to right-column scroll |
| `src/components/ui/letter-swap/` | `LetterSwapForward`, `LetterSwapBlock` — letter-level swap animations |
| `src/components/ui/ArrowIcon.tsx` | Reusable arrow icon with hover rotation |

## Content

| File | Role |
|------|------|
| `src/content/projects.ts` | `projects` array — add new projects here |
| `src/content/workProjectExtras.ts` | Long-form editorial copy per project |
| `src/content/projectImageMetadata.ts` | Image metadata (alt, captions, aspect ratios) |
| `src/content/projectDetails/` | Per-project detail modules |
| `src/content/contact.ts` | Contact form prompt config |

## Motion System

| File | Role |
|------|------|
| `src/motion/constants/types.ts` | Shared motion type definitions |
| `src/motion/constants/easing.ts` | Easing + spring constants (EASE_PREMIUM, SPRING_SNAPPY, …) |
| `src/motion/constants/index.ts` | Barrel export |
| `src/motion/utils/scrollCascade.ts` | Canonical scroll reveal constants (INITIAL/FINAL) |

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
| `docs/design-system/` | Design system documentation |
| `docs/engineering/` | Engineering documentation |
| `docs/animations/` | Animation architecture |
| `docs/qa/` | QA & testing documentation |
