# Navigation & Theming

> Navigation components, gesture handling, and theme system for the Antonio Salvatore Calò portfolio.
> Owner: Engineering

---

## 1. Navigation Overview

The application has three distinct navigation layers:

| Layer | Desktop | Mobile/Tablet |
|-------|---------|---------------|
| **Global navigation** | CentralNavMenu (magnetic hover effects) | MobileBottomNav (fixed bottom bar) |
| **Project page nav** | Inline sidebar links + browser back | ProjectMobileNav (floating tabs) |
| **Swipe gestures** | Not used | useSwipeNavigation (page-to-page) |

All navigation follows route-derived state — the current pathname determines which nav items are active.

---

## 2. CentralNavMenu (Desktop)

**File:** `src/components/ui/CentralNavMenu.tsx`

### Layout

Positioned as a fixed header in the left column, containing:

- **Logo/wordmark**: "MF" with hover opacity transition
- **Nav links**: Home → Work → Studio → Contact
- **Theme toggle**: Integrated toggle for light/dark mode

### Magnetic Hover Effect

Each nav item uses Motion `whileHover` with spring-based magnetic pull:

```typescript
const SPRING_MAGNETIC: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 15,
  mass: 0.1,
};
```

The `magnetic-btn` component responds to cursor proximity with subtle x/y offsets, giving the UI a responsive, almost alive quality.

### Active State

Active link is determined by route matching via `useLocation()`. The active item receives inverted text color (white-on-black in dark mode, black-on-white in light mode) with a background highlight.

### Theme Toggle

Binds directly to `useTheme()`:
- Toggles between `'dark'` and `'light'`
- Icon swaps between sun and moon via `AnimatePresence mode="wait"`
- Icon rotation: `rotate: useReducedMotionPreference() ? 0 : 180`

---

## 3. MobileBottomNav (Mobile/Tablet)

**File:** `src/components/ui/MobileBottomNav.tsx`

### Layout

Fixed bottom navigation bar appearing below 1024px. Contains 5 tabs:

```
[Home] [Work] [Studio] [Contact] [Theme]
```

- Each tab is a `motion.button` with hover/tap scale
- Active tab has a filled background indicator
- Theme toggle is integrated as the last tab
- The entire bar sits at `z-index: 20` (below the skip link, above all content)

### Interaction

| Action | Behavior |
|--------|----------|
| Tap tab | Navigate via `navigate(path)` |
| Tap active tab | No-op (already on that page) |
| Tap theme | Toggles dark/light mode |
| Hover | `whileHover: { scale: 1.05 }` |

### Route Safety

Tab paths are mapped directly to route paths. The component uses `useLocation().pathname` to determine active state. The theme button is excluded from active matching.

---

## 4. ProjectMobileNav (Mobile/Tablet — Project Pages)

**File:** `src/components/ui/ProjectMobileNav.tsx`

### Layout

Floating tab bar at the bottom of project pages on mobile/tablet. Contains scrollable tabs representing project sections:

```
[Overview] [Process] [Design] [Development] [Results] [Next →]
```

- Each tab is a `motion.button`
- Horizontal scroll via `overflow-x: auto` with `scroll-snap-type: x mandatory`
- Active tab has an underline indicator (`scaleX` animated from 0→1 via Motion)
- The `Next Project →` tab navigates to the next project in the registry

### Active Section Tracking

```typescript
const { activeSection, setActiveSection } = useScrollerContext();
```

Syncs with the `ScrollerContext` from `ProjectBrutalistLayout` — when the user scrolls to a section, the corresponding tab becomes active. When the user taps a tab, it scrolls to that section (or navigates, in the case of "Next").

---

## 5. Swipe Navigation (Mobile/Tablet)

**File:** `src/hooks/navigation/useSwipeNavigation.ts`

### Purpose

Enables swipe-left and swipe-right gestures for navigating between projects on mobile/tablet.

### Signature

```typescript
useSwipeNavigation(containerRef, {
  enabled: true,
  threshold: 50,                // Minimum px to trigger
  axis: 'x',                     // Lock to horizontal
  onSwipedLeft: () => navigate(nextPath),
  onSwipedRight: () => navigate(prevPath),
});
```

### Implementation

Uses pointer events (not touch events) for broad device compatibility:

```typescript
const handlePointerDown = (e: PointerEvent) => {
  startX.current = e.clientX;
  startY.current = e.clientY;
  isDragging.current = true;
  container.setPointerCapture(e.pointerId);
};

const handlePointerUp = (e: PointerEvent) => {
  if (!isDragging.current) return;
  const dx = e.clientX - startX.current;
  const dy = e.clientY - startY.current;
  
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
    if (dx > 0) onSwipedRight();
    else onSwipedLeft();
  }
  isDragging.current = false;
};
```

**Axis locking**: Only triggers when horizontal distance (`dx`) exceeds vertical distance (`dy`). This prevents vertical scrolling from accidentally triggering navigation.

### Used In

- `ProjectBrutalistLayout` — swipe between projects on mobile
- Not active on desktop (no desktop navigation via swipe)

---

## 6. Theme System

**File:** `src/hooks/theme/useTheme.ts`

### Architecture

```
User preference → localStorage persistence → ThemeContext → data-theme attribute → CSS variables
```

### Data Flow

1. **Initial load**: reads from `localStorage` (`ThemeContext` key)
   - Found: applies stored preference
   - Not found: reads `prefers-color-scheme` OS preference
2. **Toggle**: sets new theme → persists to localStorage → updates `data-theme` attribute on `<html>`
3. **CSS variables**: theme tokens are defined as CSS custom properties on `[data-theme="dark"]` and `[data-theme="light"]`

### Theme Toggle

```typescript
const { theme, toggleTheme } = useTheme();
// theme: 'dark' | 'light'
// toggleTheme: () => void
```

Available via context from `ThemeProvider` (wrapped in `ScrollProvider`).

### Visual Tokens

| Token | Dark | Light |
|-------|------|-------|
| `--color-bg` | `oklch(0.13 0.005 300)` | `oklch(0.96 0.005 300)` |
| `--color-text` | `oklch(0.92 0.005 300)` | `oklch(0.15 0.005 300)` |
| `--color-muted` | `oklch(0.39 0.008 300)` | `oklch(0.56 0.008 300)` |
| `--color-ui-border` | `oklch(0.22 0.008 300)` | `oklch(0.82 0.008 300)` |

All theme values use the OKLCH color space for perceptual uniformity.

### Glass Nav

Both nav components use a semi-transparent background with backdrop blur:

```css
background: rgba(var(--color-bg-rgb), 0.85);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

This gives the nav a frosted glass effect that adapts to both themes.

### Reduced Motion

Theme toggle icon rotation is disabled when `prefers-reduced-motion` is active:

```typescript
animate={{ rotate: reducedMotion ? 0 : theme === 'dark' ? 180 : 0 }}
```

---

## 7. Navigation Patterns

### Route-Driven Active State

All navigation components derive their active state from `useLocation().pathname`. There is no separate "current nav" React state:

```typescript
const location = useLocation();
const isActive = (path: string) => location.pathname === path;
```

### Navigation without Re-renders

Navigation between project pages uses `navigate()` from react-router-dom, which triggers a route transition via `AnimatePresence`. The `AppRouter` handles this transition cleanly — the exiting page fades out, and the entering page fades in.

### Skip Link

A visually hidden skip-to-content link is the first focusable element on the page:

```css
z-index: 999;  /* Highest z-index in the system */
```

Triggered by keyboard tab — visible on focus, hidden otherwise.

---

## 8. Cross-References

- [Architecture overview](architecture.md) — Route transition flow, component hierarchy
- [Routing and pages](routing-and-pages.md) — Route definitions, transition behavior
- [Animation system](animation-system.md) — Magnetic hover, theme toggle icon animation
- [Responsive system](responsive-system.md) — Three-tier mobile/tablet/desktop nav behavior
- [Layouts](layouts.md) — Column layout and project page structure
