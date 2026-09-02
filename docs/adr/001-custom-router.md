# ADR-001: BrowserRouter + AnimatePresence for Route Transitions

**Status**: Accepted | **Date**: 2026-06-03 | **Owner**: Engineering

## Context

Portfolio needs page transitions between routes (home → project → work). Two router APIs available: `BrowserRouter` (component-based) and `createBrowserRouter` (data-router). `AnimatePresence` required for exit animations.

`createBrowserRouter` cannot integrate with `AnimatePresence` because it owns DOM rendering internally. Exit animations break.

## Decision

Use `BrowserRouter` + `AnimatePresence mode="wait"`. Ban `createBrowserRouter`.

Key pattern:

```
BrowserRouter
└── AnimatedRoutes (AnimatePresence mode="wait")
    ├── Route "/" → PortfolioLayout
    ├── Route "/projects/:id" → ProjectPage
    └── Route "/contact" → ContactPage
```

Each route wrapped in `motion.div` keyed by `location.pathname` for AnimatePresence tracking. Transition: fade 0.25s, cubic-bezier(0.22, 1, 0.36, 1). Reduced motion: duration 0.

Route-derived state (active tab, nav highlight) from `location.pathname`, not React state. Eliminates URL/UI sync bugs.

Lazy loading via `React.lazy()` + `<Suspense fallback={null}>`. Non-home pages load on demand.

## Tradeoffs

| Pro | Con |
|-----|-----|
| AnimatePresence exit animations work fully | Lose data-router features (loaders, actions, error boundaries per-route) |
| Route-derived state = no sync bugs | Must manually parse pathname for tab state |
| Simple, predictable mental model | Slightly more boilerplate per route |
| Lazy loading deferred for free | Suspense boundary needed per lazy route |

## Consequences

1. `createBrowserRouter` banned project-wide — enforced in AGENTS.md rules
2. All route state derived from `pathname` — no `activeNav` React state
3. Project pages parse `/projects/:id/credits` suffix for tab state
4. Route transitions always fade 0.25s — no per-route customization needed
5. Back-navigation skips hero entrance via `hasInitiallyLoaded` module flag
