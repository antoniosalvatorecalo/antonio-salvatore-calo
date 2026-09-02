# Animation System

**Files**: GSAP + Motion + AnimationOrchestrator | **Owner**: Engineering

## Architecture

Two engines, strict domain split. Three orchestration levels.

| Level | Tech | Scope |
|-------|------|-------|
| Infrastructure | GSAP + ScrollTrigger | Timelines, scroll-linked, plugin registration |
| Primitives | Motion v12 | Springs, gestures, AnimatePresence |
| Orchestration | AnimationProvider + orchestrator | Section cascade state machine |

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
| Section cascade (left column) | PortfolioLayout → AnimationProvider | ScrollTrigger → orchestrator (idle→visible→playing→done) |
| Project card 3D entrance | PortfolioLayout GSAP context | Staggered timeline (0.16s per card), perspective transform |
| ScrollingProjectText | ProjectBrutalistLayout | ScrollTrigger per section, y:24→0, opacity |
| Scroll reveal (blur + y) | useEntranceReveal hook | ScrollTrigger + stagger |
| Media stack reveal | LayoutSplitTextMediaStack | ScrollTrigger per stack |

## Motion Animations

| Animation | Where | Mechanism |
|-----------|-------|-----------|
| Route transitions | AppRouter | AnimatePresence mode="wait", fade 0.25s |
| Magnetic buttons | CentralNavMenu | Spring stiffness 150, damping 15 |
| Theme toggle icon | CentralNavMenu | AnimatePresence + rotate spring |
| Project card scroll skew | ProjectCard | useScroll → useTransform → useSpring |
| Nav tab parallax | Nav components | Spring x/y on cursor proximity |
| Mobile nav underline | ProjectMobileNav | scaleX spring 0→1 |

## AnimationOrchestrator

**File**: `src/animations/orchestrator.ts`

Deterministic state machine for left-column section cascade:

```
idle → visible → playing → done
```

5 sections: hero (instant) → bio → principles → services → contact (standard). Strict order — N plays only after N-1 done.

```typescript
const status = new Map<SectionId, SectionState>();
// Module-level Map, not React state — avoids render cycle delay
```

**Key ops**: `markVisible(id)`, `markComplete(id)`, `registerPlayFn(id, fn)`, `reset()`

## useEntranceReveal Hook

**File**: `src/hooks/animation/useEntranceReveal.ts`

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

## Presets

**File**: `src/motion/presets/presets.ts`

```typescript
default: { y: 24, blur: 10, duration: 0.9, ease: 'power4.out' }
soft:    { y: 16, blur: 6,  duration: 1.1, ease: 'power3.out' }
sharp:   { y: 32, blur: 14, duration: 0.7, ease: 'power4.inOut' }
```

## Reduced Motion

4-layer cascade:

1. **CSS**: `html[data-motion="reduced"]` forces 0.01ms transitions
2. **Motion**: `useReducedMotionPreference()` → `instantTransition` (duration 0)
3. **GSAP**: Check preference → `gsap.set()` to final state instead of `gsap.to()`
4. **Provider**: `MotionPreferenceProvider` listens for live MediaQueryList changes

## Lifecycle

1. **Module load**: `initGSAP()` registers ScrollTrigger. Multi-stage refresh
2. **Component mount**: `gsap.context()` creates scoped timeline. ScrollTrigger creates trigger
3. **Scroll**: ScrollTrigger fires → orchestrator `markVisible()` → plays section
4. **Navigate**: Route exit → AnimatePresence fade out → component unmount → `ctx.revert()` kills tweens
5. **Reduced motion toggle**: MediaQueryList event → `data-motion` attribute updates → CSS kills animations

## Dependencies

- `gsap` v3 — ScrollTrigger, contexts, timelines
- `motion` v12 — AnimatePresence, spring, useScroll/useTransform
- `ScrollProvider` — isDesktop for animation scaling
- `MotionPreferenceProvider` — reduced motion detection

## Extension Points

- **New scroll reveal**: Add `[data-entrance-item]` elements + call `useEntranceReveal`
- **New preset**: Add entry to `cascadePresets` in `presets.ts`
- **New section animation**: Register section in orchestrator, add ScrollTrigger in AnimationProvider
- **Custom timeline**: Use `gsap.timeline()` inside `gsap.context()` — follows cleanup pattern
- **Per-breakpoint animation**: GSAP `matchMedia()` for responsive timeline changes
