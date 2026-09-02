# ADR-003: GSAP ScrollTrigger with Per-Column Scroller Binding

**Status**: Accepted | **Date**: 2026-06-03 | **Owner**: Engineering

## Context

ScrollTrigger must read scroll position from Lenis-smoothed columns, not window. Each column has independent scroll. ScrollTrigger need scoped lifecycle — destroy on unmount without affecting other column's triggers.

## Decision

Every ScrollTrigger explicitly sets `scroller` to column container ref. No trigger bound to default `window` scroller.

Pattern:

```typescript
ScrollTrigger.create({
  trigger: el,
  scroller: columnRef,  // NOT window — critical
  start: 'top 90%',
  once: true,
  invalidateOnRefresh: true,
});
```

**Multi-stage refresh** ensures correct measurement:

1. Module init — `requestAnimationFrame` + `document.readyState === 'complete'`
2. After Lenis init — immediate `ScrollTrigger.refresh()`
3. After 200ms delay — catch layout shifts
4. On resize — `invalidateOnRefresh: true` auto-refreshes

**Scoped cleanup** — kill only triggers for specific scroller:

```typescript
ScrollTrigger.getAll().forEach(st => {
  if (st.vars.scroller === container) st.kill();
});
ScrollTrigger.refresh();
```

**Left-column text sync** — `ScrollingProjectText` binds ScrollTrigger to right-column scroller. Left content syncs to right scroll position.

## Tradeoffs

| Pro | Con |
|-----|-----|
| Correct per-column scroll reading | Must pass `scroller` to every ScrollTrigger — easy to forget |
| Scoped cleanup prevents memory leaks | Kill+refresh pattern required on unmount |
| Multi-stage refresh handles layout shifts | 200ms delay is heuristic; extremely slow images still cause misalignment |
| `invalidateOnRefresh` = no destroy on resize | Stale triggers if content height changes without refresh call |

## Consequences

1. Every ScrollTrigger call includes `scroller: ref.current` — enforced in code review
2. `ScrollTrigger.refresh()` called after Lenis init, content mount, tab switch, resize
3. Cleanup kills per-scroller triggers only — other column unaffected
4. `ScrollingProjectText` uses right-column scroller from `ScrollerContext`
5. GSAP registered once in `gsap-setup.ts` — no duplicate registration anywhere
