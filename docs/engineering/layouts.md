# Layouts System

> Dual-column layout architecture, PortfolioLayout, ProjectBrutalistLayout, and the ScrollerContext.
> Owner: Engineering

---

## 1. Overview

The application uses two primary layouts:

| Layout | Route | Columns | Scroll |
|--------|-------|---------|--------|
| `PortfolioLayout` | `/` (home) | 2-column (30%/70%) | Per-column Lenis |
| `ProjectBrutalistLayout` | `/projects/:id` | 2-column (20%/80%) | Desktop: Lenis, Mobile: native |

Both layouts implement a **dual-column structure** where the left column contains metadata/navigation and the right column contains primary content.

---

## 2. PortfolioLayout

**File:** `src/layouts/PortfolioLayout.tsx`

### Component Hierarchy

```
PortfolioLayout (wrapper — calls useSmoothScroll, passes context)
└── PortfolioContent (internal — renders UI)
    ├── AnimationProvider (ScrollTrigger orchestration)
    ├── CentralNavMenu (desktop only)
    ├── Left Column (scroll-content)
    │   ├── AboutHero (instant reveal)
    │   ├── AboutBio (standard cascade)
    │   ├── AboutPrinciples (standard cascade)
    │   ├── AboutServices (standard cascade)
    │   └── AboutContact (standard cascade)
    ├── Right Column (scroll-content)
    │   └── ProjectCard × N (wrapped in .project-card-wrapper)
    ├── MobileBottomNav (mobile/tablet only)
    └── BackToTop (desktop only)
```

### Column Configuration

| Property | Left Column | Right Column |
|----------|-------------|--------------|
| Width (desktop) | 20–45% (fluid via `--left-col-target`) | remaining |
| Width (mobile) | 100% (hidden when tab !== 'about') | 100% (hidden when tab !== 'work') |
| Scroll | `useSmoothScroll(leftScrollRef)` | `useSmoothScroll(rightScrollRef)` |
| Theme | Light (white bg) | Dark (black bg, via right column) |

### Column Hover Resize (Disabled)

The codebase contains a **disabled** column hover resize feature that would expand the left column on hover (20% → 45%). It's commented out to avoid TypeScript unused variable errors. The `columnState` (`'default' | 'left' | 'right'`) and z-index management infrastructure remain in place for future re-enablement.

### Desktop vs Mobile Rendering

Desktop renders both columns simultaneously. Mobile/tablet renders one column at a time controlled by `activeTab`:

```tsx
{/* LEFT COLUMN */}
<div className={`h-full ${!isDesktop && activeTab !== 'about' ? 'hidden' : 'block'} ...`}>
  {/* Left scroll content */}
</div>

{/* RIGHT COLUMN */}
<div className={`h-full ${!isDesktop && activeTab !== 'work' ? 'hidden' : 'block'} ...`}>
  {/* Right scroll content */}
</div>
```

### useSmoothScroll Initialization

Both columns initialize Lenis via `useSmoothScroll` at the `PortfolioLayout` level:

```typescript
useSmoothScroll(leftScrollRef, { enabled: effectsEnabled });
useSmoothScroll(rightScrollRef, { enabled: effectsEnabled });
```

See [scrolling system](scrolling-system.md) for details.

### Project Card Entry Animation

On first load, project cards perform a dramatic 3D entrance animation:

```
Initial state:  opacity: 0, x: 72, y: 126, z: -280, rotateX: 9°, rotateY: -6°, scale: 0.88
Final state:    opacity: 1, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1
```

Each card is staggered by `0.16s` per card. Sub-elements (image mask, image, matte overlay, caption) animate with their own timing curves. On completion, `.project-card-wrapper` gets `.revealed` class and `willChange` is cleared.

On reduced motion or back-navigation, cards jump directly to final state.

---

## 3. ProjectBrutalistLayout

**File:** `src/layouts/ProjectBrutalistLayout.tsx`

### Component Hierarchy

```
ProjectBrutalistLayout
└── ScrollerContext.Provider
    ├── SkipToContent (WCAG 2.4.1 — keyboard-only)
    ├── CentralNavMenu (desktop only)
    ├── Left Column (20% width)
    │   ├── Hero Text (LetterSwapBlock)
    │   └── ScrollingProjectText / Credits (desktop)
    │       └── ProjectCreditsSection (mobile credits tab)
    ├── Right Column (80% width)
    │   ├── Desktop: LayoutSplitTextMediaStack × N (scroll-content-inner)
    │   └── Mobile: ProjectSection × N + ProjectCreditsSection
    ├── ProjectMobileNav (mobile/tablet only)
    └── BackToTop
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
- `ScrollingProjectText` — syncs left-column text with right-column scroll position
- `ProjectSection` — binds scroll reveal to the correct scroller
- `CentralNavMenu` — reads Lenis for scroll-to-top behavior

### Desktop vs Mobile Content Strategy

The layout renders completely different DOM on desktop vs mobile:

**Desktop** (`isDesktop === true`):
- Left column: `ScrollingProjectText` syncs section text with right-column scroll
- Right column: Full `children` (LayoutSplitTextMediaStack components) in a Lenis-wrapped scroll container
- Images appear inline within the text/media stacks

**Mobile** (`isDesktop === false`):
- Single-column: one column visible at a time (project tab or credits tab)
- Content rendered from `leftColumnSections` as vertical blocks via `ProjectSection`
- Each `ProjectSection` renders: image → title → description → CTA
- Credits rendered at the end of project column or full-screen in credits tab
- Uses native scroll on `<mobileScrollRef>` — no Lenis

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

`ScrollingProjectText` animates left-column text sections through a series of GSAP/ScrollTrigger animations synchronized to the right-column scroll. Each section scrolls from `y: 24` → `y: 0` with `opacity: 0` → `opacity: 1` at staggered triggers.

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

Lenis is initialized and destroyed per mount:

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

The layout derives active tab from the URL pathname:

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
- Column layout: `flex-col md:flex-row` with `md:px-4 md:gap-4 md:py-2`
- Left column: `w-[calc(30%-8px)]` desktop, full-width mobile
- Right column: `w-[calc(70%-8px)]` desktop, full-width mobile
- Responsive column visibility: `hidden` when tab doesn't match

### ProjectBrutalistLayout CSS (`src/layouts/ProjectBrutalistLayout.css`)
- Column layout: `flex-col lg:flex-row`
- Left column: `lg:w-[20%]` desktop, `w-full` mobile
- Right column: `lg:w-[80%]` desktop, `w-full` mobile
- Overlay: `fixed inset-0 z-project-shell`

---

## 5. Cross-References

- [Architecture overview](architecture.md) — Entrypoint chain, component contracts
- [Routing and pages](routing-and-pages.md) — Route transitions, isFirstLoad
- [State management](state-management.md) — ScrollProvider, ScrollerContext
- [Scrolling system](scrolling-system.md) — useSmoothScroll, Lenis lifecycle
- [Animation system](animation-system.md) — Project card entry, section cascade
- [Navigation](navigation-and-theming.md) — CentralNavMenu, MobileBottomNav
- [Responsive system](responsive-system.md) — Three-tier breakpoints, tab switching
