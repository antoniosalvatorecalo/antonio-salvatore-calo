# Animation Architecture

> GSAP for scroll/timelines, Motion for gestures/springs. Reduced motion respected at every layer.
> Owner: Engineering

---

## Contents

1. [GSAP Setup](#1-gsap-setup)
2. [ScrollTrigger Lifecycle](#2-scrolltrigger-lifecycle)
3. [Reduced Motion Handling](#3-reduced-motion-handling)
4. [Page Transitions](#4-page-transitions)
5. [Scroll Reveals](#5-scroll-reveals)
6. [Performance Constraints](#6-performance-constraints)
7. [Rules for Adding New Animations](#7-rules-for-adding-new-animations)

---

## 1. GSAP Setup

**File**: `src/lib/gsap-setup.ts`

Single canonical initialization point. Called when a scroll-dependent module first loads. Defers the GSAP chunk until it is actually needed.

```typescript
export function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({
    nullTargetWarn: false,
    units: { left: "px", top: "px", rotation: "deg" },
  });
  // Multi-stage refresh — see §2
}
```

### Rules

- **One registration**: `gsap.registerPlugin(ScrollTrigger)` is called here and nowhere else. No file imports GSAP directly from npm — all go through `gsap-setup.ts`.
- **Exports**: `gsap` and `ScrollTrigger` re-exported for consumers.

### Engine Split Summary

| Engine | When | What |
|--------|------|------|
| GSAP | Scroll-linked reveals, timeline sequences, project page text sync | `gsap.to()`, `gsap.from()`, `gsap.timeline()`, `ScrollTrigger` |
| Motion | Route transitions, hover magnetics, theme icon swap | `motion.div`, `AnimatePresence`, `useSpring`, `useTransform` |

**Never mix GSAP and Motion on the same element.** Pick one per animation.

---

## 2. ScrollTrigger Lifecycle

### Creation

ScrollTrigger instances are created via:

- `useEntranceReveal` hook — generic blur + y reveals
- `ProjectBrutalistLayout` GSAP context — `data-split`, `data-fade`, `data-cta`, media stacks
- `useProjectTextScroll` — image section index tracking

Every ScrollTrigger specifies a `scroller` — bound to the column container, never `window`.

```typescript
ScrollTrigger.create({
  trigger: el,
  scroller: columnRef,  // NOT window
  start: 'top 90%',
  once: true,
  invalidateOnRefresh: true,
});
```

### Multi-Stage Refresh

ScrollTrigger positions are recalculated at:

| Timing | Trigger | Location |
|--------|---------|----------|
| Module init | `requestAnimationFrame` | `initGSAP()` |
| Window load | `window.addEventListener('load')` | `initGSAP()` |
| After content mount | `ScrollTrigger.refresh()` | Layout effects |
| On resize | `invalidateOnRefresh: true` | Each ScrollTrigger config |

### Scoped Cleanup

Every ScrollTrigger is killed on unmount, scoped to its container:

```typescript
const ctx = gsap.context(() => {
  gsap.to(targets, { ... });
  ScrollTrigger.create({ ... });
}, container);
return () => ctx.revert();
```

`gsap.context()` wraps all GSAP calls — `ctx.revert()` kills all tweens/triggers in the context.

### Key Files & Their ScrollTrigger Roles

| File | Role |
|------|------|
| `src/lib/gsap-setup.ts` | Plugin registration, multi-stage refresh orchestration |
| `src/hooks/useEntranceReveal.ts` | Generic scroll-reveal hook (blur + y) |
| `src/hooks/useProjectTextScroll.ts` | Image section index tracking |
| `src/layouts/ProjectBrutalistLayout.tsx` | Text split, fade, CTA, media stack reveals |

---

## 3. Reduced Motion Handling

Four-layer cascade. All animations respect `prefers-reduced-motion`.

### Layer 1: CSS Global Override

```css
html[data-motion="reduced"] *,
html[data-motion="reduced"] *::before,
html[data-motion="reduced"] *::after {
  scroll-behavior: auto;
  transition-duration: 0.01ms;
  transition-delay: 0ms;
  animation-duration: 0.01ms;
  animation-iteration-count: 1;
}
```

### Layer 2: MotionConfig

`MotionPreferenceProvider` wraps affected pages in `<MotionConfig reducedMotion="always">` when the OS preference is detected. All `motion.div` transitions automatically skip.

### Layer 3: GSAP `gsap.set()`

Components check `useReducedMotionPreference()`. If reduced, call `gsap.set()` to the final state instead of `gsap.to()`:

```typescript
// reduced-motion.ts utility
export const runOrSetFinal = (reducedMotion, targets, finalState, animate) => {
  if (reducedMotion) {
    gsap.set(targets, { ...finalState, duration: 0 });
    return;
  }
  animate();
};
```

Applied in:

- `PortfolioLayout` — gallery entrance jumps to final state
- `ProjectBrutalistLayout` — all scroll reveals skip to final opacity/position
- `useEntranceReveal` — targets set to final state, `COMPLETE_CLASS` added

### Layer 4: `MotionPreferenceProvider` Live Listener

```typescript
const query = window.matchMedia('(prefers-reduced-motion: reduce)');
query.addEventListener('change', (event) => setReducedMotion(event.matches));
```

Writes `data-motion` attribute on `<html>`. The CSS layer responds immediately. Components re-render with `true`/`false`.

### Policy

- Reduced motion = instant transitions. No fade, no blur, no stagger, no 3D transforms.
- Skip functionality is never degraded — skip link, keyboard nav, theme toggle all unaffected.

---

## 4. Page Transitions

**File**: `src/providers/AppRouter.tsx`

### Mechanism

`AnimatePresence mode="wait"` wraps `<Routes>`. Each route = `<motion.div>` keyed by `location.pathname`.

```typescript
const routeMotion = {
  initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
  animate: { opacity: 1 },
  exit: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
  transition: prefersReducedMotion
    ? instantTransition
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
};
```

### Behavior

| Navigation type | Effect |
|-----------------|--------|
| Home → Project | Fade out (0.25s) → Fade in (0.25s). `mode="wait"` ensures exit completes before enter. |
| Project → Project | Same fade crossfade. |
| Reduced motion | Instant swap — no fade. |

### Route Keys

Each route has an explicit `key` string:

```
"home", "bugonia", "bugonia-credits", "newsquest", "newsquest-credits", "contact"
```

Credits sub-routes render the same component as the parent but with a different key for `AnimatePresence` tracking.

### Suspense Boundary

Lazy-loaded routes are wrapped in `<Suspense fallback={null}>`. No loading skeleton — route transition covers the visual gap during chunk load.

---

## 5. Scroll Reveals

### `useEntranceReveal` Hook

**File**: `src/hooks/useEntranceReveal.ts`

Generic scroll-reveal. Accepts a selector for target elements. GSAP blur + translateY.

```typescript
useEntranceReveal(containerRef, {
  selector: '[data-entrance-item]',
  stagger: 0.08,
  duration: 0.72,
  y: 18,
  blur: 10,
  once: true,
  start: 'top 85%',
  scrollerRef: rightColumnRef,  // For project pages — different scroller
});
```

**Multi-phase support:**

```typescript
useEntranceReveal(containerRef, {
  phases: [
    { selector: '.title', y: 24, blur: 8, stagger: 0.03 },
    { selector: '.description', y: 16, blur: 4, stagger: 0.05, at: '>-0.1' },
  ],
});
```

Each phase can specify an `at` position parameter for fine-grained timeline control.

**Smart target filtering**: Skips elements with `data-entrance-skip`, `.entrance-reveal-complete`, `.entry-reveal-done`, or `.reveal-complete` classes. Prevents double-animation on re-render.

### Project Page Scroll Reveals

**File**: `src/layouts/ProjectBrutalistLayout.tsx` GSAP context

Five reveal types, all bound to the right-column scroller:

| Selector | Animation | Trigger |
|----------|-----------|---------|
| `[data-split]` | blur(10px)→0, y:40→0, stagger 0.03, duration 0.8 | `top 70%` |
| `[data-fade]` | blur(10px)→0, y:15→0, duration 0.8 | `top 85%` |
| `[data-cta]` | y:20→0, delay 0.4, duration 0.8 | `top 85%` |
| `.media-stack-item-0/1` | y:24, scale 0.985→1, stagger 0.08, duration 0.72 | `top 88%` |
| `[data-section-reveal="paragraph"]` | blur(10px)→0, y:15→0, delay 0.4, duration 1.2 | `top 70%` |

**Text splitting**: `[data-split]` splits text into `<span.split-word>` elements, wraps each in an overflow-hidden parent. GSAP animates the inner spans.

**Cleanup**: All wrapped in `gsap.context()`. `ctx.revert()` on unmount kills all tweens.

### Project Text Scroll Sync

**File**: `src/hooks/useProjectTextScroll.ts`

Tracks which image section is visible in the right column. Updates `visibleIdx` state → left-column text highlights the corresponding section.

300ms init delay to allow React ref population. ScrollTrigger `onEnter`/`onLeaveBack` tracks the index. Cleanup kills triggers + reverts context.

### Motion Easing Constants

**File**: `src/motion/constants/easing.ts`

```typescript
EASE_PREMIUM = [0.16, 1, 0.3, 1];     // Standard ease (page transitions, exits)
EASE_CINEMATIC = [0.85, 0, 0.15, 1];   // Dramatic ease-out
SPRING_SNAPPY = { stiffness: 400, damping: 30 };
SPRING_CURSOR = { stiffness: 150, damping: 15 };
```

---

## 6. Performance Constraints

### GPU-Accelerated Properties Only

Animations are limited to `transform`, `opacity`, `filter`. Never animate `width`, `height`, `top`, `left`, `margin`, `padding` — these trigger layout recalculations.

### `will-change` Is Temporary

```typescript
gsap.set(targets, { willChange: 'opacity, transform, filter' });
// ... animation completes
gsap.set(targets, { clearProps: 'willChange' });  // Or via clearProps in tween config
```

Cleared on:

- Gallery entrance: `clearProps: 'willChange'` in the timeline `onComplete`
- Project page reveals: `clearProps: 'transform,willChange'` in each `.from()` tween
- `useEntranceReveal`: `clearProps: 'willChange'` in the `finalState` object

### No `!important` on Animated Properties

GSAP writes inline styles. `!important` in CSS prevents GSAP from overriding. Never use `!important` on `transform`, `opacity`, `filter`, or any property GSAP animates.

### GSAP Context Scoping

Every animation group is wrapped in `gsap.context()` with a container ref. On unmount, `ctx.revert()` kills all tweens/triggers. Prevents:

- Memory leaks (stale tweens holding element references)
- Ghost animations after route transitions
- Multiple ScrollTriggers after StrictMode double-mount

### Bundle Size

| Library | Size | Loaded |
|---------|------|--------|
| GSAP + ScrollTrigger | ~114 kB | Deferred until first scroll-dependent component mounts |
| Motion | Bundled in app chunk | Always loaded |

No `opacity-only` reveals — the system intentionally uses blur + y to maintain edge definition during motion (CSS anti-aliasing benefit).

---

## 7. Rules for Adding New Animations

### 7.1 Choose the Right Engine

| If you want... | Use... |
|----------------|--------|
| Scroll-linked animation | GSAP + ScrollTrigger |
| Timeline sequence with precise stagger | GSAP timeline |
| 3D transforms | GSAP (Motion spring 3D has perf issues) |
| Spring physics | Motion (`useSpring`, `whileHover`) |
| Gesture response (hover, drag, tap) | Motion (`whileHover`, `whileTap`) |
| Route transition | Motion + AnimatePresence |
| Blur + y cascade reveal | `useEntranceReveal` hook |

### 7.2 Follow This Pattern

**GSAP animation**:

1. Wrap in `gsap.context(() => { ... }, containerRef.current)`
2. Add `ScrollTrigger.create()` or `gsap.to()` inside the context
3. Return cleanup: `() => ctx.revert()`
4. Set `scroller` param — never use default (window)
5. Add `invalidateOnRefresh: true` for resize safety
6. Set `willChange` before animation start
7. Clear `willChange` via `clearProps` on complete

**Motion animation**:

1. Import `useReducedMotionPreference()`
2. Use `instantTransition` when `prefersReducedMotion` is true
3. Use shared easing constants from `easing.ts` (no inline cubic-bezier)
4. Keep spring config in shared constants if reused

### 7.3 Reduced Motion Checklist

Every new animation must handle reduced motion:

- [ ] CSS override covered by `html[data-motion="reduced"]`?
- [ ] Motion component checks `useReducedMotionPreference()`?
- [ ] GSAP component calls `runOrSetFinal()` or `gsap.set()` to final state?
- [ ] Animation duration 0 / instant when reduced?
- [ ] Stagger set to 0 when reduced?

### 7.4 Performance Checklist

- [ ] Animating only `transform`, `opacity`, `filter`?
- [ ] `willChange` set before animation and cleared after?
- [ ] Wrapped in `gsap.context()` for cleanup?
- [ ] No `!important` on animated CSS properties?
- [ ] `scroller` param set for all ScrollTriggers?
- [ ] Prefers `invalidateOnRefresh: true` over manual refresh?

### 7.5 Extension Points

| Goal | Action |
|------|--------|
| New scroll reveal type | Add to `useEntranceReveal` with a new selector, or add a data attribute to `ProjectBrutalistLayout` GSAP context. |
| New easing curve | Add to `easing.ts`. Import in the component. |
| Per-breakpoint animation | Use GSAP `matchMedia()` for responsive timeline changes. |

### 7.6 What Not To Do

- **Don't** call `gsap.registerPlugin()` anywhere except `gsap-setup.ts`.
- **Don't** use `createBrowserRouter` — breaks AnimatePresence.
- **Don't** use `visibility:hidden` — let AnimatePresence handle.
- **Don't** call hooks inside GSAP callbacks, MutationObservers, or Lenis init.
- **Don't** animate layout-triggering properties (width, height, top, left).
- **Don't** mix GSAP and Motion on the same element.
- **Don't** store animation progress in React state — use GSAP timelines or refs.

---

## Cross-References

- [Scrolling system](../systems/scrolling.md) — Lenis + ScrollTrigger sync
- [Reduced motion helper](../systems/shared-utilities.md) — `runOrSetFinal`
- [Engineering rules](../engineering/rules.md) — z-index, critical rules
