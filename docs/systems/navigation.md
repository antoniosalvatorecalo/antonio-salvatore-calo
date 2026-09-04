# Navigation System

**Files**: `SiteHeader`, `useSwipeNavigation`, `useTheme`, `useLanguage`, `useItalyTime` | **Owner**: Engineering

## Architecture

Single global header plus project-page gestures. All active state is derived from `location.pathname`.

```
Desktop (≥1024px)     Mobile/Tablet (<1024px)
SiteHeader            SiteHeader (compact)
useSwipeNavigation    useSwipeNavigation (project → project)
```

## Components

### SiteHeader

**File**: `src/components/ui/SiteHeader.tsx`

Top header mounted by `PortfolioLayout` and the project layouts. Items: logo → nav links → language toggle → theme toggle.

- Magnetic hover: `motion.button` spring stiffness 150, damping 15, mass 0.1.
- Active state: inverted colors + bg highlight, derived from `pathname`.
- Language toggle: binds to `LanguageProvider`, switches UI language.
- Theme toggle: binds to `useTheme()`. Icon swap via `AnimatePresence`. Rotate 180deg (0 if reduced motion).
- Glass effect: `rgba(var(--color-bg-rgb), 0.85)` + `backdrop-filter: blur(12px)`.

### useSwipeNavigation

**File**: `src/hooks/useSwipeNavigation.ts`

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

### useTheme

**File**: `src/hooks/useTheme.ts`

Theme toggle context. Read/write the current theme. Backed by `localStorage` with OS preference fallback.

### useLanguage

Backed by `LanguageProvider` (top-level). Provides the active translation dictionary and a toggle.

### useItalyTime

**File**: `src/hooks/useItalyTime.ts`

Italian-time clock used by `SiteHeader` (e.g. live local-time display).

### Skip Link

Visually hidden skip-to-content link, first focusable element. z-index: 999. Visible on keyboard tab (WCAG 2.4.1).

## Lifecycle

1. **Mount**: Read `pathname` → set active state. Register event listeners (swipe).
2. **Navigate**: `navigate()` triggers `AnimatePresence` transition. Components remount → re-read `pathname`.
3. **Resize**: `<1024px` switches between desktop/mobile header variants.
4. **Unmount**: Clean up pointer event listeners (swipe). Remove active states.

## Dependencies

- `react-router-dom` — `useLocation()`, `navigate()`.
- `motion` v12 — `motion.button`, `AnimatePresence`, spring transitions.
- `useTheme()` — theme toggle binding.
- `LanguageProvider` — language toggle binding.

## Extension Points

- **Add nav item**: Add entry to the nav link array in `SiteHeader`. Map to route path.
- **New gesture**: Extend `useSwipeNavigation` with new axis or threshold options.
- **Analytics**: Add `navigate()` wrapper to log route changes.
