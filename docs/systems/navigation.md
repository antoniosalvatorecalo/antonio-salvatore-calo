# Navigation System

**Files**: `CentralNavMenu`, `MobileBottomNav`, `ProjectMobileNav`, `useSwipeNavigation` | **Owner**: Engineering

## Architecture

3 layers, responsive. All active state derived from `location.pathname`.

```
Desktop (≥1024px)     Mobile/Tablet (<1024px)
CentralNavMenu         MobileBottomNav (global)
│                      ProjectMobileNav (project pages)
│                      useSwipeNavigation (project → project)
```

## Components

### CentralNavMenu (Desktop)
**File**: `src/components/ui/CentralNavMenu.tsx`

Fixed header in left column. Items: MF logo → Home → Work → Studio → Contact → Theme toggle.

- Magnetic hover: `motion.button` spring stiffness 150, damping 15, mass 0.1
- Active state: inverted colors + bg highlight, derived from `pathname`
- Theme toggle: sun/moon swap via `AnimatePresence`. Rotate 180deg (0 if reduced motion)
- Glass effect: `rgba(var(--color-bg-rgb), 0.85)` + `backdrop-filter: blur(12px)`

### MobileBottomNav (Mobile/Tablet)
**File**: `src/components/ui/MobileBottomNav.tsx`

Fixed bottom bar, 5 tabs: Home | Work | Studio | Contact | Theme. z-index: 20.

- Active tab derived from `pathname`
- Theme toggle last tab — excluded from active matching
- `motion.button` hover/tap scale
- Visible <1024px. Hidden on desktop.

### ProjectMobileNav (Mobile project pages)
**File**: `src/components/ui/ProjectMobileNav.tsx`

Floating bottom tabs on project pages. Scrollable horizontally with `scroll-snap-type: x mandatory`.

- Tabs = project sections (Overview, Process, Design, Development, Results, Next →)
- Active section synced to `ScrollerContext.activeSection`
- Tap tab → scroll to section. "Next" → navigate to next project
- Active underline: `scaleX` 0→1 via Motion spring
- Consumes `ScrollerContext` from `ProjectBrutalistLayout`

### useSwipeNavigation
**File**: `src/hooks/navigation/useSwipeNavigation.ts`

Pointer-event-based swipe. 50px threshold. Axis-locked (horizontal must exceed vertical).

```typescript
useSwipeNavigation(containerRef, {
  enabled: true,
  threshold: 50,
  axis: 'x',
  onSwipedLeft: () => navigate(nextPath),
  onSwipedRight: () => navigate(prevPath),
});
```

Pointer events (not touch) — broader device support. Only active on mobile project pages.

### Skip Link
Visually hidden skip-to-content link, first focusable element. z-index: 999. Visible on keyboard tab (WCAG 2.4.1).

## Lifecycle

1. **Mount**: Read `pathname` → set active state. Register event listeners (swipe)
2. **Navigate**: `navigate()` triggers AnimatePresence transition. Components remount → re-read pathname
3. **Resize**: `<1024px` switch between desktop/mobile nav components
4. **Unmount**: Clean up pointer event listeners (swipe). Remove active states

## Dependencies

- `react-router-dom` — `useLocation()`, `navigate()`
- `motion` v12 — `motion.button`, `AnimatePresence`, spring transitions
- `ScrollerContext` — project nav section tracking
- `useTheme()` — theme toggle binding

## Extension Points

- **Add nav item**: Add entry to tab arrays in `MobileBottomNav` or `CentralNavMenu`. Map to route path
- **New nav component**: Follow route-derived pattern — read `pathname`, avoid separate active state
- **Custom gesture**: Extend `useSwipeNavigation` with new axis or threshold options
- **Analytics**: Add `navigate()` wrapper to log route changes
