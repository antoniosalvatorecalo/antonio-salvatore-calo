# Scrolling System

> Smooth scroll architecture — Lenis per-column, ScrollTrigger integration, synchronization, and fallback behavior.
> Owner: Engineering

---

## 1. Architecture Overview

The scrolling system uses **Lenis** for smooth scroll interpolation with **GSAP ScrollTrigger** for scroll-linked animations. Each column owns its own Lenis instance — there is never a global Lenis instance.

### Three-Layer Scroll Architecture

```
┌───────────────────────────────────────────┐
│              React Component              │
│  (provides refs to DOM containers)        │
├───────────────────────────────────────────┤
│           useSmoothScroll hook            │
│  (lifecycle management, DOM readiness)    │
├───────────────────────────────────────────┤
│           lenis-manager (lib)             │
│  (singleton Map, GSAP ticker binding)     │
├───────────────────────────────────────────┤
│              Lenis instance               │
│  (scroll interpolation, velocity calc)    │
└───────────────────────────────────────────┘
```

### Key Files

| File | Role |
|------|------|
| `src/hooks/animation/useSmoothScroll.ts` | Per-column Lenis lifecycle hook |
| `src/lib/lenis-manager.ts` | Singleton Lenis manager (init, get, destroy, refresh) |
| `src/lib/gsap-setup.ts` | GSAP + ScrollTrigger registration |
| `src/providers/ScrollProvider.tsx` | Column refs held in context |

---

## 2. Module-Level Initialization

**File:** `src/hooks/animation/useSmoothScroll.ts`

```typescript
// Module level — runs once when module first imports
initGSAP();
```

GSAP + ScrollTrigger are registered when `useSmoothScroll` module first loads, not in `main.tsx`. This defers the 114 kB GSAP vendor chunk until a scroll-dependent component mounts.

---

## 3. Lenis Manager

**File:** `src/lib/lenis-manager.ts`

### Singleton Pattern

A module-level `Map<HTMLElement, LenisBinding>` stores Lenis instances keyed by wrapper element. This is StrictMode-safe — calling `initLenis` with the same wrapper reuses the existing instance.

```typescript
const lenisInstances = new Map<HTMLElement, LenisBinding>();
```

### Lenis Configuration

```typescript
const lenisInstance = new Lenis({
  wrapper,           // The outer scroll container
  content,           // The inner scroll content
  duration: 1.2,     // Scroll duration
  lerp: 0.1,         // Interpolation lerp
  smoothWheel: true, // Smooth mouse wheel
  infinite: false,   // Not infinite
});
```

### GSAP Ticker Bridge

Lenis is synchronized to GSAP's ticker rather than using its own RAF loop:

```typescript
const rafCallback = (time: number) => {
  lenisInstance.raf(time * 1000);
};
gsap.ticker.add(rafCallback);
```

This ensures Lenis and GSAP stay in sync — ScrollTrigger positions are calculated based on Lenis's scroll position, and both update on the same frame.

### Scroll → ScrollTrigger Update

```typescript
const offScroll = lenisInstance.on('scroll', () => {
  ScrollTrigger.update();
});
```

Every Lenis scroll event triggers `ScrollTrigger.update()` so GSAP animations stay in sync with the smooth scroll position.

### API

| Function | Purpose |
|----------|---------|
| `initLenis(wrapper, content)` | Creates or returns existing Lenis instance |
| `getLenisInstance(wrapper)` | Retrieves instance without creating |
| `refreshAllLenises()` | Calls `.resize()` on all instances |
| `destroyLenis(wrapper)` | Removes ticker, detaches scroll listener, destroys instance |

---

## 4. useSmoothScroll Hook

**File:** `src/hooks/animation/useSmoothScroll.ts`

### Signature

```typescript
function useSmoothScroll(
  wrapperRef: React.RefObject<HTMLElement | null>,
  { enabled = true }: SmoothScrollOptions = {},
)
```

### Lifecycle

1. **Mount check**: Guards with `initializedRef` to prevent double init in StrictMode
2. **DOM readiness**: Looks for `.scroll-content` inside wrapper
   - If found immediately → calls `doInit()`
   - If not found → sets up `MutationObserver` with 1500ms timeout fallback
3. **Init**: `initLenis(wrapper, content)` → ScrollTrigger.refresh()
4. **Cleanup**: On unmount, disconnects observer, clears timeout, calls `destroyLenis()`

### StrictMode Safety

```typescript
const initializedRef = useRef(false);
// ...
if (initializedRef.current) return;
initializedRef.current = true;
```

The ref persists across StrictMode double-invocation. Second mount attempt is silently skipped.

### DOM Readiness Fallback

If `.scroll-content` is not immediately available (content is lazy-rendered), the hook:

1. Logs a warning
2. Starts a `MutationObserver` watching the wrapper's `childList`
3. Sets a 1500ms timeout
4. On timeout: adds `lenis-fallback` class for native scroll behavior

```css
.lenis-fallback {
  scroll-behavior: smooth !important;
  overflow-y: auto !important;
}
```

### Column Usage

```typescript
// PortfolioLayout
useSmoothScroll(leftScrollRef, { enabled: effectsEnabled });
useSmoothScroll(rightScrollRef, { enabled: effectsEnabled });

// ProjectBrutalistLayout (desktop only — Lenis for right column)
// Uses lenis-manager directly, not the hook, since lifecycle is managed manually
initLenis(container, content);
```

---

## 5. ScrollTrigger Integration

### Deferred Refresh

ScrollTrigger refresh happens at multiple stages to ensure correct measurement:

1. **Module init**: `requestAnimationFrame` + `document.readyState === 'complete'` check
2. **After Lenis init**: Immediately after `initLenis()` call
3. **After 200ms delay**: Another refresh to catch layout shifts
4. **On resize**: ScrollTrigger handles this internally with `invalidateOnRefresh: true`

### Per-Component ScrollTrigger

Each component creates scoped ScrollTriggers:

```typescript
// ProjectBrutalistLayout — scoped to right column
ScrollTrigger.create({
  trigger: el,
  scroller: container,  // The specific column, not window
  start: 'top 70%',
  once: true,
  invalidateOnRefresh: true,
});
```

The `scroller` parameter is critical — it ensures ScrollTrigger reads the correct container's scroll position, not the window.

### Cleanup Pattern

```typescript
// On unmount, kill only scoped triggers
ScrollTrigger.getAll().forEach(st => {
  if (st.vars.scroller === container) st.kill();
});
ScrollTrigger.refresh();
```

---

## 6. Column Scroll Synchronization

### PortfolioLayout (Home)

- Left column: About sections, scroll cascade (AnimationOrchestrator)
- Right column: Project cards, independent scroll
- Columns **do not** synchronize scroll position — each is independent
- After project cards mount: `refreshAllLenises()` + `ScrollTrigger.refresh()` ensures correct height calculations

### ProjectBrutalistLayout (Project Pages)

- Left column: Metadata + `ScrollingProjectText` (GSAP-animated, not scrollable)
- Right column: Main content with Lenis (desktop) or native scroll (mobile)
- `ScrollingProjectText` in the left column uses ScrollTrigger tied to the right column's scroller:
  ```typescript
  scrollTrigger: {
    trigger: sectionEl,
    scroller: rightColumnRef,  // Critical: synced to right column
    start: 'top bottom',
    end: 'bottom top',
  }
  ```
- Mouse wheel on left column is forwarded to right column Lenis via `handleSidebarWheel`

---

## 7. Refresh Triggers

All Lenis instances should be refreshed after:

| Event | Method | Location |
|-------|--------|----------|
| Project cards mount | `refreshAllLenises()` + `ScrollTrigger.refresh()` | PortfolioLayout effect |
| Mobile tab switch | `refreshAllLenises()` + `ScrollTrigger.refresh()` | PortfolioLayout effect |
| Project page tab switch | `ScrollTrigger.refresh()` | ProjectBrutalistLayout effect |
| Resize | Throttled via requestAnimationFrame | ScrollProvider resize handler |
| Route transition | Auto via component unmount/remount | Each layout's cleanup |

---

## 8. Fallback Strategy

If Lenis fails to initialize (e.g., `.scroll-content` missing, DOM not ready):

1. `lenis-fallback` class is added to the wrapper
2. Native scroll takes over with `smooth` behavior
3. A `CustomEvent('lenis-init-failed')` is dispatched for diagnostics

The `lenis-fallback` class provides:
```css
.lenis-fallback {
  scroll-behavior: smooth !important;
  overflow-y: auto !important;
}
```

---

## 9. Historical Context (Fixes)

| Fix | Issue | Resolution |
|-----|-------|-----------|
| FIX 5 | GSAP context attachment timing | Observers deferred after layout stabilization via requestAnimationFrame |
| FIX 16 | Global Lenis in ScrollProvider | Removed — moved to per-column useSmoothScroll |
| Scrollbar width | White space from scrollbar-gutter | Removed scrollbar-gutter, overflow: hidden on html/body, Lenis handles scroll |
| Project card flash | Cards visible before GSAP init | `.project-card-wrapper` starts `opacity:0; translateY(40px)` |

---

## 10. Trace Debugging

During development, scroll system events are logged via `logMotionDev`:

```typescript
logMotionDev('useSmoothScroll', 'lenis-init-success');
logMotionDev('useSmoothScroll', 'lenis-destroyed');
logMotionDev('lenis-manager', 'init-created-instance', { activeInstances });
logMotionDev('lenis-manager', 'refresh-all-instances', { activeInstances });
```

These only log in development mode (checked via `import.meta.env.DEV`).

---

## 11. Cross-References

- [Architecture overview](architecture.md) — Scroll isolation principle, rendering layers
- [Animation system](animation-system.md) — ScrollTrigger integration, GSAP context pattern
- [Layouts](layouts.md) — PortfolioLayout, ProjectBrutalistLayout scroll setup
- [State management](state-management.md) — ScrollProvider refs
- [Performance](performance-and-deployment.md) — Scroll performance, will-change strategy
