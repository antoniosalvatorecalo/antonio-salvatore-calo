# Routing and Pages

> Client-side routing architecture, page transitions, lazy loading strategy, and page composition.
> Owner: Engineering

---

## 1. Router Architecture

The application uses **React Router v7** with `BrowserRouter` + `AnimatePresence` for smooth page transitions. This combination is mandatory — `createBrowserRouter` is explicitly banned (it breaks `AnimatePresence` integration).

```
BrowserRouter
└── AnimatedRoutes (AnimatePresence mode="wait")
    ├── "/"                       → App (lazy PortfolioLayout)
    ├── "/projects/bugonia"       → BugoniaPage (ProjectBrutalistLayout)
    ├── "/projects/bugonia/credits"   → BugoniaPage (credits tab)
    ├── "/projects/newsquest"     → NewsquestPage (ProjectBrutalistLayout)
    ├── "/projects/newsquest/credits" → NewsquestPage (credits tab)
    └── "/contact"                → ContactPage
```

**Key files:**

- `src/providers/AppRouter.tsx` — route definitions and animated wrapper.
- `src/providers/LanguageProvider.tsx` — only top-level provider.

---

## 2. Transition System

### Route Transitions

Every route is wrapped in a `motion.div` with a consistent `key` prop for `AnimatePresence` tracking:

```typescript
const routeMotion = {
  initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
  animate: { opacity: 1 },
  exit: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
  transition: prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
};
```

- **All routes**: fade 0.25s in/out.
- **Reduced motion**: instant transitions (`duration: 0`) when `prefers-reduced-motion` is active.

### Suspense Boundary

Lazy-loaded routes are wrapped in `<Suspense fallback={null}>` — no loading skeleton, the route transition handles the visual gap during chunk load.

---

## 3. Lazy Loading

All non-trivial pages and layouts are lazy-loaded via `React.lazy`:

```typescript
const PortfolioLayout = lazy(() => import('./layouts/PortfolioLayout'));
const BugoniaPage = lazy(() => import('./pages/projects/bugonia/ProjectPage'));
const NewsquestPage = lazy(() => import('./pages/projects/newsquest/ProjectPage'));
const ContactPage = lazy(() => import('./pages/contact/ContactPage'));
```

---

## 4. Page Structure

### Home Page (`/`)

- Renders `App` → `PortfolioLayout`.
- Single-column scroll: `SiteHeader` → `ProjectIndex` → `ProjectGrid` (gallery rendering via `ProjectGallery` + `ProjectListRow` + `ProjectLeftTextReveal` + `RollingText`).
- `PortfolioLayout` owns its own Lenis instance and wires it through the GSAP ticker.

### Project Pages (`/projects/bugonia`, `/projects/newsquest`)

- Rendered by `BugoniaPage` / `NewsquestPage` inside `ProjectBrutalistLayout`.
- Two sub-tabs derived from URL pathname:
  - `/projects/:slug` → 'project' tab (main content).
  - `/projects/:slug/credits` → 'credits' tab (acknowledgments).
- The `routeTab` is calculated from `location.pathname.endsWith('/credits')`.
- `selectProjectTab` callback updates both `activeTab` state and URL via `navigate()`.

### Credits Route Pattern

```
/projects/bugonia          → bugonia page, project tab
/projects/bugonia/credits  → bugonia page, credits tab
```

Both routes render the same component (`BugoniaPage`), but with a different active tab. `ProjectBrutalistLayout` derives the tab from the URL and sets it via `setActiveTab()`.

### Contact Page (`/contact`)

- Standalone contact page accessed via navigation.
- Interactive sentence-builder form (`ContactBuilder` component) collects name, project type, client type, focus, budget, timeline, email.
- On submission, sends data to `/api/contact` Vercel serverless endpoint.
- Falls back to `mailto:` if the API is unavailable or SMTP is not configured.
- Shows loading state during submission, success state after, error state with fallback on failure.
- See [Contact API architecture](../engineering/contact-api.md).

---

## 5. Route-Derived State

Wherever possible, state is derived from the URL rather than stored in React state:

- **Active tab on project pages**: derived from `location.pathname`.
- **Active nav item**: derived from `pathname` in `SiteHeader`.
- **Theme**: persisted in `localStorage` with OS preference fallback.

This eliminates synchronization bugs between URL and UI state.

---

## 6. Cross-References

- [Architecture overview](architecture.md) — Entrypoint chain, rendering layers
- [Layouts](layouts.md) — `PortfolioLayout`, `ProjectBrutalistLayout`
- [Navigation](navigation-and-theming.md) — Nav components, route-driven active state
- [Content architecture](content-architecture.md) — Project data, page content
- [Responsive system](responsive-system.md) — Mobile tab behavior, viewport adaptation
