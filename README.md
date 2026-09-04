# Antonio Salvatore Calò — Portfolio

Frontend interaction architecture focused on scroll-synchronized motion, spatial composition, and high-density typographic systems.

Built around independent rendering surfaces, deterministic animation pipelines, and gesture-responsive interaction layers.

---

## Repository

- **GitHub:** https://github.com/antoniosalvatorecalo/antonio-salvatore-calo
- **Owner:** Antonio Salvatore Calò
- **Contact:** antonio.salvatore.calo@gmail.com
- **Production deployment:** Vercel (domain to be configured — see Vercel project)

---

## Architecture Philosophy

### Motion as Infrastructure

Animation is treated as rendering infrastructure rather than decorative enhancement. GSAP timelines coordinate spatial continuity, typographic sequencing, and in-page transitions through context-scoped coordination layers. Motion primitives remain isolated from layout computation. Scroll interpolation is delegated to dedicated Lenis containers to preserve timing consistency and prevent cross-container interference.

### Single-Column Portfolio Composition

The home page composes through `PortfolioLayout` → lazy `ProjectIndex` → `ProjectGrid` (the gallery grid). Project pages use `ProjectBrutalistLayout` (split left/right, desktop only — single-column on mobile) for editorial narrative. Contact uses `ContactPage` with the `ContactBuilder` sentence-builder form. There is no dual-column About/Work shell — the left/right split is exclusive to project pages.

### Typography System

Typography functions as a navigational layer. Scale progression follows a fluid `clamp()`-based system. Reveal sequencing is driven through GSAP blur + translateY timelines scoped via data attributes. Opacity-only transitions are intentionally avoided to maintain edge definition and perceived density during motion states.

---

## Directory Structure

```
src/
├── main.tsx                          # Application entry — mounts StrictMode, providers, router
├── App.tsx                           # Home wrapper — lazy-loads PortfolioLayout
├── index.css                         # Global tokens (Tailwind v4 @theme, font-face, CSS vars)
├── styles/hover.css                  # Hover micro-interaction utilities
│
├── pages/                            # Page-level composition (route entry)
│   ├── projects/
│   │   ├── bugonia/ProjectPage.tsx
│   │   └── newsquest/ProjectPage.tsx
│   └── contact/ContactPage.tsx
│
├── components/
│   ├── home/                         # ProjectIndex, ProjectGrid (gallery rendering)
│   ├── projects/                     # ProjectPreview (hover overlay)
│   └── ui/                           # SiteHeader, ContactBuilder, ProjectCreditsSection,
│                                     # ProjectGallery, ProjectLeftTextReveal, ProjectListRow,
│                                     # ProjectSection, RollingText, ScrollingProjectText,
│                                     # letter-swap (LetterSwapForward, LetterSwapBlock), ArrowIcon
│
├── hooks/
│   ├── useItalyTime.ts
│   ├── usePressedState.ts
│   ├── theme/useTheme.ts             # Light/dark toggle (localStorage + data-theme)
│   ├── navigation/useSwipeNavigation.ts
│   ├── animation/
│   │   ├── useEntranceReveal.ts      # Generic scroll reveal (blur + y)
│   │   └── useProjectTextScroll.ts   # Project page text/image section index tracking
│   └── projects/useProjects.ts
│
├── motion/
│   ├── constants/                    # Easing + spring constants (EASE_PREMIUM, SPRING_SNAPPY, …)
│   └── utils/scrollCascade.ts        # Initial/final reveal presets
│
├── lib/
│   ├── gsap-setup.ts                 # Canonical GSAP + ScrollTrigger registration
│   ├── lenis-manager.ts              # Singleton Lenis lifecycle (init/destroy/refresh)
│   ├── reduced-motion.ts             # instantTransition + runOrSetFinal
│   ├── motion-dev-diagnostics.ts     # Development-only logging helpers
│   └── utils.ts                      # cn() (clsx + tailwind-merge)
│
├── content/                          # Editorial data
│   ├── projects.ts                   # Gallery registry (12 items: bugonia, newsquest, +duplicate variants)
│   ├── workProjectExtras.ts
│   ├── projectImageMetadata.ts
│   ├── projectDetails/
│   │   ├── bugoniaDetail.ts
│   │   └── newsquestDetail.ts
│   └── contact.ts
│
├── layouts/
│   ├── PortfolioLayout.tsx           # Home shell — SiteHeader + ProjectIndex + FilterProvider
│   └── ProjectBrutalistLayout.tsx    # Project pages — split left/right desktop, Lenis on right column
│
├── providers/
│   ├── AppRouter.tsx                 # Exports `router` (BrowserRouter + Routes). No AnimatePresence.
│   ├── LanguageProvider.tsx          # EN/IT locale + t(key) function
│   ├── MotionPreferenceProvider.tsx  # OS prefers-reduced-motion + MotionConfig
│   ├── ScrollProvider.tsx            # isDesktop, isTablet, activeTab, left/right refs
│   └── FilterContext.tsx             # Local home filter (all/identity/motion/research/web)
│
├── i18n/translations.ts              # EN/IT translation dictionary
└── types/lodash.d.ts
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| `pages/` over `features/` | Explicit page ownership — clearer navigation |
| `components/home/` + `components/ui/` + `components/projects/` | Home-specific + UI primitives + per-project overlays |
| `motion/constants/` + `motion/utils/` | Pure functions and easing constants, no engine layer |
| `lib/gsap-setup.ts` canonical | One ScrollTrigger registration point — no duplicates |
| `content/` over `data/` | Editorial content, not raw data |
| Providers at layout level | `LanguageProvider` is the only top-level (router-scoped) provider |

---

## Architecture Overview

```
main.tsx (StrictMode)
└── MotionPreferenceProvider          # OS reduced-motion listener + <MotionConfig>
    └── ScrollProvider                # isDesktop, isTablet, refs
        └── router (BrowserRouter)
            └── AnimatedRoutes        # plain <Routes> — no AnimatePresence
                └── LanguageProvider  # top-level (router-scoped) provider
                    └── <Routes>
                        ├── "/"                          → App → lazy PortfolioLayout
                        │                                  ├── SiteHeader
                        │                                  ├── FilterProvider (local)
                        │                                  └── ProjectIndex → ProjectGrid
                        ├── "/projects/bugonia"          → BugoniaPage
                        ├── "/projects/bugonia/credits"  → BugoniaPage (credits tab)
                        ├── "/projects/newsquest"        → NewsquestPage
                        ├── "/projects/newsquest/credits"→ NewsquestPage (credits tab)
                        └── "/contact"                   → ContactPage
                                                              └── ContactBuilder
```

**Mounted providers per route:**

| Route | Providers (in addition to `MotionPreferenceProvider` + `ScrollProvider`) |
|-------|----------------------------------------------------------------------------|
| `/` | `LanguageProvider` (router), `FilterProvider` (inside `PortfolioLayout`) |
| `/projects/:slug` | `LanguageProvider` (router). `useTheme()` and `useReducedMotionPreference()` consumed in `ProjectBrutalistLayout` |
| `/contact` | `LanguageProvider` (router) |

**Important:** There is no `AnimatePresence` wrapping `<Routes>`. Route transitions are not animated at the route level — each page handles its own in-page reveal. `useTheme` is a hook (not a provider); the `SiteHeader` invokes it directly and writes `data-theme` to `<html>`.

### Rendering Layers

| Layer | Responsibility |
|-------|----------------|
| Application Root | `main.tsx` mounts `MotionPreferenceProvider` + `ScrollProvider` + router |
| Router | `BrowserRouter` + `<Routes>` (no AnimatePresence) |
| Provider layer | `LanguageProvider` (router-scoped); `FilterProvider` (local to home) |
| Scroll containers | Lenis lifecycle owned only by `ProjectBrutalistLayout` (right column, desktop) |
| Motion layer | GSAP contexts, `ScrollTrigger`, `gsap.context()` scope cleanup |
| UI layer | `SiteHeader`, `ProjectIndex`, `ContactBuilder`, `ProjectBrutalistLayout` |

### Component Contracts

All renderable primitives that need animation target access expose DOM nodes through `forwardRef` or `useRef`. Imperative animation ownership remains externalized from component internals to preserve coordination composability and predictable teardown behavior.

---

## Motion System

### GSAP Orchestration

A **centralized GSAP registry** in `src/lib/gsap-setup.ts` initializes ScrollTrigger **once** at module load. No other file registers plugins — this prevents duplicate registration errors. The `gsap` and `ScrollTrigger` exports from this module are the only canonical imports used across the codebase.

Component timelines operate within isolated `gsap.context()` scopes, guaranteeing cleanup across route transitions and StrictMode cycles.

### Scroll Synchronization

**`ProjectBrutalistLayout` is the only layout that owns a Lenis instance.** It is initialized in the desktop-only branch via `initLenis(container, content)` from `src/lib/lenis-manager.ts` and destroyed on unmount. The `ScrollProvider` exposes shared scroll context (refs, responsive state) but does not own Lenis itself. `PortfolioLayout` does not initialize Lenis — it only sets `gsap.ticker.lagSmoothing(500, 33)`.

This architecture enables:

- isolated scroll interpolation,
- deterministic velocity sampling,
- container-specific reveal timing,
- independent refresh cycles.

### Motion Architecture

| File | Role |
|------|------|
| `lib/gsap-setup.ts` | Canonical GSAP + ScrollTrigger registration |
| `lib/lenis-manager.ts` | Singleton Lenis lifecycle (init/destroy/refresh) |
| `lib/reduced-motion.ts` | `instantTransition`, `runOrSetFinal` |
| `lib/motion-dev-diagnostics.ts` | Development-only logging helpers |
| `motion/constants/easing.ts` | `EASE_PREMIUM`, `SPRING_SNAPPY`, `SPRING_CURSOR`, `MOTION_MICRO`, `MOTION_SECTION`, `MOTION_PAGE` |
| `motion/utils/scrollCascade.ts` | Initial/final reveal presets |
| `hooks/animation/useEntranceReveal.ts` | Generic scroll-reveal (blur + y) |
| `hooks/animation/useProjectTextScroll.ts` | Project page text/section index tracking |
| `providers/MotionPreferenceProvider.tsx` | OS reduced-motion listener + `useReducedMotionPreference()` + `<MotionConfig>` |

---

## Performance Strategy

### Transform Constraints

Animation layers remain constrained to:

- transform
- opacity
- filter

Layout-triggering properties are excluded from interpolation paths.

### Scroll Isolation

Lenis instances are owned only by `ProjectBrutalistLayout` on desktop. Cross-container synchronization occurs exclusively through provider-managed references.

### Concurrent Compatibility

The system is validated against React StrictMode double-invocation semantics. GSAP contexts:

- self-revert on teardown,
- preserve ref stability,
- avoid duplicate registration.

### Render Finalization

`will-change` allocation remains temporary. Motion layers release GPU promotion hints after completion to reduce long-session memory pressure.

---

## Technology Stack

| Technology | Version | Responsibility |
|------------|---------|----------------|
| React | 19.x | Concurrent rendering and state batching |
| TypeScript | 5.8.x | Strict boundary enforcement |
| GSAP + ScrollTrigger | 3.x | Timeline orchestration and scroll synchronization |
| Motion | 12.x | Gesture, transform, and `<AnimatePresence>` primitives |
| Lenis | 1.x | Smooth scroll interpolation |
| Tailwind CSS | 4.x | Tokenized styling via `@tailwindcss/vite` |
| Vite | 6.x | Native ESM development pipeline |
| React Router | 7.x | Client-side routing |
| Nodemailer | 8.x | Serverless email transport for `/api/contact` |

---

## Engineering Principles

### Predictable Systems

Rendering order, animation sequencing, and scroll behavior remain predictable across viewport states and render cycles.

### Ref-Driven Components

All renderable primitives expose DOM visibility through refs. No animation system depends on implicit tree traversal.

### Interaction Decoupling

Motion systems remain decoupled from application state whenever possible. Mutable state is stored through refs rather than render-triggering updates.

### Centralized Animation Control

Animation triggers are declared structurally through data attributes rather than inline logic.

### Constraint-Based Interface

Visual hierarchy is established through:

- typography,
- spacing,
- motion cadence,
- contrast.

---

## Rendering Constraints

The system intentionally avoids:

- layout-triggering animation paths,
- global scroll ownership,
- opacity-only reveal systems,
- implicit animation targeting,
- unmanaged timeline persistence,
- component-local motion duplication,
- dual registration of GSAP plugins,
- dynamic imports of already-registered plugins.

Rendering behavior remains consistent across route transitions and viewport state changes.

---

## Development Workflow

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server (port 3000, --host 0.0.0.0)
npm run lint         # TypeScript check (tsc --noEmit — blocks deployment)
npm run build        # Production bundle
npm run preview      # Local preview
npm run clean        # Remove dist/
npm run hooks:install # Install pre-commit hook
npm run hooks:check   # Run hook check across working tree
```

---

## API

The contact form posts to `POST /api/contact` (Vercel serverless function at `api/contact.ts`):

```json
{
  "name": "string (required)",
  "projectType": "string (required)",
  "clientType": "string (required)",
  "focus": "string (required)",
  "budget": "string (required)",
  "timeline": "string (required)",
  "email": "string (required, valid email format)"
}
```

The endpoint validates the body, attempts SMTP delivery via Nodemailer, and returns either `{ success: true }` or `{ success: true, fallback: "mailto", mailtoHref: "..." }` if SMTP is unconfigured. The client (`ContactBuilder`) opens the `mailto:` link as a fallback.

Environment variables (server-side only): `CONTACT_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

---

## System Status

| Layer | State | Verification |
|-------|-------|--------------|
| Core Architecture | Stable | Single-column home + split project pages verified |
| Motion System | Hardened | GSAP contexts isolated, single registration canonical |
| Typography System | Verified | Fluid scaling, reveal sequencing live |
| UI Components | Verified | `SiteHeader`, `ContactBuilder`, project pages operational |
| Deployment Layer | Operational | Production deployment active on Vercel |
