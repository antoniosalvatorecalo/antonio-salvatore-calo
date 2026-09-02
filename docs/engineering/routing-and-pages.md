# Routing and Pages

> Client-side routing architecture, page transitions, lazy loading strategy, and page composition.
> Owner: Engineering

---

## 1. Router Architecture

The application uses **React Router v7** with `BrowserRouter` + `AnimatePresence` for smooth page transitions. This combination is mandatory — `createBrowserRouter` is explicitly banned (it breaks AnimatePresence integration).

```
BrowserRouter
└── AnimatedRoutes (AnimatePresence mode="wait")
    ├── Route "/"                    → App (preloader → PortfolioLayout)
    ├── Route "/about"               → AboutPage (dedicated About page)
    ├── Route "/work"                → WorkPage (list/featured/grid views)
    ├── Route "/projects/bugonia"    → BugoniaPage (ProjectBrutalistLayout)
    ├── Route "/projects/newsquest"  → NewsquestPage (ProjectBrutalistLayout)
    ├── Route "/projects/bugonia/credits"   → BugoniaPage (credits tab)
    ├── Route "/projects/newsquest/credits" → NewsquestPage (credits tab)
    └── Route "/contact"            → ContactPage
```

**Key files:**
- `src/providers/AppRouter.tsx` — route definitions and animated wrapper
- `src/App.tsx` — preloader lifecycle and PortfolioLayout mounting

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

- **Home**: fade 0.25s in/out
- **Project pages**: fade 0.25s in/out (previously slide, now unified)
- **Back-navigation**: `AnimatePresence mode="wait"` ensures exit completes before enter
- **Reduced motion**: instant transitions (`duration: 0`) when `prefers-reduced-motion` is active

### Preloader Transition

The preloader (`App.tsx`) also uses `AnimatePresence mode="wait"`:

```
isLoading → Preloader (3200ms minimum)
         ↓
isLoading=false → PortfolioLayout (app-reveal CSS transition)
```

- `app-reveal` CSS class handles the fade-up entrance (opacity: 0 → 1, translateY: 20px → 0)
- `.app-reveal[data-loading='false']` triggers after preloader completes
- Transition: `opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s` with 0.2s delay

### isFirstLoad Detection

A module-level `hasInitiallyLoaded` flag prevents re-running the entrance animation on back-navigation:

```typescript
let hasInitiallyLoaded = false;

export default function App() {
  const isFirstLoad = !hasInitiallyLoaded;
  // ...
  const handlePreloaderComplete = () => {
    hasInitiallyLoaded = true;
    setIsLoading(false);
  };
}
```

When `isFirstLoad=false`, GSAP animations skip the dramatic initial entrance and jump directly to final state.

---

## 3. Lazy Loading

All non-home pages are lazy-loaded using `React.lazy`:

```typescript
const WorkPage = React.lazy(() => import('../pages/work/WorkPage'));
const BugoniaPage = React.lazy(() => import('../pages/projects/bugonia/ProjectPage'));
const NewsquestPage = React.lazy(() => import('../pages/projects/newsquest/ProjectPage'));
const ContactPage = React.lazy(() => import('../pages/contact/ContactPage'));
```

The `PortfolioLayout` is also lazy-loaded from `App.tsx`:

```typescript
const PortfolioLayout = lazy(() =>
  import('./layouts/PortfolioLayout').then(m => ({ default: m.PortfolioLayout }))
);
```

Each lazy route is wrapped in `<Suspense fallback={null}>` — no loading skeleton, the route transition handles the visual gap.

---

## 4. Page Structure

### Home Page (`/`)
- Renders `App` → `PortfolioLayout`
- Dual-column: left (About) + right (Work)
- Desktop: both columns visible simultaneously
- Mobile/tablet: tab-switching between About and Work tabs
- Entry animation orchestrated by `AnimationProvider`

### Work Page (`/work`)
- Standalone page with `CentralNavMenu`
- Three views switchable via `WorkViewSwitcher`:
  - **List view**: `ListViewContainer` — scroll-reveal rows with hover underlines
  - **Featured view**: `FeaturedProjectsView` — letter-swap titles + draggable image carousels
  - **Grid view**: `GridProjectsView` — grid of project cards
- View switching uses `AnimatePresence mode="wait"` within the page
- All views navigate to `/projects/:id` on click

### Project Pages (`/projects/bugonia`, `/projects/newsquest`)
- Uses `ProjectBrutalistLayout` as the shell
- Two sub-tabs derived from URL pathname:
  - `/projects/:id` → 'project' tab (main content)
  - `/projects/:id/credits` → 'credits' tab (acknowledgments)
- The `routeTab` is calculated from `location.pathname.endsWith('/credits')`
- `SelectProjectTab` callback updates both `activeTab` state and URL via `navigate()`

### Credits Route Pattern
```
/projects/bugonia          → bugonia page, project tab
/projects/bugonia/credits  → bugonia page, credits tab
```

Both routes render the same component (`BugoniaPage`), but with different active tab. The `ProjectBrutalistLayout` derives the tab from the URL and sets it via `setActiveTab()`.

### About Page (`/about`)
- Standalone about page that renders the same About sections as the home page:
  `AboutHero`, `AboutBio`, `AboutPrinciples`, `AboutServices`, `AboutContact`
- Lazy-loaded via `React.lazy` with route transition animation
- Linked from `CentralNavMenu` on both desktop and mobile
- On mobile, `MobileBottomNav` navigates to `/` with `activeTab='about'` instead
- `src/pages/about/AboutPage.tsx` — wraps all about components in a single-column scroll layout
- Uses `useSmoothScroll` for Lenis smooth scrolling

### Contact Page (`/contact`)
- Standalone contact page accessed via navigation or swipe gesture
- Separate from the `AboutContact` section on the home page
- Interactive sentence-builder form (`ContactBuilder` component) collects name, project type, client type, focus, budget, timeline, email
- On submission, sends data to `/api/contact` Vercel serverless endpoint
- Falls back to `mailto:` if the API is unavailable or SMTP not configured
- Shows loading/spinner state during submission, success state after, error state with fallback on failure
- See [Contact API architecture](../engineering/contact-api.md)

---

## 5. Route-Derived State

Wherever possible, state is derived from the URL rather than stored in React state:

- **Active tab on project pages**: derived from `location.pathname`
- **Active nav item**: derived from `pathname` in `CentralNavMenu` 
- **isFirstLoad**: module-level boolean flag
- **Theme**: persisted in `localStorage` with OS preference fallback

This eliminates synchronization bugs between URL and UI state.

---

## 6. Cross-References

- [Architecture overview](architecture.md) — Entrypoint chain, rendering layers
- [Layouts](layouts.md) — PortfolioLayout, ProjectBrutalistLayout
- [Navigation](navigation-and-theming.md) — Nav components, route-driven active state
- [Content architecture](content-architecture.md) — Project data, page content
- [Responsive system](responsive-system.md) — Mobile tab behavior, viewport adaptation
