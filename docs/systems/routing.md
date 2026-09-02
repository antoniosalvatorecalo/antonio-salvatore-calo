# Routing System

**File**: `src/providers/AppRouter.tsx` | **Owner**: Engineering

## Architecture

`BrowserRouter` + `AnimatePresence mode="wait"`. Each route = `motion.div` keyed by `pathname`. Exit completes before enter.

```
BrowserRouter
└── AnimatedRoutes (AnimatePresence)
    ├── "/" → App (preloader → PortfolioLayout)
    ├── "/about" → AboutPage
    ├── "/work" → WorkPage
    ├── "/projects/:slug" → ProjectPage
    │   └── "/projects/:slug/credits" → same page, credits tab
    └── "/contact" → ContactPage
```

**Ban**: `createBrowserRouter` — breaks AnimatePresence integration.

## Route Transitions

```typescript
const routeMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
};
// Reduced motion: duration 0
```

**Preloader transition**: `App` renders `Preloader` (3200ms min on first load). `isLoading` → `app-reveal` CSS class fades in PortfolioLayout (opacity + translateY, 1s cubic-bezier).

**isFirstLoad**: Module-level `hasInitiallyLoaded` flag. Back-navigation skips preloader + GSAP entrance. Route transition handles reveal instead.

## Lazy Loading

All non-home pages use `React.lazy()`:

```typescript
const WorkPage = React.lazy(() => import('../pages/work/WorkPage'));
const ProjectPage = React.lazy(() => import('../pages/projects/ProjectPage'));
const ContactPage = React.lazy(() => import('../pages/contact/ContactPage'));
const PortfolioLayout = lazy(() => import('../layouts/PortfolioLayout'));
```

Wrapped in `<Suspense fallback={null}>`. No loading skeleton — route transition covers gap.

## Route-Derived State

| State | Source | Derivation |
|-------|--------|-----------|
| Active project tab | `pathname` | `.endsWith('/credits')` |
| Active nav item | `pathname` | `startsWith('/work')` etc |
| isFirstLoad | Module flag | `!hasInitiallyLoaded` |

No React state for active nav/tab — derived from URL. Eliminates sync bugs.

## Lifecycle

1. **Mount**: `BrowserRouter` reads URL → matches route → mounts component
2. **Navigate**: `navigate()` changes URL → AnimatePresence exits old, enters new
3. **Back**: Browser back triggers same flow — isFirstLoad skips preloader
4. **Unmount**: Route leaves → AnimatePresence exit animation → component unmounts → GSAP contexts revert

## Dependencies

- `react-router-dom` v7 — `BrowserRouter`, `Routes`, `Route`, `useLocation`, `useNavigate`
- `motion` v12 — `AnimatePresence`, `motion.div`
- `React.lazy` + `Suspense` — code splitting

## Extension Points

- **Add route**: Add `<Route>` in `AppRouter.tsx`. Wrap element in `React.lazy` for code splitting
- **Custom transition**: Modify `routeMotion` object. Add per-route variants via `motion.div` props
- **Auth guard**: Wrap `<Route>` with protected component that checks auth state
- **404 page**: Add catch-all `<Route path="*">` at end of route list
