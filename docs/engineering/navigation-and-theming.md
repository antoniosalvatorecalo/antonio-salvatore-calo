# Navigation & Theming

> Navigation components, gesture handling, theme system, and language switch.
> Owner: Engineering

---

## 1. Navigation Overview

The application has one global navigation layer plus project-page gestures:

| Layer | Desktop | Mobile/Tablet |
|-------|---------|---------------|
| **Global navigation** | `SiteHeader` (top header) | `SiteHeader` (top header) |
| **Project page nav** | Inline sidebar links + browser back | `useSwipeNavigation` (page-to-page) |

All navigation follows route-derived state — the current pathname determines which nav items are active.

---

## 2. SiteHeader

**File:** `src/components/ui/SiteHeader.tsx`

### Layout

Top header rendered by `PortfolioLayout` (home) and the project layouts.

- **Logo/wordmark**: brand mark with hover opacity transition
- **Nav links**: Home → Work → Projects → Contact
- **Language toggle**: switches UI language via `LanguageProvider`
- **Theme toggle**: integrated toggle for light/dark mode (on layouts that mount `ThemeProvider`)

### Active State

Active link is determined by route matching via `useLocation()`. The active item receives inverted text color (white-on-black in dark mode, black-on-white in light mode) with a background highlight.

### Theme Toggle

Binds directly to `useTheme()`:

- Toggles between `'dark'` and `'light'`.
- Icon swaps between sun and moon via `AnimatePresence mode="wait"`.
- Icon rotation: `rotate: useReducedMotionPreference() ? 0 : 180`.

---

## 3. Swipe Navigation (Mobile/Tablet — Project Pages)

**File:** `src/hooks/useSwipeNavigation.ts`

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

- `ProjectBrutalistLayout` — swipe between projects on mobile.
- Not active on desktop.

---

## 4. Theme System

**File:** `src/hooks/useTheme.ts`

### Architecture

```
User preference → localStorage persistence → ThemeContext → data-theme attribute → CSS variables
```

### Data Flow

1. **Initial load**: reads from `localStorage`.
   - Found: applies stored preference.
   - Not found: reads `prefers-color-scheme` OS preference.
2. **Toggle**: sets new theme → persists to localStorage → updates `data-theme` attribute on `<html>`.
3. **CSS variables**: theme tokens are defined as CSS custom properties on `[data-theme="dark"]` and `[data-theme="light"]`.

### Theme Toggle

```typescript
const { theme, toggleTheme } = useTheme();
// theme: 'dark' | 'light'
// toggleTheme: () => void
```

Available via context from `ThemeProvider`, which is mounted per-page where the toggle is exposed.

### Visual Tokens

| Token | Dark | Light |
|-------|------|-------|
| `--color-bg` | `oklch(0.13 0.005 300)` | `oklch(0.96 0.005 300)` |
| `--color-text` | `oklch(0.92 0.005 300)` | `oklch(0.15 0.005 300)` |
| `--color-muted` | `oklch(0.39 0.008 300)` | `oklch(0.56 0.008 300)` |
| `--color-ui-border` | `oklch(0.22 0.008 300)` | `oklch(0.82 0.008 300)` |

All theme values use the OKLCH color space for perceptual uniformity.

### Reduced Motion

Theme toggle icon rotation is disabled when `prefers-reduced-motion` is active:

```typescript
animate={{ rotate: reducedMotion ? 0 : theme === 'dark' ? 180 : 0 }}
```

---

## 5. Language Switch

`SiteHeader` exposes a language toggle backed by `LanguageProvider`. Translations live alongside the content modules and are read via the `useLanguage()` hook.

---

## 6. Navigation Patterns

### Route-Driven Active State

All navigation components derive their active state from `useLocation().pathname`. There is no separate "current nav" React state:

```typescript
const location = useLocation();
const isActive = (path: string) => location.pathname === path;
```

### Navigation without Re-renders

Navigation between project pages uses `navigate()` from `react-router-dom`, which triggers a route transition via `AnimatePresence`. The `AppRouter` handles this transition cleanly — the exiting page fades out, and the entering page fades in.

### Skip Link

A visually hidden skip-to-content link is the first focusable element on the page:

```css
z-index: 999;  /* Highest z-index in the system */
```

Triggered by keyboard tab — visible on focus, hidden otherwise.

---

## 7. Cross-References

- [Architecture overview](architecture.md) — Route transition flow, component hierarchy
- [Routing and pages](routing-and-pages.md) — Route definitions, transition behavior
- [Animation system](animation-system.md) — Theme toggle icon animation
- [Responsive system](responsive-system.md) — Mobile/tablet/desktop behavior
- [Layouts](layouts.md) — Column layout and project page structure
