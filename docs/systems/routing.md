# Routing System

**File**: `src/providers/AppRouter.tsx` | **Owner**: Engineering

## Architecture

`BrowserRouter` + `AnimatePresence mode="wait"`. Each route = `motion.div` keyed by `pathname`. Exit completes before enter.

```
BrowserRouter
└── AnimatedRoutes (AnimatePresence)
    ├── "/"                            → App (PortfolioLayout)
    ├── "/projects/bugonia"            → BugoniaPage (ProjectBrutalistLayout)
    │   └── "/projects/bugonia/credits" → same page, credits tab
    ├── "/projects/newsquest"          → NewsquestPage (ProjectBrutalistLayout)
    │   └── "/projects/newsquest/credits" → same page, credits tab
    └── "/contact"                     → ContactPage
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

**isFirstLoad**: Module-level `hasInitiallyLoaded` flag (in `App.tsx`) — if present, used by the home page to skip first-mount entrance animations on back-navigation.

## Lazy Loading

All non-trivial pages and layouts use `React.lazy()`:

```typescript
const PortfolioLayout = React.lazy(() => import('../layouts/PortfolioLayout'));
const BugoniaPage = React.lazy(() => import('../pages/projects/bugonia/ProjectPage'));
const NewsquestPage = React.lazy(() => import('../pages/projects/newsquest/ProjectPage'));
const ContactPage = React.lazy(() => import('../pages/contact/ContactPage'));
```

Wrapped in `<Suspense fallback={null}>`. No loading skeleton — route transition covers the visual gap.

## Route-Derived State

| State | Source | Derivation |
|-------|--------|-----------|
| Active project tab | `pathname` | `.endsWith('/credits')` |
| Active nav item | `pathname` | exact match |
| Theme | `localStorage` + OS preference | `getStoredOrSystemTheme()` |

No React state for active nav/tab — derived from URL. Eliminates sync bugs.

## Lifecycle

1. **Mount**: `BrowserRouter` reads URL → matches route → mounts component.
2. **Navigate**: `navigate()` changes URL → `AnimatePresence` exits old, enters new.
3. **Back**: Browser back triggers the same flow — `isFirstLoad` skips first-mount entrances.
4. **Unmount**: Route leaves → `AnimatePresence` exit animation → component unmounts → GSAP contexts revert.

## Dependencies

- `react-router-dom` v7 — `BrowserRouter`, `Routes`, `Route`, `useLocation`, `useNavigate`.
- `motion` v12 — `AnimatePresence`, `motion.div`.
- `React.lazy` + `Suspense` — code splitting.

## Extension Points

- **Add route**: Add `<Route>` in `AppRouter.tsx`. Wrap element in `React.lazy` for code splitting.
- **Custom transition**: Modify `routeMotion` object. Add per-route variants via `motion.div` props.
- **Auth guard**: Wrap `<Route>` with a protected component that checks auth state.
- **404 page**: Add catch-all `<Route path="*">` at the end of the route list.
