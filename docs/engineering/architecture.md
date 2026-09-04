# System Architecture

> Complete architectural overview of the Antonio Salvatore Calò portfolio — entrypoints, rendering layers, component contracts, and design philosophy.
> Owner: Engineering

---

## 1. Architectural Philosophy

The system is built on **three independent rendering layers** that communicate through refs, not state:

1. **React** — renders the UI tree (components, context, routing)
2. **GSAP** — owns all animation timelines (scroll-linked, entrance, route transitions)
3. **Lenis** — controls scroll interpolation per layout

These layers are intentionally decoupled. React never drives animation state. GSAP never manages layout. Lenis never owns rendering logic. They coordinate through refs and the GSAP ticker bridge.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Ref-Driven Components** | All renderable primitives expose DOM visibility through `forwardRef`. No animation system depends on implicit tree traversal. |
| **Interaction Decoupling** | Motion systems remain decoupled from application state. Mutable state stored through refs rather than render-triggering updates. |
| **Centralized Animation Control** | Animation triggers declared structurally through data attributes, not inline logic. |
| **Scroll Isolation** | Each layout that needs scroll owns its own Lenis instance. Cross-container coordination through provider-managed refs only. |
| **Constraint-Based Interface** | Visual hierarchy established through typography, spacing, motion cadence, and contrast — never decorative effects. |
| **Local Providers** | `LanguageProvider` is the only top-level provider. `MotionPreferenceProvider`, `ScrollProvider`, `ThemeProvider`, and `FilterProvider` live at the page/layout that needs them. |

---

## 2. Entrypoint Chain

```
index.html
└── main.tsx (StrictMode)
    └── LanguageProvider                    (only top-level provider)
        └── BrowserRouter
            └── AnimatedRoutes (AnimatePresence)
                ├── "/" → App → PortfolioLayout (lazy)
                │     ├── SiteHeader
                │     ├── ProjectIndex
                │     │     └── ProjectGrid
                │     │           ├── ProjectGallery
                │     │           ├── ProjectListRow
                │     │           ├── ProjectLeftTextReveal
                │     │           └── RollingText
                │     └── FilterProvider (local)
                ├── "/projects/bugonia"            → BugoniaPage
                ├── "/projects/bugonia/credits"    → BugoniaPage (credits)
                ├── "/projects/newsquest"          → NewsquestPage
                ├── "/projects/newsquest/credits"  → NewsquestPage (credits)
                └── "/contact"                     → ContactPage
                      └── ContactBuilder
```

### Boot Sequence

1. `index.html` serves the minimal shell with font preloading.
2. `main.tsx` mounts React under StrictMode and wraps the tree in `LanguageProvider`.
3. `BrowserRouter` with `AnimatedRoutes` resolves the current route.
4. The route component mounts — `PortfolioLayout` for `/`, the per-project page for project routes, `ContactPage` for `/contact`.
5. `PortfolioLayout` mounts `SiteHeader`, `FilterProvider`, and `ProjectIndex` → `ProjectGrid`.
6. `ProjectBrutalistLayout` (for project pages) sets up `MotionPreferenceProvider`, `ScrollProvider`, `ThemeProvider`, and a layout-local Lenis instance on the right column.
7. `window.load` fires → `ScrollTrigger.refresh()` calibrates positions.

---

## 3. Rendering Layers

| Layer | Owner | Responsibility |
|-------|-------|---------------|
| Application Root | `main.tsx` | `LanguageProvider` + StrictMode bootstrapping |
| Route Layer | `AnimatePresence` + `motion.div` | Transition lifecycle management per route |
| Motion Preference | `MotionPreferenceProvider` | Reads OS reduced-motion setting, sets `data-motion` attribute |
| Scroll Context | `ScrollProvider` | Holds refs and responsive state — no scroll logic |
| Scroll Containers | Layout-local Lenis | Independent Lenis lifecycle ownership where needed |
| Motion Layer | GSAP contexts | Timeline coordination, ScrollTrigger synchronization |
| Typography Layer | GSAP blur + translateY | Word-level reveal sequencing |
| UI Layer | `SiteHeader`, `ProjectGallery`, `ProjectListRow`, `ProjectSection`, `ContactBuilder`, etc. | Editorial composition |

---

## 4. Component Contracts

### forwardRef Convention

All renderable primitives expose DOM nodes through `forwardRef`. This enables:

- GSAP to target elements directly without query selectors.
- ScrollTrigger to use scoped containers.
- Parent components to access child DOM for measurements.

### Data Attribute-Driven Animation

Animation triggers are declared through data attributes, not imperative calls:

| Attribute | Purpose | Used By |
|-----------|---------|---------|
| `data-split` | Word-split text reveal | `ProjectBrutalistLayout` GSAP context |
| `data-fade` | Blur-fade reveal on scroll | `ProjectBrutalistLayout` GSAP context |
| `data-cta` | Delayed CTA appearance | `ProjectBrutalistLayout` GSAP context |
| `data-stagger` / `data-stagger-medium` / `data-stagger-shallow` | CSS-based stagger animations | Section content |
| `data-project-stack` | Project page media stack reveal | `ProjectSection` |
| `data-section-reveal="paragraph"` | Section paragraph reveal | `ProjectBrutalistLayout` |
| `data-entrance-item` / `data-entrance-skip` | Entrance reveal system | `useEntranceReveal` hook |
| `data-media-col` | Media column within split stacks | Project page layout |
| `data-scroll-sentinel` | Sentinel for scroll position tracking | Project page credits |

### Three-Tier Responsive

The system uses a three-tier responsive model:

- **Mobile**: `<768px` — single-column, native scroll.
- **Tablet**: `768–1024px` — single-column, native scroll (shares mobile behavior).
- **Desktop**: `>=1024px` — desktop layout with Lenis on the right column of project pages.

`ProjectBrutalistLayout` handles mobile via tab switching; `SiteHeader` adapts.

---

## 5. System Invariants

These invariants are enforced across the architecture and should never be violated:

- **No global Lenis** — `ScrollProvider` holds refs only; layouts wire Lenis locally.
- **Single GSAP plugin registration** — `gsap-setup.ts` is the canonical source, called once.
- **No `!important` on animated properties** — GSAP cannot override `!important`.
- **No `visibility:hidden`** — let `AnimatePresence` handle transitions.
- **No `createBrowserRouter`** — use `BrowserRouter` + `AnimatePresence`.
- **No hooks inside GSAP callbacks** — all hook invocations happen only during render/useEffect.
- **No hooks inside MutationObserver callbacks** — hooks called only during component lifecycle.
- **No hooks inside `setTimeout` / `requestAnimationFrame`** — same reason.
- **will-change is temporary** — cleared after animation completes to reduce memory pressure.
- **Only `LanguageProvider` is global** — every other provider lives where it is used.

---

## 6. Key Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.x | UI rendering, concurrent features |
| React Router | 7.x | Client-side routing with AnimatePresence |
| Motion | 12.x | Gesture/spring primitives, AnimatePresence transitions |
| GSAP | 3.x | Timeline orchestration, ScrollTrigger |
| Lenis | 1.x | Smooth scroll interpolation |
| Tailwind CSS | 4.x | Tokenized styling with Vite plugin |
| Vite | 6.x | Native ESM dev server and bundler |
| TypeScript | 5.8.x | Type safety, strict mode |

---

## 7. Cross-References

- [Layouts system](layouts.md) — `PortfolioLayout`, `ProjectBrutalistLayout`
- [Routing and pages](routing-and-pages.md) — Route config, transitions, lazy loading
- [State management](state-management.md) — Providers, context, ref patterns
- [Animation system](animation-system.md) — GSAP setup, entrance reveals
- [Scrolling system](scrolling-system.md) — Lenis per-layout, ScrollTrigger synchronization
- [Navigation and theming](navigation-and-theming.md) — `SiteHeader`, `useTheme`
- [Content architecture](content-architecture.md) — Page data, project registry, media
- [Performance and deployment](performance-and-deployment.md) — Bundle splitting, Vercel, CSP
