# Shared Utilities

**Files**: Hooks, lib, providers, motion constants | **Owner**: Engineering

## Providers

The provider tree is split between top-level and per-page providers:

```
LanguageProvider (top-level) → BrowserRouter
└── per-page:
    ├── MotionPreferenceProvider   (mounted where reduced motion matters)
    ├── ScrollProvider             (refs + responsive state only)
    ├── ThemeProvider              (mounted where theme toggle is exposed)
    └── FilterProvider             (local to PortfolioLayout)
```

### LanguageProvider

**File**: `src/providers/LanguageProvider.tsx`

The only top-level provider. Provides `useLanguage()` for the active UI language (Italian / English) and a toggle.

### MotionPreferenceProvider

**File**: `src/providers/MotionPreferenceProvider.tsx`

Detects OS `prefers-reduced-motion`. Sets `data-motion="reduced|full"` on `<html>`. Provides `useReducedMotionPreference()` hook. Subscribes to live MediaQueryList changes.

**CSS impact**:

```css
html[data-motion="reduced"] * {
  transition-duration: 0.01ms !important;
  animation-duration: 0.01ms !important;
}
```

### ScrollProvider

**File**: `src/providers/ScrollProvider.tsx`

Holds refs (`leftScrollRef`, `rightScrollRef`), `isDesktop`/`isTablet` state, `activeTab`. No scroll logic — refs only. Responsive state updated via RAF-throttled resize listener.

### ThemeProvider

**File**: `src/providers/ThemeProvider.tsx` (via `useTheme`)

Reads localStorage + OS fallback. Sets `data-theme` attribute. Persists toggle.

### FilterProvider

**File**: `src/providers/FilterProvider.tsx`

Local to `PortfolioLayout`. Owns home gallery filter state consumed by `ProjectGrid`, `ProjectListRow`, and friends.

## Animation Hooks

### useEntranceReveal

**File**: `src/hooks/useEntranceReveal.ts`

GSAP scroll-reveal (blur + translateY). Accepts selector, stagger, phases array. See [animations system](animations.md).

### useProjectTextScroll

**File**: `src/hooks/useProjectTextScroll.ts`

Tracks the active image section in `ProjectBrutalistLayout`'s right column. Drives `ScrollingProjectText` highlight state.

## Navigation Hooks

### useSwipeNavigation

**File**: `src/hooks/useSwipeNavigation.ts`

Pointer-event swipe detection. Axis-locked. 50px threshold. See [navigation system](navigation.md).

## Lib Utilities

### lenis-manager

**File**: `src/lib/lenis-manager.ts`

Singleton `Map<HTMLElement, LenisBinding>`. Functions: `initLenis`, `getLenisInstance`, `refreshAllLenises`, `destroyLenis`. GSAP ticker bridge + scroll → ScrollTrigger sync. See [scrolling system](scrolling.md).

### gsap-setup

**File**: `src/lib/gsap-setup.ts`

Single canonical `initGSAP()` — registers ScrollTrigger plugin. Multi-stage refresh (rAF + load event). Called when a scroll-dependent module first loads.

### reduced-motion

**File**: `src/lib/reduced-motion.ts`

`runOrSetFinal(reducedMotion, targets, finalState, animate)` — standard helper used by GSAP reveal code to skip animations when reduced motion is active.

## Motion Constants

**File**: `src/motion/constants/easing.ts`

```typescript
EASE_PREMIUM = [0.16, 1, 0.3, 1];       // Standard ease
EASE_CINEMATIC = [0.85, 0, 0.15, 1];    // Dramatic ease-out
SPRING_SNAPPY = { stiffness: 400, damping: 30 };
SPRING_CURSOR = { stiffness: 150, damping: 15 };
```

## Debug Logging

**File**: `src/lib/logMotionDev.ts`

```typescript
logMotionDev('lenis-manager', 'init-created-instance', { activeInstances });
logMotionDev('lenis-manager', 'refresh-all-instances', { activeInstances });
```

Only logs in dev mode (`import.meta.env.DEV`). Scoped tags for filtering.

## Shared Patterns

### Ref Patterns

| Ref | Where | Purpose |
|-----|-------|---------|
| `initializedRef` | layout-local Lenis init | StrictMode double-init guard |
| `isMountedRef` | layout-local Lenis init, `ProjectBrutalistLayout` | Prevent state update after unmount |
| `observerRef` | layout-local Lenis init | MutationObserver cleanup |
| `startX/Y` | `useSwipeNavigation` | Touch start tracking |

### Module-Level Flags

```typescript
// lenis-manager.ts — instance cache
const lenisInstances = new Map<HTMLElement, LenisBinding>();
```

### Data Attributes

| Attribute | System | Purpose |
|-----------|--------|---------|
| `data-split` / `data-fade` | `ProjectBrutalistLayout` | Scroll reveal triggers |
| `data-stagger` (medium/shallow) | CSS animations | Section content stagger |
| `data-entrance-item` | `useEntranceReveal` | Scroll reveal targets |
| `data-project-stack` | `ProjectSection` | Media stack reveal |
| `data-scroll-sentinel` | Project credits | Scroll position tracking |

## Lifecycle Rules

1. No hooks inside GSAP callbacks, MutationObserver callbacks, or Lenis init.
2. No hooks inside `setTimeout` or `requestAnimationFrame`.
3. All `gsap.context()` scoped to component container for cleanup.
4. `will-change` added before animation, cleared after via `clearProps`.
5. Ref values for frequently-changing state (never React state for animation progress).

## Extension Points

- **New hook**: Place in `src/hooks/`. Follow ref pattern.
- **New lib**: Place in `src/lib/`. Should be pure functions or singletons — no React.
- **New provider**: Mount at the page/layout that needs it. Do not promote to top-level without an explicit reason — `LanguageProvider` stays the only global provider.
- **New motion constant**: Add to `src/motion/constants/`. Import in components.
