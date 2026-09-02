# ADR-005: Mobile Navigation Strategy

**Status**: Accepted | **Date**: 2026-06-03 | **Owner**: Engineering

## Context

Desktop navigation works via fixed header (`CentralNavMenu`) in left column. Mobile/tablet (<1024px) need different approach — no persistent left column, limited screen space, thumb-reachable targets.

## Decision

Three-layer mobile navigation:

### 1. MobileBottomNav (Global — all routes)
Fixed bottom bar, 5 tabs: [Home] [Work] [Studio] [Contact] [Theme]. `z-index: 20`. Glass effect (`backdrop-filter: blur(12px)`).

- Active tab derived from `location.pathname`
- Theme toggle as last tab (separate from route matching)
- `motion.button` with hover/tap scale
- Route safety: theme button excluded from active match

### 2. ProjectMobileNav (Project pages)
Floating bottom bar on project pages. Horizontal scroll with `scroll-snap-type: x mandatory`. Tabs = project sections (Overview, Process, Design, etc.).

- Active section synced to `ScrollerContext.activeSection`
- Tap tab → scroll to section. "Next Project" → navigate
- Active tab underline: `scaleX` animated 0→1 via Motion

### 3. useSwipeNavigation (Page-to-page)
Pointer-event-based swipe detection (not touch events — broader device support). Axis-locked horizontal. 50px threshold.

- Swipe left → next project. Swipe right → previous project
- Axis lock: horizontal distance must exceed vertical
- Only active on mobile project pages

### Home tab switching
Mobile home toggles between About (left column content) and Work (right column content) via `activeTab` state. No separate route — both columns share `/`.

## Tradeoffs

| Pro | Con |
|-----|-----|
| Bottom nav = thumb-reachable, standard mobile UX | Tab bar reduces viewport height by ~56px |
| Pointer events cover touch + stylus + mouse | Swipe can conflict with vertical scroll — axis lock mitigates |
| Route-derived active state = zero sync bugs | Project sections need ScrollerContext — coupling |
| Floating nav scrolls horizontally for many sections | Small tabs on projects with 6+ sections |

## Consequences

1. Mobile nav never appears on desktop — CSS `lg:hidden` / `hidden lg:block`
2. `useSwipeNavigation` only active on mobile project pages
3. Skip-to-content link first focusable element (z-index: 999) for WCAG 2.4.1
4. No hamburger menu — bottom nav always visible, no hidden navigation
5. Home tab-switching uses component state, not route — prevents full page re-render
