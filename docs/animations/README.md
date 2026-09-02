# Animation Architecture

> Two-engine system: GSAP for scroll/timelines, Motion for gestures/springs. Orchestrator for deterministic section cascade.
> Owner: Engineering

---

## Contents

1. [GSAP Setup](#1-gsap-setup)
2. [ScrollTrigger Lifecycle](#2-scrolltrigger-lifecycle)
3. [Reduced Motion Handling](#3-reduced-motion-handling)
4. [Page Transitions](#4-page-transitions)
5. [Preloader](#5-preloader)
6. [Scroll Reveals](#6-scroll-reveals)
7. [Performance Constraints](#7-performance-constraints)
8. [Rules for Adding New Animations](#8-rules-for-adding-new-animations)

---

## 1. GSAP Setup

**File**: `src/lib/gsap-setup.ts`

Single canonical initialization point. Called when `useSmoothScroll` module first loads — not in `main.tsx`. Defers GSAP 114 kB chunk until scroll-dependent component mounts.

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

- **One registration**: `gsap.registerPlugin(ScrollTrigger)` called here and nowhere else. No file imports GSAP directly from npm — all go through `gsap-setup.ts`.
- **initGSAP()** called at module level in `useSmoothScroll.ts`. Runs once per app lifetime.
- **Exports**: `gsap` and `ScrollTrigger` re-exported for consumers.

### Engine Split Summary

| Engine | When | What |
|--------|------|------|
| GSAP | Scroll-linked reveals, timeline sequences, section cascade, 3D card entrance | `gsap.to()`, `gsap.from()`, `gsap.timeline()`, `ScrollTrigger` |
| Motion | Route transitions, hover magnetics, theme icon swap, card scroll skew | `motion.div`, `AnimatePresence`, `useSpring`, `useTransform` |

**Never mix GSAP and Motion on same element.** Pick one per animation.

---

## 2. ScrollTrigger Lifecycle

### Creation

ScrollTrigger instances created via:
- `AnimationProvider` — left-column section cascade (4 standard sections)
- `useEntranceReveal` hook — generic blur + y reveals
- `ProjectBrutalistLayout` GSAP context — data-split, data-fade, data-cta, media stacks
- `useProjectTextScroll` — image section index tracking

Every ScrollTrigger specifies `scroller` param — bound to column container, never `window`.

```typescript
ScrollTrigger.create({
  trigger: el,
  scroller: columnRef,  // NOT window
  start: 'top 90%',
  once: true,
  invalidateOnRefresh: true,
  onEnter: () => orchestrator.markVisible(id),
});
```

### Multi-Stage Refresh

ScrollTrigger positions recalculated at:

| Timing | Trigger | Location |
|--------|---------|----------|
| Module init | `requestAnimationFrame` | `initGSAP()` |
| Window load | `window.addEventListener('load')` | `initGSAP()` |
| After Lenis init | Immediate call | `useSmoothScroll` → `initLenis()` |
| After 200ms | `setTimeout` | `lenis-manager` |
| After content mount | `refreshAllLenises()` | PortfolioLayout effect |
| After tab switch | `ScrollTrigger.refresh()` | PortfolioLayout effect |
| After GSAP context setup | `ScrollTrigger.refresh()` | ProjectBrutalistLayout |
| On resize | `invalidateOnRefresh: true` | Each ScrollTrigger config |

### Scoped Cleanup

Every ScrollTrigger killed on unmount, scoped to its container:

```typescript
// Method 1: Track and kill
const triggers: ScrollTrigger[] = [];
// ... create and push
return () => triggers.forEach(t => t.kill());

// Method 2: Filter by scroller
ScrollTrigger.getAll().forEach(st => {
  if (st.vars.scroller === container) st.kill();
});
ScrollTrigger.refresh();
```

`gsap.context()` wraps all GSAP calls — `ctx.revert()` kills all tweens/triggers in context:

```typescript
const ctx = gsap.context(() => {
  gsap.to(targets, { ... });
  ScrollTrigger.create({ ... });
}, container);
return () => ctx.revert();
```

### Key Files & Their ScrollTrigger Roles

| File | Role |
|------|------|
| `src/lib/gsap-setup.ts` | Plugin registration, multi-stage refresh orchestration |
| `src/animations/orchestrator.ts` | State machine (no ScrollTrigger here — pure logic) |
| `src/animations/AnimationProvider.tsx` | Creates ScrollTriggers for left-column sections |
| `src/hooks/animation/useEntranceReveal.ts` | Generic scroll-reveal hook (blur + y) |
| `src/hooks/animation/useProjectTextScroll.ts` | Image section index tracking |
| `src/layouts/ProjectBrutalistLayout.tsx` | Text split, fade, CTA, media stack reveals |
| `src/layouts/PortfolioLayout.tsx` | Project card 3D entrance (no ScrollTrigger — GSAP timeline) |

---

## 3. Reduced Motion Handling

4-layer cascade. All animations must respect `prefers-reduced-motion`.

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

`MotionPreferenceProvider` wraps app in `<MotionConfig reducedMotion="always">` when OS preference detected. All `motion.div` transitions automatically skip.

### Layer 3: GSAP `gsap.set()`

Components check `useReducedMotionPreference()`. If reduced, call `gsap.set()` to final state instead of `gsap.to()`:

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
- `PortfolioLayout` — project card entrance jumps to final state
- `ProjectBrutalistLayout` — all scroll reveals skip to final opacity/position
- `useEntranceReveal` — targets set to final state, `COMPLETE_CLASS` added

### Layer 4: `MotionPreferenceProvider` Live Listener

```typescript
const query = window.matchMedia('(prefers-reduced-motion: reduce)');
query.addEventListener('change', (event) => setReducedMotion(event.matches));
```

Writes `data-motion` attribute on `<html>`. CSS layer responds immediately. Components re-render with `true`/`false`.

### Policy

- Reduced motion = instant transitions. No fade, no blur, no stagger, no 3D transforms.
- Preloader: reduced motion = 1400ms min duration (vs 3200ms), no marquee/ConcentricRings, static text only.
- Skip functionality never degraded — skip link, keyboard nav, BackToTop all unaffected.

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
| Home → Project | Fade out (0.25s) → Fade in (0.25s). mode="wait" ensures exit completes before enter |
| Project → Project | Same fade crossfade |
| Back navigation | Same transition. `isFirstLoad` flag prevents preloader + GSAP entrance replay |
| Reduced motion | Instant swap — no fade |

### Route Keys

Each route has explicit `key` string:
```
"home", "work", "bugonia", "bugonia-credits", "newsquest", "newsquest-credits", "contact"
```

Credits sub-routes render same component as parent but with different key for AnimatePresence tracking.

### Suspense Boundary

Lazy-loaded routes wrapped in `<Suspense fallback={null}>`. No loading skeleton — route transition covers visual gap during chunk load.

---

## 5. Preloader

**File**: `src/components/effects/loaders/Preloader.tsx`

### Timing

| Variant | Min Duration | Loads |
|---------|-------------|-------|
| Desktop, full motion | 3200ms | Marquee rows (3 PreloaderLoop) |
| Desktop, reduced | 1400ms | Static "Antonio Salvatore Calò" text |
| Mobile/tablet, full motion | 1400ms | ConcentricRings (lazy-loaded) |
| Mobile/tablet, reduced | 1000ms | Static text |

### Critical Asset Wait

Preloader waits for:
1. Font loading (`document.fonts.ready`)
2. Critical images decode (hero + thumbnail: `/media/antonio-salvatore-calo.webp`, `/media/bugonia/Thumbnail.webp`)
3. 2800ms timeout — whichever finishes first

```typescript
Promise.allSettled([fontReady, assetReady]).then(() => undefined)
```

### Progress Bar

Fake progress: increments +2..9% every 110ms until 96%, jumps to 100% when wait+minDuration both satisfied. Not real load progress — pacing heuristic.

### Exit Animation

```typescript
<motion.div exit={{ y: "-100%" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
```

Slides up. Exit handled by `AnimatePresence mode="wait"` in `App.tsx`. After exit, `PortfolioLayout` mounts with `.app-reveal` CSS fade-up (opacity + translateY, 1s, 0.2s delay).

### Lazy Loading

`ConcentricRings` (GSAP-heavy) lazy-loaded via `React.lazy()`. Only rendered on mobile/tablet during 3200ms preloader window. Defers GSAP 114 kB load from initial bundle.

### isFirstLoad Flag

```typescript
let hasInitiallyLoaded = false; // Module-level
```

- First visit → `isFirstLoad=true` → preloader shows → GSAP entrance animations play
- Back-navigation → `isFirstLoad=false` → no preloader → GSAP `gsap.set()` to final state
- Survives StrictMode double-mount (module scope, not component)

---

## 6. Scroll Reveals

### AnimationOrchestrator (Left-Column Section Cascade)

**File**: `src/animations/orchestrator.ts`

Deterministic state machine. 5 sections in fixed order:

```
idle → visible → playing → done
```

| Section | Type | Behavior |
|---------|------|----------|
| hero | instant | Marks done immediately. No playFn needed |
| bio | standard | ScrollTrigger fires → visible → waits for prev done → plays |
| principles | standard | Same. Plays after bio done |
| services | standard | Same. Plays after principles done |
| contact | standard | Same. ScrollTrigger fires at `top 95%` (lower threshold) |

**Execution order guarantee** (by useLayoutEffect timing):
```
AnimationProvider.useLayoutEffect runs FIRST → creates ScrollTriggers
Children's useLayoutEffect runs AFTER → registerPlayFn calls
ScrollTrigger fires when user scrolls → markVisible triggers play
```

**Late-binding**: `registerPlayFn(id, fn)` stores function. If section already visible, fires immediately.

**Sync guarantee**: No `queueMicrotask`, no async. Every `_play` fires synchronously in same call stack.

### useEntranceReveal Hook

**File**: `src/hooks/animation/useEntranceReveal.ts`

Generic scroll-reveal. Accepts selector for target elements. GSAP blur + translateY.

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

**Multi-phase support**:

```typescript
useEntranceReveal(containerRef, {
  phases: [
    { selector: '.title', y: 24, blur: 8, stagger: 0.03 },
    { selector: '.description', y: 16, blur: 4, stagger: 0.05, at: '>-0.1' },
  ],
});
```

Each phase can specify `at` position parameter for fine-grained timeline control.

**Smart target filtering**: Skips elements with `data-entrance-skip`, `.entrance-reveal-complete`, `.entry-reveal-done`, or `.reveal-complete` classes. Prevents double-animation on re-render.

### Project Page Scroll Reveals

**File**: `src/layouts/ProjectBrutalistLayout.tsx` GSAP context

6 reveal types, all bound to right-column scroller:

| Selector | Animation | Trigger |
|----------|-----------|---------|
| `[data-split]` | blur(10px)→0, y:40→0, stagger 0.03, duration 0.8 | `top 70%` |
| `[data-fade]` | blur(10px)→0, y:15→0, duration 0.8 | `top 85%` |
| `[data-cta]` | y:20→0, delay 0.4, duration 0.8 | `top 85%` |
| `.media-stack-item-0/1` | y:24, scale 0.985→1, stagger 0.08, duration 0.72 | `top 88%` |
| `[data-section-reveal="paragraph"]` | blur(10px)→0, y:15→0, delay 0.4, duration 1.2 | `top 70%` |

**Text splitting**: `[data-split]` splits text into `<span.split-word>` elements, wraps each in overflow-hidden parent. GSAP animates inner spans.

**Cleanup**: All wrapped in `gsap.context()`. `ctx.revert()` on unmount kills all tweens.

### Project Card 3D Entrance

**File**: `src/layouts/PortfolioLayout.tsx` effect

```typescript
Initial:  opacity:0, x:72, y:126, z:-280, rotateX:9°, rotateY:-6°, scale:0.88
Final:    opacity:1, x:0, y:0, z:0, rotateX:0, rotateY:0, scale:1
```

Per-card timeline (stagger 0.16s):
- wrapper: opacity + transform (1.28s)
- image mask: y + scale (1.46s)
- image: x + y + scale (1.56s)
- matte: xPercent + opacity (1.08s)
- meta + caption: opacity + y (0.68s, stagger 0.04)

`.revealed` class + `clearProps: 'willChange'` on complete.

### Project Card Scroll Effect

Scroll-linked skew/scale via Motion (not GSAP):

```typescript
const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
const smoothVelocity = useSpring(useVelocity(scrollYProgress), { damping: 50, stiffness: 400 });
const skewY = useTransform(smoothVelocity, [-1, 1], [-2, 2]);
```

### Project Text Scroll Sync

**File**: `src/hooks/animation/useProjectTextScroll.ts`

Tracks which image section is visible in right column. Updates `visibleIdx` state → left-column text highlights corresponding section.

300ms init delay to allow React ref population. ScrollTrigger `onEnter`/`onLeaveBack` tracks index. Cleanup kills triggers + reverts context.

### Animation Presets

**File**: `src/motion/presets/presets.ts`

```typescript
default: { y: 24, blur: 10, duration: 0.9, ease: 'power4.out' }
soft:    { y: 16, blur: 6,  duration: 1.1, ease: 'power3.out' }
sharp:   { y: 32, blur: 14, duration: 0.7, ease: 'power4.inOut' }
```

### Motion Easing Constants

**File**: `src/motion/constants/easing.ts`

```typescript
EASE_PREMIUM = [0.16, 1, 0.3, 1];     // Standard ease (page transitions, preloader exit)
EASE_CINEMATIC = [0.85, 0, 0.15, 1];   // Dramatic ease-out
SPRING_SNAPPY = { stiffness: 400, damping: 30 };
SPRING_MAGNETIC = { stiffness: 150, damping: 15, mass: 0.1 };
SPRING_CURSOR = { stiffness: 150, damping: 15 };
```

---

## 7. Performance Constraints

### GPU-Accelerated Properties Only

Animations limited to `transform`, `opacity`, `filter`. Never animate `width`, `height`, `top`, `left`, `margin`, `padding` — these trigger layout recalculations.

### will-Change Is Temporary

```typescript
gsap.set(targets, { willChange: 'opacity, transform, filter' });
// ... animation completes
gsap.set(targets, { clearProps: 'willChange' });  // Or via clearProps in tween config
```

Cleared on:
- Project card entrance: `clearProps: 'willChange'` in timeline `onComplete`
- Project page reveals: `clearProps: 'transform,willChange'` in each `.from()` tween
- `useEntranceReveal`: `clearProps: 'willChange'` in `finalState` object

### No `!important` on Animated Properties

GSAP writes inline styles. `!important` in CSS prevents GSAP from overriding. Never use `!important` on `transform`, `opacity`, `filter`, or any property GSAP animates.

### GSAP Context Scoping

Every animation group wrapped in `gsap.context()` with container ref. On unmount, `ctx.revert()` kills all tweens/triggers. Prevents:
- Memory leaks (stale tweens holding element references)
- Ghost animations after route transition
- Multiple ScrollTriggers after StrictMode double-mount

### Bundle Size

| Library | Size | Loaded |
|---------|------|--------|
| GSAP + ScrollTrigger | ~114 kB | Deferred until useSmoothScroll imports |
| Motion | Bundled in app chunk | Always loaded |
| ConcentricRings (GSAP) | Part of GSAP chunk | Lazy-loaded only on mobile preloader |

No `opacity-only` reveals — system intentionally uses blur + y to maintain edge definition during motion (CSS anti-aliasing benefit).

---

## 8. Rules for Adding New Animations

### 8.1 Choose the Right Engine

| If you want... | Use... |
|----------------|--------|
| Scroll-linked animation | GSAP + ScrollTrigger |
| Timeline sequence with precise stagger | GSAP timeline |
| 3D transforms | GSAP (Motion spring 3D has perf issues) |
| Spring physics | Motion (`useSpring`, `whileHover`) |
| Gesture response (hover, drag, tap) | Motion (`whileHover`, `whileTap`) |
| Route transition | Motion + AnimatePresence |
| Blur + y cascade reveal | `useEntranceReveal` hook |
| Section state machine | Orchestrator + `registerPlayFn` |

### 8.2 Follow This Pattern

**GSAP animation**:
1. Wrap in `gsap.context(() => { ... }, containerRef.current)`
2. Add `ScrollTrigger.create()` or `gsap.to()` inside context
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

### 8.3 Reduced Motion Checklist

Every new animation must handle reduced motion:
- [ ] CSS override covered by `html[data-motion="reduced"]`?
- [ ] Motion component checks `useReducedMotionPreference()`?
- [ ] GSAP component calls `runOrSetFinal()` or `gsap.set()` to final?
- [ ] Animation duration 0 / instant when reduced?
- [ ] Stagger set to 0 when reduced?

### 8.4 Performance Checklist

- [ ] Animating only `transform`, `opacity`, `filter`?
- [ ] `willChange` set before animation and cleared after?
- [ ] Wrapped in `gsap.context()` for cleanup?
- [ ] No `!important` on animated CSS properties?
- [ ] `scroller` param set for all ScrollTriggers?
- [ ] Prefers `invalidateOnRefresh: true` over manual refresh?

### 8.5 Extension Points

| Goal | Action |
|------|--------|
| New scroll reveal type | Add to `useEntranceReveal` with new selector. Or add data-attribute to `ProjectBrutalistLayout` GSAP context |
| New section in cascade | Add to `SECTIONS` array in `orchestrator.ts`. Add ScrollTrigger in `AnimationProvider`. Components register playFn |
| New animation preset | Add entry to `cascadePresets` in `presets.ts`. Reference by preset name |
| New easing curve | Add to `easing.ts`. Import in component |
| Per-breakpoint animation | Use GSAP `matchMedia()` for responsive timeline changes |

### 8.6 What Not To Do

- **Don't** call `gsap.registerPlugin()` anywhere except `gsap-setup.ts`
- **Don't** use `createBrowserRouter` — breaks AnimatePresence
- **Don't** use `motion.div drag="x"` — use pointer events + GSAP tweens
- **Don't** use `visibility:hidden` — let AnimatePresence handle
- **Don't** call hooks inside GSAP callbacks, MutationObservers, or Lenis init
- **Don't** animate layout-triggering properties (width, height, top, left)
- **Don't** mix GSAP and Motion on same element
- **Don't** store animation progress in React state — use GSAP timelines or refs

---

## Cross-References

- [Scrolling system](../systems/scrolling.md) — Lenis + ScrollTrigger sync
- [ADRs](../adr/006-animation-strategy.md) — GSAP/Motion split rationale
- [Systems: shared utilities](../systems/shared-utilities.md) — reduced-motion.ts, easing.ts, presets.ts
- [Responsive behavior](../systems/responsive.md) — Animation scaling by tier
