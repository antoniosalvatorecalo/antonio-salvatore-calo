# State Management

> Patterns for state management — providers, contexts, refs, and route-derived state.
> Owner: Engineering

---

## 1. Philosophy

The project intentionally minimizes React state. Most "state" is either:

1. **Route-derived** — computed from `location.pathname`
2. **Ref-based** — mutable values that don't trigger re-renders
3. **GSAP-managed** — animation state belongs to GSAP timelines, not React
4. **CSS-managed** — visual states via data attributes and CSS transitions

This keeps the React render tree lean and avoids synchronization bugs between animation and rendering.

---

## 2. Provider Architecture

### Provider Tree

```
MotionPreferenceProvider
└── ScrollProvider
    └── BrowserRouter
        └── AnimatedRoutes
```

### MotionPreferenceProvider

**File:** `src/providers/MotionPreferenceProvider.tsx`

Reads the OS-level `prefers-reduced-motion` media query and provides it as a boolean context value.

**Responsibilities:**
- Reads `window.matchMedia('(prefers-reduced-motion: reduce)')` on mount
- Subscribes to `change` events for live updates
- Sets `document.documentElement.dataset.motion` to `'reduced'` or `'full'`
- Provides `useReducedMotionPreference()` hook

**CSS impact:**
```css
html[data-motion="reduced"] *,
html[data-motion="reduced"] *::before,
html[data-motion="reduced"] *::after {
  scroll-behavior: auto;
  transition-duration: 0.01ms;
  animation-duration: 0.01ms;
  animation-iteration-count: 1;
}
```

### ScrollProvider

**File:** `src/providers/ScrollProvider.tsx`

**Context value:**
```typescript
interface ScrollContextType {
  isDesktop: boolean;        // width >= 1024px
  isTablet: boolean;         // width >= 768px && width < 1024px
  activeTab: 'about' | 'work' | 'credits' | 'project';
  setActiveTab: (tab: ...) => void;
  leftScrollRef: RefObject<HTMLDivElement | null>;
  rightScrollRef: RefObject<HTMLDivElement | null>;
}
```

**Key design decisions:**
- Holds **refs only** — no Lenis instances, no scroll logic
- `isDesktop`/`isTablet` updated via `requestAnimationFrame`-throttled resize listener
- `activeTab` drives column visibility on mobile (which column is shown)
- The `leftScrollRef` and `rightScrollRef` are created here but Lenis is initialized in `useSmoothScroll`

**Historical note (FIX 16):** A global Lenis instance was previously created in ScrollProvider. It was removed because it conflicted with per-column instances, causing scroll corruption and initialization race conditions on route changes.

---

## 3. ScrollerContext (Project Pages)

**File:** `src/layouts/ProjectBrutalistLayout.tsx`

```typescript
interface ScrollerContextType {
  ref: React.RefObject<HTMLDivElement | null>;
  lenis: Lenis | null;
}
```

This is a **local** context (not a provider) scoped to each `ProjectBrutalistLayout` instance. It provides child components with access to the correct scroll container and Lenis instance — desktop or mobile.

**Not consumed globally — only within project pages.**

---

## 4. Ref Patterns

The codebase uses refs extensively for values that change frequently but shouldn't trigger re-renders:

| Ref | File | Purpose |
|-----|------|---------|
| `initializedRef` | `useSmoothScroll` | Guards against double Lenis initialization in StrictMode |
| `isMountedRef` | `useSmoothScroll`, `ProjectBrutalistLayout` | Prevents state updates after unmount |
| `observerRef` | `useSmoothScroll` | Holds MutationObserver reference for cleanup |
| `initCleanupRef` | `useSmoothScroll` | Stores cleanup function for deferred initialization |
| `startX/Y` | `useSwipeNavigation` | Tracks touch start position |
| `axis` | `useSwipeNavigation` | Determines swipe vs scroll axis lock |
| `currentHoveredRef` | `PortfolioLayout` | Tracks column hover state for resize animation |
| `leftScrollRef` / `rightScrollRef` | `ScrollProvider` | DOM refs for column scroll containers |

**Rule:** Never call hooks inside GSAP callbacks, MutationObserver callbacks, or Lenis init. Hook invocations happen only during component render or useEffect.

---

## 5. Route-Derived State

Where possible, state is derived from the URL to eliminate synchronization:

| State | Source | Computation |
|-------|--------|-------------|
| Active tab (project) | `location.pathname` | `.endsWith('/credits')` |
| Active nav item | `location.pathname` | `startsWith('/work')`, etc. |
| isFirstLoad | Module-level `let` | `!hasInitiallyLoaded` |
| Theme | `localStorage` + OS preference | `getStoredOrSystemTheme()` |
| Active slide | User interaction | `setActiveSlide()` |

---

## 6. Pattern: Avoid Render-Triggering Animation State

Animation progress values are stored in GSAP timelines, not React state. The `AnimationOrchestrator` uses a module-level state machine (Map-based, not React) to track section states:

```typescript
const status = new Map<SectionId, SectionState>();
// idle → visible → playing → done
```

This ensures animation execution is synchronous and never delayed by React's render cycle.

---

## 7. Pattern: Module-Level Flags

Module-level `let` variables serve as singletons across component instances:

```typescript
// App.tsx — prevents re-running initial entrance on back-navigation
let hasInitiallyLoaded = false;

// lenis-manager.ts — prevents double Lenis initialization
const lenisInstances = new Map<HTMLElement, LenisBinding>();
```

These survive StrictMode double-mounting because they're at module scope, not component scope.

---

## 8. State Flow Diagram

```
URL Change
  ├── location.pathname → Route component + key change
  │   └── AnimatePresence triggers exit/enter animations
  │
  ├── CentralNavMenu reads pathname → sets active NavItem
  │
  ├── ProjectBrutalistLayout derives routeTab → setActiveTab
  │   └── Column visibility toggles (mobile)
  │
  ├── Theme Toggle → localStorage + data-theme attribute
  │   └── CSS variables switch between light/dark definitions
  │
  └── isFirstLoad flag → GSAP chooses initial or static animation
```

---

## 9. Cross-References

- [Architecture overview](architecture.md) — Provider hierarchy, entrypoint chain
- [Animation system](animation-system.md) — AnimationOrchestrator state machine
- [Scrolling system](scrolling-system.md) — useSmoothScroll, Lenis lifecycle
- [Routing and pages](routing-and-pages.md) — Route-derived state patterns
- [Layouts](layouts.md) — ScrollProvider usage in layouts
