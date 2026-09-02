# Shared Utilities

**Files**: Hooks, lib, providers, motion constants | **Owner**: Engineering

## Providers

```
MotionPreferenceProvider → ScrollProvider → ThemeProvider → BrowserRouter
```

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

## Animation Hooks

### useSmoothScroll
**File**: `src/hooks/animation/useSmoothScroll.ts`

Per-column Lenis lifecycle. See [scrolling system](scrolling.md).

### useEntranceReveal
**File**: `src/hooks/animation/useEntranceReveal.ts`

GSAP scroll-reveal (blur + translateY). Accepts selector, stagger, phases array. See [animations system](animations.md).

## Navigation Hooks

### useSwipeNavigation
**File**: `src/hooks/navigation/useSwipeNavigation.ts`

Pointer-event swipe detection. Axis-locked. 50px threshold. See [navigation system](navigation.md).

## Lib Utilities

### lenis-manager
**File**: `src/lib/lenis-manager.ts`

Singleton `Map<HTMLElement, LenisBinding>`. Functions: `initLenis`, `getLenisInstance`, `refreshAllLenises`, `destroyLenis`. GSAP ticker bridge + scroll → ScrollTrigger sync. See [scrolling system](scrolling.md).

### gsap-setup
**File**: `src/lib/gsap-setup.ts`

Single canonical `initGSAP()` — registers ScrollTrigger plugin. Multi-stage refresh (rAF + load event). Called when `useSmoothScroll` module loads.

## Motion Constants

**File**: `src/motion/constants/easing.ts`

```typescript
EASE_PREMIUM = [0.16, 1, 0.3, 1];       // Standard ease
EASE_CINEMATIC = [0.85, 0, 0.15, 1];    // Dramatic ease-out
SPRING_SNAPPY = { stiffness: 400, damping: 30 };
SPRING_MAGNETIC = { stiffness: 150, damping: 15, mass: 0.1 };
SPRING_CURSOR = { stiffness: 150, damping: 15 };
```

## Animation Presets

**File**: `src/motion/presets/presets.ts`

```typescript
default: { y: 24, blur: 10, duration: 0.9, ease: 'power4.out' }
soft:    { y: 16, blur: 6,  duration: 1.1, ease: 'power3.out' }
sharp:   { y: 32, blur: 14, duration: 0.7, ease: 'power4.inOut' }
```

## AnimationOrchestrator

**File**: `src/animations/orchestrator.ts`

Module-level state machine. `Map<SectionId, SectionState>` — not React state. 5 sections in order. Functions: `markVisible`, `markComplete`, `registerPlayFn`, `reset`, `_canPlay`. See [animations system](animations.md).

## Debug Logging

**File**: `src/lib/logMotionDev.ts`

```typescript
logMotionDev('useSmoothScroll', 'lenis-init-success');
logMotionDev('lenis-manager', 'init-created-instance', { activeInstances });
```

Only logs in dev mode (`import.meta.env.DEV`). Scoped tags for filtering.

## Shared Patterns

### Ref Patterns
| Ref | Where | Purpose |
|-----|-------|---------|
| `initializedRef` | useSmoothScroll | StrictMode double-init guard |
| `isMountedRef` | useSmoothScroll, ProjectBrutalistLayout | Prevent state update after unmount |
| `observerRef` | useSmoothScroll | MutationObserver cleanup |
| `startX/Y` | useSwipeNavigation | Touch start tracking |

### Module-Level Flags
```typescript
// App.tsx — skip entrance on back-nav
let hasInitiallyLoaded = false;
// lenis-manager.ts — instance cache
const lenisInstances = new Map<HTMLElement, LenisBinding>();
```

### Data Attributes
| Attribute | System | Purpose |
|-----------|--------|---------|
| `data-section` | AnimationOrchestrator | Section identity |
| `data-split` / `data-fade` | ProjectBrutalistLayout | Scroll reveal triggers |
| `data-stagger` (medium/shallow) | CSS animations | Left column stagger |
| `data-entrance-item` | useEntranceReveal | Scroll reveal targets |
| `data-project-stack` | LayoutSplitTextMediaStack | Media stack reveal |
| `data-scroll-sentinel` | Project credits | Scroll position tracking |

## Lifecycle Rules

1. No hooks inside GSAP callbacks, MutationObserver callbacks, or Lenis init
2. No hooks inside `setTimeout` or `requestAnimationFrame`
3. All `gsap.context()` scoped to component container for cleanup
4. `will-change` added before animation, cleared after via `clearProps`
5. Ref values for frequently-changing state (never React state for animation progress)

## Extension Points

- **New hook**: Place in `src/hooks/` subdirectory (animation/, navigation/, theme/). Follow ref pattern
- **New lib**: Place in `src/lib/`. Should be pure functions or singletons — no React
- **New provider**: Wrap inside existing provider tree. Follow `MotionPreferenceProvider → ScrollProvider → ThemeProvider` order
- **New motion constant**: Add to `src/motion/constants/`. Import in components
- **New animation preset**: Add to `presets.ts`. Use via `useEntranceReveal` config
