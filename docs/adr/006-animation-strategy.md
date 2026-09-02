# ADR-006: Animation Strategy — GSAP + Motion Split

**Status**: Accepted | **Date**: 2026-06-03 | **Owner**: Engineering

## Context

Need two animation domains: (1) scroll-driven timeline orchestration, (2) gesture/interaction animations. Single framework insufficient — Motion has no ScrollTrigger equivalent; GSAP has no spring physics.

## Decision

Two engines, strict domain split:

### GSAP + ScrollTrigger — Scroll-Driven
- Section cascade (AnimationOrchestrator — idle→visible→playing→done)
- Project card 3D entrance (perspective transforms, stagger)
- ScrollingProjectText sync (y/opacity per section)
- Scroll reveal blur + translateY (useEntranceReveal hook)
- Any timeline requiring precise sequencing or ScrollTrigger

### Motion (Framer Motion successor) — Interaction
- Route transitions (AnimatePresence mode="wait", fade 0.25s)
- Magnetic button hover (spring stiffness 150, damping 15)
- Theme toggle icon swap (AnimatePresence + rotate)
- Nav tab parallax (spring x/y on cursor)
- Project card scroll skew (useScroll → useTransform → useSpring)

### AnimationOrchestrator (Deterministic state machine)
Left-column section cascade. Five sections: hero (instant) → bio → principles → services → contact (standard). Plays strict in order — N plays only when N-1 done.

```
idle → visible → playing → done
```

- `useLayoutEffect` runs in AnimationProvider → creates ScrollTriggers
- Children register play functions via `registerPlayFn(id, fn)`
- ScrollTrigger fires → `markVisible(id)` → waits for prev section done → plays

### Reduced motion
All animations check `prefers-reduced-motion`. Four-layer cascade: CSS (`data-motion="reduced"` → 0.01ms), Motion (`instantTransition`), GSAP (`gsap.set()` → final state), Provider (live MediaQueryList listener).

## Tradeoffs

| Pro | Con |
|-----|-----|
| Right tool for each domain (GSAP timelines, Motion springs) | 2 animation libraries = ~130 KB combined (GSAP 114 KB, Motion bundled) |
| Orchestrator guarantees deterministic section order | Must manually wire registerPlayFn — easy to forget |
| Reduced motion at 4 layers = no animation leaks | Verbose — every component checks reduced motion |
| GSAP context scoping = clean unmount | GSAP nullTargetWarn must be disabled (noisy) |

## Consequences

1. Never mix GSAP and Motion on same element — pick one per animation
2. `gsap.context()` wrapping required for every GSAP component
3. `AnimationProvider` wraps left-column content in `PortfolioLayout`
4. `useEntranceReveal` hook for any scroll-reveal — reusable, GSAP-based
5. GSAP registered once in `gsap-setup.ts` at module level — no other registration
6. `will-change` added before animation, cleared via `clearProps` after
7. Animations limited to `transform`, `opacity`, `filter` — no layout-triggering properties
