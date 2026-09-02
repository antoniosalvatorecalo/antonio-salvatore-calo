# System Architecture

> Complete architectural overview of the Antonio Salvatore Calò portfolio — entrypoints, rendering layers, component contracts, and design philosophy.
> Owner: Engineering

---

## 1. Architectural Philosophy

The system is built on **three independent rendering layers** that communicate through refs, not state:

1. **React** — renders the UI tree (components, context, routing)
2. **GSAP** — owns all animation timelines (scroll-linked, entrance, route transitions)
3. **Lenis** — controls scroll interpolation per-column

These layers are intentionally decoupled. React never drives animation state. GSAP never manages layout. Lenis never owns rendering logic. They coordinate through refs and the GSAP ticker bridge.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Ref-Driven Components** | All renderable primitives expose DOM visibility through `forwardRef`. No animation system depends on implicit tree traversal. |
| **Interaction Decoupling** | Motion systems remain decoupled from application state. Mutable state stored through refs rather than render-triggering updates. |
| **Centralized Animation Control** | Animation triggers declared structurally through data attributes, not inline logic. |
| **Scroll Isolation** | Each column owns independent Lenis state, velocity calculation, refresh lifecycle, and interpolation timing. Cross-container synchronization through provider-managed refs only. |
| **Constraint-Based Interface** | Visual hierarchy established through typography, spacing, motion cadence, and contrast — never decorative effects. |

---

## 2. Entrypoint Chain

```
index.html
└── main.tsx (StrictMode)
    ├── MotionPreferenceProvider
    │   └── ScrollProvider
    │       └── BrowserRouter
    │           └── AnimatedRoutes (AnimatePresence)
    │               ├── Route "/" → App
    │               │   ├── Preloader (AnimatePresence, 3200ms min)
    │               │   └── PortfolioLayout
    │               │       ├── AnimationProvider
    │               │       ├── CentralNavMenu (desktop only)
    │               │       ├── Left Column (About sections)
    │               │       │   ├── useSmoothScroll
    │               │       │   ├── AboutHero
    │               │       │   ├── AboutBio
    │               │       │   ├── AboutPrinciples
    │               │       │   ├── AboutServices
    │               │       │   └── AboutContact
    │               │       ├── Right Column (Project cards)
    │               │       │   ├── useSmoothScroll
    │               │       │   └── ProjectCard × N
    │               │       ├── MobileBottomNav (mobile/tablet only)
    │               │       └── BackToTop
    │               ├── Route "/work" → WorkPage
    │               ├── Route "/projects/:id" → ProjectPage
    │               └── Route "/contact" → ContactPage
    └── Load event → html.loading → html.ready
```

### Boot Sequence

1. `index.html` serves minimal shell with font preloading
2. `main.tsx` mounts React under StrictMode, adds `loading` class to `<html>`
3. `MotionPreferenceProvider` reads `prefers-reduced-motion` and sets `data-motion` attribute
4. `ScrollProvider` initializes responsive state and refs
5. `BrowserRouter` with `AnimatedRoutes` wraps the app
6. `App` manages preloader lifecycle:
   - First load: `Preloader` renders for `MIN_DURATION_MS = 3200ms`, then calls `handlePreloaderComplete`
   - Back-navigation: `isFirstLoad` flag skips preloader
7. After preloader: `PortfolioLayout` mounts and initializes per-column Lenis instances
8. `window.load` event fires → `html.loading` → `html.ready` (opacity transition)
9. On `load`, GSAP ScrollTrigger refreshes and .scroll-content becomes available

---

## 3. Rendering Layers

| Layer | Owner | Responsibility |
|-------|-------|---------------|
| Application Root | `main.tsx` | Provider initialization, StrictMode bootstrapping |
| Motion Preference | `MotionPreferenceProvider` | Reads OS reduced-motion setting, sets `data-motion` attribute |
| Scroll Context | `ScrollProvider` | Holds refs, responsive state, activeTab — no scroll logic |
| Scroll Containers | `useSmoothScroll` + Lenis | Independent Lenis lifecycle ownership per column |
| Motion Layer | GSAP contexts | Timeline coordination, ScrollTrigger synchronization |
| Route Layer | `AnimatePresence` + `motion.div` | Transition lifecycle management per route |
| Animation Orchestrator | `AnimationProvider` + `orchestrator.ts` | Deterministic section cascade (idle → visible → playing → done) |
| Interaction Layer | Motion spring transforms | Pointer-responsive transform interpolation |
| Typography Layer | SplitType-style manual splitting | Word-level segmentation and reveal sequencing |
| Effects Layer | Categorized primitives | Text, interaction, decorative animation components |

---

## 4. Component Contracts

### forwardRef Convention

All renderable primitives expose DOM nodes through `forwardRef`. This enables:
- GSAP to target elements directly without query selectors
- ScrollTrigger to use scoped containers
- Parent components to access child DOM for measurements

### Data Attribute-Driven Animation

Animation triggers are declared through data attributes, not imperative calls:

| Attribute | Purpose | Used By |
|-----------|---------|---------|
| `data-section` | Section identity for orchestrator | `AnimationProvider` → ScrollTrigger |
| `data-split` | Word-split text reveal | `ProjectBrutalistLayout` GSAP context |
| `data-fade` | Blur-fade reveal on scroll | `ProjectBrutalistLayout` GSAP context |
| `data-cta` | Delayed CTA appearance | `ProjectBrutalistLayout` GSAP context |
| `data-reveal="title/paragraph/cta"` | Legacy reveal system | Deprecated — prefers `data-split`/`data-fade` |
| `data-stagger` / `data-stagger-medium` / `data-stagger-shallow` | CSS-based stagger animations | Left column about sections |
| `data-project-stack` | Project page media stack reveal | `LayoutSplitTextMediaStack` |
| `data-section-reveal="paragraph"` | Section paragraph reveal | ProjectBrutalistLayout |
| `data-entrance-item` / `data-entrance-skip` | Entrance reveal system | `useEntranceReveal` hook |
| `data-media-col` | Media column within split stacks | Project page layout |
| `data-scroll-sentinel` | Sentinel for scroll position tracking | Project page credits |

### isDesktop and Three-Tier Responsive

The system uses a three-tier responsive model:
- **Mobile**: `<768px` — single-column, tab navigation, swipe gestures
- **Tablet**: `768–1024px` — single-column, tab navigation, swipe gestures (shares mobile behavior)
- **Desktop**: `>=1024px` — dual-column, no tabs, scroll-linked sections

The `isDesktop` breakpoint was **redefined from >=768px to >=1024px**. Tablet now shares single-column behavior with mobile.

---

## 5. System Invariants

These invariants are enforced across the architecture and should never be violated:

- **No global Lenis** — each column owns its own instance via `useSmoothScroll`
- **ScrollProvider holds refs only** — no scroll logic, no Lenis instances
- **Single GSAP plugin registration** — `gsap-setup.ts` is the canonical source, called once
- **No `!important` on animated properties** — GSAP cannot override `!important`
- **No `visibility:hidden`** — let `AnimatePresence` handle transitions
- **No `createBrowserRouter`** — use `BrowserRouter` + `AnimatePresence`
- **No `motion.div drag="x"`** — carousel uses pointer events + GSAP tweens only
- **No hooks inside GSAP callbacks** — all hook invocations happen only during render/useEffect
- **No hooks inside MutationObserver callbacks** — hooks called only during component lifecycle
- **will-change is temporary** — cleared after animation completes to reduce memory pressure

---

## 6. Key Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.x | UI rendering, concurrent features |
| React Router | 7.x | Client-side routing with AnimatePresence |
| Motion | 12.x | gesture/spring primitives, AnimatePresence transitions |
| GSAP | 3.x | Timeline orchestration, ScrollTrigger |
| Lenis | 1.x | Smooth scroll interpolation |
| SplitType | 0.3.x | Text segmentation (for future use) |
| Tailwind CSS | 4.x | Utility-first styling with Vite plugin |
| Vite | 6.x | Native ESM dev server and bundler |
| TypeScript | 5.8.x | Type safety, strict mode |
| Playwright | 1.59.x | E2E browser testing |

---

## 7. Cross-References

- [Layouts system](layouts.md) — PortfolioLayout, ProjectBrutalistLayout, ScrollerContext
- [Routing and pages](routing-and-pages.md) — Route config, transitions, lazy loading
- [State management](state-management.md) — Providers, context, ref patterns
- [Animation system](animation-system.md) — GSAP setup, orchestrator, entrance reveals
- [Scrolling system](scrolling-system.md) — Lenis per-column, ScrollTrigger, synchronization
- [Navigation and theming](navigation-and-theming.md) — Menus, swipe, dark/light mode
- [Content architecture](content-architecture.md) — Page data, project registry, media
- [Performance and deployment](performance-and-deployment.md) — Bundle splitting, Vercel, CSP
