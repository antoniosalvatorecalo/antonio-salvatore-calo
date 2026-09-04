# Animation System

**Files**: GSAP + Motion + entrance hooks | **Owner**: Engineering

## Architecture

Two engines, strict domain split. Reduced motion handled via `MotionPreferenceProvider` + `runOrSetFinal`.

| Level | Tech | Scope |
|-------|------|-------|
| Infrastructure | GSAP + ScrollTrigger | Timelines, scroll-linked, plugin registration |
| Primitives | Motion v12 | Springs, gestures, AnimatePresence |
| Reduced motion | `MotionPreferenceProvider` + `runOrSetFinal` | OS detection + final-state fallback |

There is no `AnimationProvider` or `AnimationOrchestrator` — page-level reveals go through `useEntranceReveal` and `useProjectTextScroll`.

## GSAP Setup

**File**: `src/lib/gsap-setup.ts`

Registered once at module load. No other file calls `gsap.registerPlugin()`.

```typescript
export function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false, units: { left: "px", top: "px", rotation: "deg" } });
  // Multi-stage refresh via rAF + window load
}
```

**Context pattern** — every GSAP component wraps in `gsap.context()` for clean unmount:

```typescript
const ctx = gsap.context(() => {
  gsap.to(targets, { ... });
}, container);
return () => ctx.revert();
```

## GSAP Animations

| Animation | Where | Mechanism |
|-----------|-------|-----------|
| Project card 3D entrance | `PortfolioLayout` GSAP context | Staggered timeline (0.16s per card), perspective transform |
| ScrollingProjectText | `ProjectBrutalistLayout` | ScrollTrigger per section, y:24→0, opacity |
| Scroll reveal (blur + y) | `useEntranceReveal` hook | ScrollTrigger + stagger |
| Media stack reveal | `ProjectSection` | ScrollTrigger per stack |

## Motion Animations

| Animation | Where | Mechanism |
|-----------|-------|-----------|
| Route transitions | `AppRouter` | AnimatePresence mode="wait", fade 0.25s |
| Magnetic buttons | `SiteHeader` | Spring stiffness 150, damping 15 |
| Theme toggle icon | `SiteHeader` | AnimatePresence + rotate spring |
| Letter swap | `letter-swap/` | LetterSwapForward, LetterSwapBlock |
| Nav tab parallax | `SiteHeader` | Spring x/y on cursor proximity |

## useEntranceReveal Hook

**File**: `src/hooks/useEntranceReveal.ts`

Reusable scroll-reveal. GSAP blur + translateY per element group.

```typescript
useEntranceReveal(containerRef, {
  selector: '[data-entrance-item]',
  stagger: 0.08,
  duration: 0.72,
  y: 18,
  blur: 10,
  once: true,
  start: 'top 85%',
});
```

Supports multi-phase reveals with `phases[]` array for complex sequences.

## Reduced Motion

4-layer cascade:

1. **CSS**: `html[data-motion="reduced"]` forces 0.01ms transitions.
2. **Motion**: `useReducedMotionPreference()` → `instantTransition` (duration 0).
3. **GSAP**: Check preference → `runOrSetFinal` jumps to final state via `gsap.set()`.
4. **Provider**: `MotionPreferenceProvider` listens for live MediaQueryList changes.

```typescript
export const runOrSetFinal = (reducedMotion, targets, finalState, animate) => {
  if (reducedMotion) {
    gsap.set(targets, { ...finalState, duration: 0 });
    return;
  }
  animate();
};
```

## Lifecycle

1. **Module load**: `initGSAP()` registers ScrollTrigger. Multi-stage refresh.
2. **Component mount**: `gsap.context()` creates scoped timeline. ScrollTrigger creates trigger.
3. **Scroll**: ScrollTrigger fires → plays reveal.
4. **Navigate**: Route exit → `AnimatePresence` fade out → component unmount → `ctx.revert()` kills tweens.
5. **Reduced motion toggle**: MediaQueryList event → `data-motion` attribute updates → CSS kills animations.

## Dependencies

- `gsap` v3 — ScrollTrigger, contexts, timelines.
- `motion` v12 — AnimatePresence, spring, useScroll/useTransform.
- `ScrollProvider` — isDesktop for animation scaling.
- `MotionPreferenceProvider` — reduced motion detection.
- `src/lib/reduced-motion.ts` — `runOrSetFinal`.

## Extension Points

- **New scroll reveal**: Add `[data-entrance-item]` elements + call `useEntranceReveal`.
- **New easing curve**: Add to `easing.ts`. Import in component.
- **Custom timeline**: Use `gsap.timeline()` inside `gsap.context()` — follows cleanup pattern.
- **Per-breakpoint animation**: GSAP `matchMedia()` for responsive timeline changes.
