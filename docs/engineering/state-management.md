# State Management

> Patterns for state management — providers, contexts, refs, and route-derived state.
> Owner: Engineering

---

## 1. Philosophy

The project intentionally minimizes React state. Most "state" is either:

1. **Route-derived** — computed from `location.pathname`.
2. **Ref-based** — mutable values that don't trigger re-renders.
3. **GSAP-managed** — animation state belongs to GSAP timelines, not React.
4. **CSS-managed** — visual states via data attributes and CSS transitions.

This keeps the React render tree lean and avoids synchronization bugs between animation and rendering.

---

## 2. Provider Architecture

### Provider Tree

```
LanguageProvider                      (only top-level provider)
└── BrowserRouter
    └── AnimatedRoutes
         ├── "/" → PortfolioLayout
         │     └── FilterProvider     (local to home)
         ├── "/projects/:slug" → BugoniaPage / NewsquestPage
         │     └── ProjectBrutalistLayout
         │           ├── MotionPreferenceProvider (local)
         │           ├── ScrollProvider           (local)
         │           └── ThemeProvider            (local)
         └── "/contact" → ContactPage
```

Only `LanguageProvider` lives at the router root. All other providers are mounted at the page/layout that needs them.

### LanguageProvider

**File:** `src/providers/LanguageProvider.tsx`

Provides the active UI language (Italian / English) and the language toggle. Lives at the top of the tree so every page can read translations.

### MotionPreferenceProvider

**File:** `src/providers/MotionPreferenceProvider.tsx`

Reads the OS-level `prefers-reduced-motion` media query and provides it as a boolean context value.

**Responsibilities:**

- Reads `window.matchMedia('(prefers-reduced-motion: reduce)')` on mount.
- Subscribes to `change` events for live updates.
- Sets `document.documentElement.dataset.motion` to `'reduced'` or `'full'`.
- Provides `useReducedMotionPreference()` hook.

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

- Holds **refs only** — no Lenis instances, no scroll logic.
- `isDesktop`/`isTablet` updated via `requestAnimationFrame`-throttled resize listener.
- `activeTab` drives column visibility on mobile (which column is shown).
- The `leftScrollRef` and `rightScrollRef` are created here but Lenis is wired locally inside the layout.

**Historical note (FIX 16):** A global Lenis instance was previously created in `ScrollProvider`. It was removed because it conflicted with per-layout instances, causing scroll corruption and initialization race conditions on route changes.

### ThemeProvider

**File:** `src/providers/ThemeProvider.tsx` (via `useTheme`)

Reads `localStorage` + OS `prefers-color-scheme` fallback. Sets the `data-theme` attribute on `<html>`. Persists the toggle across reloads.

### FilterProvider

**File:** `src/providers/FilterProvider.tsx`

Local to `PortfolioLayout`. Owns the home gallery filter state (e.g. by year, by category) consumed by `ProjectGrid` and `ProjectListRow`.

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
| `initializedRef` | layout-local Lenis init | Guards against double Lenis initialization in StrictMode |
| `isMountedRef` | layout-local Lenis init, `ProjectBrutalistLayout` | Prevents state updates after unmount |
| `observerRef` | layout-local Lenis init | Holds MutationObserver reference for cleanup |
| `initCleanupRef` | layout-local Lenis init | Stores cleanup function for deferred initialization |
| `startX/Y` | `useSwipeNavigation` | Tracks touch start position |
| `axis` | `useSwipeNavigation` | Determines swipe vs scroll axis lock |
| `leftScrollRef` / `rightScrollRef` | `ScrollProvider` | DOM refs for column scroll containers |

**Rule:** Never call hooks inside GSAP callbacks, MutationObserver callbacks, Lenis init, `setTimeout`, or `requestAnimationFrame`. Hook invocations happen only during component render or `useEffect`.

---

## 5. Route-Derived State

Where possible, state is derived from the URL to eliminate synchronization:

| State | Source | Computation |
|-------|--------|-------------|
| Active tab (project) | `location.pathname` | `.endsWith('/credits')` |
| Active nav item | `location.pathname` | exact match |
| Theme | `localStorage` + OS preference | `getStoredOrSystemTheme()` |
| Active slide | User interaction | `setActiveSlide()` |

---

## 6. Pattern: Avoid Render-Triggering Animation State

Animation progress values are stored in GSAP timelines, not React state. Animation state belongs to GSAP contexts and the `gsap.context()` cleanup chain — never in a `useState` setter.

---

## 7. Pattern: Module-Level Flags

Module-level `let` variables serve as singletons across component instances:

```typescript
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
  ├── SiteHeader reads pathname → sets active NavItem
  │
  ├── ProjectBrutalistLayout derives routeTab → setActiveTab
  │   └── Column visibility toggles (mobile)
  │
  ├── Theme toggle → localStorage + data-theme attribute
  │   └── CSS variables switch between light/dark definitions
  │
  └── FilterProvider → home gallery filter state (PortfolioLayout only)
```

---

## 9. Cross-References

- [Architecture overview](architecture.md) — Provider hierarchy, entrypoint chain
- [Animation system](animation-system.md) — GSAP context, entrance reveals
- [Scrolling system](scrolling-system.md) — Layout-local Lenis lifecycle
- [Routing and pages](routing-and-pages.md) — Route-derived state patterns
- [Layouts](layouts.md) — `ScrollProvider` usage in layouts
