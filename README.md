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

Animation is treated as rendering infrastructure rather than decorative enhancement. GSAP timelines coordinate spatial continuity, typographic sequencing, and route transitions through context-scoped coordination layers.

Motion primitives remain isolated from layout computation. Scroll interpolation is delegated to dedicated Lenis containers to preserve timing consistency and prevent cross-container interference.

### Dual-Pane Spatial Composition

The interface operates as two independent rendering surfaces:

- Profile surface (30%)
- Work surface (70%)

Each surface maintains isolated scroll state, synchronized only through shared provider context. Layout redistribution occurs through flex-basis interpolation with inverse-scale compensation to preserve perceptual continuity during expansion states.

### Typography System

Typography functions as a navigational layer. Scale progression follows Minor Third modular ratios while reveal sequencing is driven through SplitType segmentation pipelines and clip-path masking systems.

Opacity-based transitions are intentionally avoided to maintain edge definition and perceived density during motion states.

---

## Directory Structure

```
src/
├── main.tsx
├── App.tsx
└── index.css
│
├── pages/                  # Page-level composition
│   ├── about/
│   ├── work/
│   │   └── views/         # FeaturedProjectsView, GridProjectsView
│   ├── projects/
│   │   ├── bugonia/
│   │   └── newsquest/
│   └── contact/
│
├── components/
│   ├── effects/            # Animation effects (categorized)
│   │   ├── text/           # BlurText, RevealText, RevealParagraph, AwwwardsText
│   │   ├── interaction/    # MagneticButton
│   │   ├── decorative/     # ConcentricRings, CurvedLoop
│   │   ├── loaders/        # Preloader
│   │   ├── layout/         # AnimatedSectionHeader, SectionHeader, RevealLabel
│   │   └── index.ts        # Root barrel export
│   ├── ui/                 # Atomic primitives (Button, Card, Link, Icon)
│   ├── navigation/          # SidebarMenu, CentralNavMenu, MobileBottomNav
│   ├── layout/             # FullwidthSection, GridContainer
│   └── shared/             # ErrorBoundary, LinkComponent
│
├── hooks/                  # Custom hooks (categorized)
│   ├── animation/          # useScrollReveal, useSmoothScroll, useTextReveal...
│   ├── navigation/         # useSwipeNavigation
│   └── theme/              # useTheme
│
├── motion/                  # Centralized motion system
│   ├── engine/              # cascadeEngine
│   ├── presets/             # Animation presets
│   ├── constants/           # Easing, types
│   └── utils/               # scrollCascade, titleCascadeRegistry
│
├── lib/
│   ├── gsap-setup.ts       # GSAP + ScrollTrigger registration (SINGLE canonical source)
│   ├── lenis-manager.ts    # Lenis initialization
│   └── utils.ts            # Utility helpers
│
├── content/                # Editorial data
│   ├── projects.ts         # Project metadata + narratives
│   ├── contact.ts
│   ├── about/
│   └── navigation/
│
├── layouts/
│   ├── PortfolioLayout.tsx
│   └── ProjectBrutalistLayout.tsx
│
├── providers/
│   ├── AppRouter.tsx       # BrowserRouter + AnimatePresence
│   └── ScrollProvider.tsx
│
├── styles/
│   └── hover.css
│
└── types/
    └── lodash.d.ts
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| `pages/` over `features/` | Explicit page ownership — clearer navigation |
| `effects/text/`, `effects/interaction/`... | Organized by animation type — faster findability |
| `hooks/animation/`, `hooks/navigation/` | Hooks categorized by domain |
| `motion/` centralized | Single source of truth for animation engine |
| `lib/gsap-setup.ts` canonical | One ScrollTrigger registration point — no duplicates |
| `content/` over `data/` | Editorial content, not raw data |

---

## Architecture Overview

```
main.tsx
└── Initialization
    ├── GSAP Registry (gsap-setup.ts — single canonical source)
    ├── ScrollTrigger Configuration
    └── ScrollProvider
         └── PortfolioLayout
              ├── Profile Surface
              │    ├── Hero (AboutHero)
              │    ├── Biography (AboutBio)
              │    ├── Principles (AboutPrinciples)
              │    └── Contact (AboutContact)
              │
              └── Work Surface
                   ├── Project Index (WorkPage)
                   │    ├── FeaturedProjectsView
                   │    └── GridProjectsView
                   ├── Project Detail (ProjectPage)
                   └── Interaction Layers
```

### Rendering Layers

| Layer | Responsibility |
|-------|----------------|
| Application Root | Provider initialization and orchestration bootstrapping |
| Scroll Containers | Independent Lenis lifecycle ownership |
| Motion Layer | Timeline coordination and ScrollTrigger synchronization |
| Route Layer | Transition lifecycle management |
| Interaction Layer | Pointer-responsive transform interpolation |
| Typography Layer | Segmentation and reveal sequencing |
| Effects Layer | Categorized animation primitives (text, interaction, decorative) |

### Component Contracts

All renderable primitives expose `forwardRef` interfaces. Imperative animation ownership remains externalized from component internals to preserve coordination composability and predictable teardown behavior.

---

## Motion System

### GSAP Orchestration

A **centralized GSAP registry** in `lib/gsap-setup.ts` initializes ScrollTrigger **once** at boot. No other file registers plugins — this prevents duplicate registration errors.

Component timelines operate within isolated `gsap.context()` scopes, guaranteeing cleanup across route transitions and StrictMode cycles.

```
main.tsx → initGSAP() → lib/gsap-setup.ts (registerPlugin ONCE)
                              ↓
         All consumers import from @/lib/gsap-setup
```

### Scroll Synchronization

Each rendering surface maintains an independent Lenis controller instance synchronized through the GSAP ticker bridge.

This architecture enables:

- isolated scroll interpolation,
- deterministic velocity sampling,
- container-specific reveal timing,
- independent refresh cycles.

### Typography Pipeline

Reveal sequencing follows a four-stage pipeline:

1. SplitType segmentation
2. Context collection
3. Clip-path interpolation
4. Render-state finalization

Animated states remain constrained to GPU-accelerated transform paths throughout the reveal lifecycle. Layout-triggering properties are excluded entirely from animated states.

### Motion Architecture

| File | Role |
|------|------|
| `lib/gsap-setup.ts` | Canonical GSAP + ScrollTrigger registration |
| `lib/lenis-manager.ts` | Lenis initialization |
| `motion/engine/cascadeEngine.ts` | Blur-word cascade engine |
| `motion/utils/scrollCascade.ts` | Canonical scroll reveal constants (INITIAL/FINAL) |
| `motion/presets/presets.ts` | Animation presets |
| `hooks/animation/useScrollReveal.ts` | Primary scroll reveal hook |
| `hooks/animation/useSmoothScroll.ts` | Lenis + GSAP ticker bridge |

### Route Transitions

Route transitions operate through keyed `motion.div` boundaries coordinated by `AnimatePresence`.

Timing remains compressed:

- fast enough to preserve navigation responsiveness,
- slow enough to maintain spatial continuity.

---

## Effects System

Animation effects are categorized by type for organized findability:

| Category | Components | Description |
|----------|-----------|-------------|
| `text/` | BlurText, RevealText, RevealParagraph, AwwwardsText | Text reveal and transformation effects |
| `interaction/` | MagneticButton | Cursor-following interactive elements |
| `decorative/` | ConcentricRings, CurvedLoop | Background motion and decorative loops |
| `loaders/` | Preloader | Page load and transition animations |
| `layout/` | AnimatedSectionHeader, SectionHeader, RevealLabel | Section-level layout effects |

All effects are exported through `components/effects/index.ts` barrel.

---

## Performance Strategy

### Transform Constraints

Animation layers remain constrained to:

- transform
- opacity
- filter

Layout-triggering properties are excluded from interpolation paths.

### Scroll Isolation

Each column owns:

- independent Lenis state,
- isolated velocity calculation,
- dedicated refresh lifecycle,
- autonomous interpolation timing.

Cross-container synchronization occurs exclusively through provider-managed references.

### Concurrent Compatibility

The system is validated against React StrictMode double-invocation semantics.

GSAP contexts:

- self-revert on teardown,
- preserve ref stability,
- avoid duplicate registration.

### Render Finalization

`will-change` allocation remains temporary.

Motion layers release GPU promotion hints after completion to reduce long-session memory pressure.

### Initial Hydration

Initial rendering is delayed through a minimum-duration preloader (3200ms) to stabilize:

- asset hydration,
- font metrics,
- initial layout measurements,
- ScrollTrigger calibration.

---

## Technology Stack

| Technology | Responsibility |
|------------|----------------|
| React 19 | Concurrent rendering and state batching |
| TypeScript | Strict boundary enforcement |
| GSAP + ScrollTrigger | Timeline orchestration and scroll synchronization |
| Motion | Gesture and transform primitives |
| Lenis | Scroll interpolation |
| Tailwind CSS v4 | Tokenized styling system |
| Vite | Native ESM development pipeline |
| Playwright | End-to-end validation |

---

## Engineering Principles

### Predictable Systems

Rendering order, animation sequencing, and scroll behavior remain predictable across viewport states and render cycles.

### Ref-Driven Components

All renderable primitives expose DOM visibility through `forwardRef`. No animation system depends on implicit tree traversal.

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
npm run dev         # Vite dev server (port 3000)
npm run lint        # TypeScript check (blocks deployment)
npm run build       # Production bundle
npm run preview     # Local preview
npm run clean       # Remove dist/
```

### Validation Pipeline

```bash
npm run build && npm run preview & npx playwright test
```

---

## System Status

| Layer | State | Verification |
|-------|-------|--------------|
| Core Architecture | Stable | Dual-pane, per-column Lenis verified |
| Motion System | Hardened | GSAP contexts isolated, single registration canonical |
| Typography System | Verified | Fluid scaling, reveal sequencing live |
| Effects System | Organized | Categorized, barrel exports, no duplicates |
| Test Suite | Verified | Playwright tests passing |
| Deployment Layer | Operational | Production deployment active on Vercel |
