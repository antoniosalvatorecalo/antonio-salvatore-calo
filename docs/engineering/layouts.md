# Layouts System

> Single-column portfolio layout, project brutalist layout, and the ScrollerContext.
> Owner: Engineering

---

## 1. Overview

The application has two primary layouts:

| Layout | Route | Structure | Scroll |
|--------|-------|-----------|--------|
| `PortfolioLayout` | `/` (home) | Single-column | Layout-local Lenis |
| `ProjectBrutalistLayout` | `/projects/:slug` | 2-column (20%/80%) | Desktop: Lenis (right col), Mobile: native |

---

## 2. PortfolioLayout

**File:** `src/layouts/PortfolioLayout.tsx`

### Component Hierarchy

```
PortfolioLayout
├── SiteHeader                     (fixed header)
├── FilterProvider (local)          (home filter state)
└── ProjectIndex
    └── ProjectGrid
        ├── ProjectGallery
        ├── ProjectListRow
        ├── ProjectLeftTextReveal
        └── RollingText
```

### Composition

- Single-column scroll. No left/right split.
- Mounts `SiteHeader`, then `ProjectIndex` → `ProjectGrid`.
- `FilterProvider` is mounted inside the layout so the home filter state stays scoped to the home page.
- Wires its own Lenis instance through the GSAP ticker.

### Project Grid Entry Animation

On first load, the home gallery cards perform a 3D entrance animation:

```
Initial state:  opacity: 0, x: 72, y: 126, z: -280, rotateX: 9°, rotateY: -6°, scale: 0.88
Final state:    opacity: 1, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1
```

Each card is staggered by `0.16s`. Sub-elements animate with their own timing curves. On completion, `.project-card-wrapper` gets `.revealed` and `willChange` is cleared.

On reduced motion, cards jump directly to final state.

---

## 3. ProjectBrutalistLayout

**File:** `src/layouts/ProjectBrutalistLayout.tsx`

### Component Hierarchy

```
ProjectBrutalistLayout
└── ScrollerContext.Provider
    ├── SkipToContent (WCAG 2.4.1 — keyboard-only)
    ├── Left Column (20% width)
    │   ├── Hero Text (LetterSwapBlock / LetterSwapForward)
    │   └── ScrollingProjectText / ProjectCreditsSection (desktop)
    │       └── ProjectCreditsSection (mobile credits tab)
    └── Right Column (80% width)
        ├── Desktop: ProjectGallery / ProjectSection × N (scroll-content-inner)
        └── Mobile: ProjectSection × N + ProjectCreditsSection
```

### ScrollerContext

`ProjectBrutalistLayout` provides a `ScrollerContext` to child components:

```typescript
interface ScrollerContextType {
  ref: React.RefObject<HTMLDivElement | null>;
  lenis: Lenis | null;
}
```

On desktop, `ref` points to the right-column scroll container and `lenis` holds the Lenis instance. On mobile, `ref` points to the mobile scroll container and `lenis` is null (native scroll).

This context is consumed by:

- `ScrollingProjectText` — syncs left-column text with right-column scroll position.
- `ProjectSection` — binds scroll reveal to the correct scroller.

### Desktop vs Mobile Content Strategy

The layout renders completely different DOM on desktop vs mobile:

**Desktop** (`isDesktop === true`):

- Left column: `ScrollingProjectText` syncs section text with right-column scroll.
- Right column: Full content (`ProjectGallery`, `ProjectSection` components) inside a Lenis-wrapped scroll container.
- Images appear inline within the text/media stacks.

**Mobile** (`isDesktop === false`):

- Single-column: one column visible at a time (project tab or credits tab).
- Content rendered as vertical blocks via `ProjectSection`.
- Each `ProjectSection` renders: image → title → description → CTA.
- Credits rendered at the end of project column or full-screen in credits tab.
- Uses native scroll — no Lenis.

### Desktop Viewport Division

```
┌──────────────────────────────────────────────┐
│ Left Column (20%)      │ Right Column (80%)  │
│ ┌──────────────────────┤────────────────────┐ │
│ │ Hero Text            │ Lenis Scroll       │ │
│ │ ScrollingProjectText │ ┌──────────────┐   │ │
│ │ (syncs with scroll)  │ │ Media Stack 1 │   │ │
│ │                      │ ├──────────────┤   │ │
│ │ Year: 2025           │ │ Media Stack 2 │   │ │
│ │ Industry: Web        │ ├──────────────┤   │ │
│ │ Location: Remote     │ │ Media Stack 3 │   │ │
│ │ Deliverables: ...    │ └──────────────┘   │ │
│ └──────────────────────┘────────────────────┘ │
└──────────────────────────────────────────────┘
```

### ScrollingProjectText

`ScrollingProjectText` animates left-column text sections through GSAP/ScrollTrigger animations synchronized to the right-column scroll. Each section scrolls from `y: 24` → `y: 0` with `opacity: 0` → `opacity: 1` at staggered triggers.

### Sidebar Wheel Handling

On desktop, mouse wheel events over the left column are forwarded to the Lenis instance:

```typescript
const handleSidebarWheel = (event: React.WheelEvent<HTMLDivElement>) => {
  if (!isDesktop || !lenisInstance) return;
  event.preventDefault();
  lenisInstance.scrollTo(lenisInstance.targetScroll + event.deltaY, { programmatic: false });
};
```

### Lenis Lifecycle

Lenis is initialized and destroyed per mount inside `ProjectBrutalistLayout`:

```typescript
if (isDesktop) {
  const content = container.querySelector('.scroll-content-inner') as HTMLElement;
  if (content) {
    const lenis = initLenis(container, content);
    setLenisInstance(lenis);
  }
}

return () => {
  if (isDesktop && container) {
    destroyLenis(container);
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.scroller === container) st.kill();
    });
  }
};
```

### Tab-Based Routing

The layout derives the active tab from the URL pathname:

```typescript
const routeTab: 'project' | 'credits' = location.pathname.endsWith('/credits') ? 'credits' : 'project';
```

Tab switching updates both `activeTab` state and navigates:

```typescript
const selectProjectTab = (tab: 'project' | 'credits') => {
  setActiveTab(tab);
  const targetPath = tab === 'credits' ? `${projectBasePath}/credits` : projectBasePath;
  if (location.pathname !== targetPath) navigate(targetPath);
};
```

This ensures URL/bookmark shareability and correct back-button behavior.

---

## 4. CSS Architecture

### PortfolioLayout CSS (`src/layouts/PortfolioLayout.css`)

- Single-column, `flex-col` with `md:px-4 md:py-2`.
- The home content lives inside a single scroll container owned by the layout.

### ProjectBrutalistLayout CSS (`src/layouts/ProjectBrutalistLayout.css`)

- Column layout: `flex-col lg:flex-row`.
- Left column: `lg:w-[20%]` desktop, `w-full` mobile.
- Right column: `lg:w-[80%]` desktop, `w-full` mobile.
- Overlay: `fixed inset-0 z-project-shell`.

---

## 5. Cross-References

- [Architecture overview](architecture.md) — Entrypoint chain, component contracts
- [Routing and pages](routing-and-pages.md) — Route transitions
- [State management](state-management.md) — `ScrollProvider`, `ScrollerContext`
- [Scrolling system](scrolling-system.md) — Lenis lifecycle
- [Animation system](animation-system.md) — Project page reveals
- [Navigation](navigation-and-theming.md) — `SiteHeader`, theme toggle
- [Responsive system](responsive-system.md) — Three-tier breakpoints, tab switching
