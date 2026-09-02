# ADR-002: Per-Column Lenis Instances via useSmoothScroll

**Status**: Accepted | **Date**: 2026-06-03 | **Owner**: Engineering

## Context

Portfolio uses dual-column layout (left 30%, right 70%). Each column scrolls independently. Need smooth scroll interpolation with GSAP ScrollTrigger sync.

Initial approach used global Lenis instance in `ScrollProvider`. Caused cross-column scroll conflicts — both columns responded to same wheel input.

## Decision

No global Lenis. Each column owns its own Lenis instance.

Architecture:

```
useSmoothScroll hook (per column)
  └── lenis-manager (singleton Map<HTMLElement, LenisBinding>)
        └── Lenis instance
              ├── GSAP ticker bridge (sync on same frame)
              └── ScrollTrigger.update() on scroll
```

Key decisions:

1. **Singleton Map** in `lenis-manager.ts` — StrictMode-safe, reuses instance if same wrapper detected
2. **GSAP ticker bridge** — Lenis runs RAF via `gsap.ticker.add()` not its own loop. Both update same frame
3. **Scroll → ScrollTrigger** — Lenis scroll event calls `ScrollTrigger.update()`. GSAP stays in sync
4. **DOM readiness fallback** — `MutationObserver` watches for `.scroll-content`. 1500ms timeout → native scroll fallback
5. **Lifecycle** — `useSmoothScroll` hook handles init/cleanup. `initializedRef` prevents double-init in StrictMode

## Tradeoffs

| Pro | Con |
|-----|-----|
| Independent column scroll — no cross-contamination | Two Lenis instances = more memory (~200 KB total) |
| Each column has own velocity/easing | Must refresh both on layout changes |
| GSAP ticker bridge = perfect ScrollTrigger sync | Lenis `.raf()` runs on GSAP ticker, not native RAF |
| DOM readiness fallback = robust against lazy content | MutationObserver adds complexity |
| Singleton Map prevents duplicate instances | Must clean up manually on unmount |

## Consequences

1. `ScrollProvider` holds refs only — no scroll logic
2. `PortfolioLayout` calls `useSmoothScroll(leftRef)` + `useSmoothScroll(rightRef)`
3. `ProjectBrutalistLayout` manages Lenis lifecycle directly (not via hook) for manual control
4. After content mount (cards, tab switch): `refreshAllLenises()` + `ScrollTrigger.refresh()`
5. Mouse wheel on left column forwarded to right Lenis via `handleSidebarWheel`
6. `lenis-fallback` CSS class ensures native scroll if init fails
