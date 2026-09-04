# Scrolling System

**Files**: `lenis-manager` → Lenis | **Owner**: Engineering

## Architecture

Layout-local Lenis. No global instance. 4-layer stack:

```
Component (provides wrapper/content refs)
  → Layout-local init (PortfolioLayout / ProjectBrutalistLayout)
    → lenis-manager (singleton Map<HTMLElement, LenisBinding>)
      → Lenis instance (scroll interpolation, velocity)
        → GSAP ticker bridge (same frame)
        → ScrollTrigger.update() on scroll event
```

`ScrollProvider` only exposes refs and responsive state — it does **not** wire Lenis itself.

**Key files**:

| File | Role |
|------|------|
| `src/lib/lenis-manager.ts` | Singleton Map, init/get/destroy/refresh |
| `src/lib/gsap-setup.ts` | GSAP + ScrollTrigger registration (once) |
| `src/providers/ScrollProvider.tsx` | Column refs in context — no scroll logic |

## Lenis Config

```typescript
new Lenis({
  wrapper,           // scroll container
  content,           // inner content
  duration: 1.2,     // scroll duration
  lerp: 0.1,         // interpolation
  smoothWheel: true,
  infinite: false,
});
```

**GSAP ticker bridge**: `gsap.ticker.add(rafCallback)` — Lenis runs on GSAP's RAF, not its own. Both update the same frame.

**Scroll → ScrollTrigger**: `lenisInstance.on('scroll', () => ScrollTrigger.update())` — GSAP stays synced.

## Layout-Level Init

There is no `useSmoothScroll` hook any more. Layouts that need Lenis call `initLenis()` directly inside an effect:

**PortfolioLayout** (home):

```typescript
useEffect(() => {
  const lenis = initLenis(wrapper, content);
  return () => destroyLenis(wrapper);
}, [wrapper, content]);
```

**ProjectBrutalistLayout** (project pages, desktop only):

```typescript
if (isDesktop) {
  const content = container.querySelector('.scroll-content-inner') as HTMLElement;
  if (content) {
    const lenis = initLenis(container, content);
    setLenisInstance(lenis);
  }
}

return () => {
  if (isDesktop && container) {
    destroyLenis(container);
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.scroller === container) st.kill();
    });
  }
};
```

## lenis-manager

Module-level `Map<HTMLElement, LenisBinding>`. StrictMode-safe — same wrapper reuses instance.

| Function | Purpose |
|----------|---------|
| `initLenis(wrapper, content)` | Create or return existing instance |
| `getLenisInstance(wrapper)` | Retrieve without creating |
| `refreshAllLenises()` | Call `.resize()` on all instances |
| `destroyLenis(wrapper)` | Remove ticker, detach scroll, destroy |

## ScrollTrigger Refresh Triggers

| Event | Action |
|-------|--------|
| Project cards mount | `refreshAllLenises()` + `ScrollTrigger.refresh()` |
| Mobile tab switch | `refreshAllLenises()` + `ScrollTrigger.refresh()` |
| Project page tab switch | `ScrollTrigger.refresh()` |
| Resize | RAF-throttled resize handler |
| Route transition | Auto via unmount/remount cleanup |

## Sidebar Wheel Forwarding

Left column mouse wheel is forwarded to right column Lenis on project pages:

```typescript
const handleSidebarWheel = (event: React.WheelEvent) => {
  if (!isDesktop || !lenisInstance) return;
  event.preventDefault();
  lenisInstance.scrollTo(lenisInstance.targetScroll + event.deltaY, { programmatic: false });
};
```

## Lifecycle Summary

1. **Module import**: `initGSAP()` runs when a scroll-dependent module loads.
2. **Layout mount**: Layout effect creates refs and calls `initLenis()`.
3. **DOM ready**: Lenis init → GSAP ticker add → scroll listener → `ScrollTrigger.refresh()`.
4. **Scroll**: Lenis interpolates → `raf` via GSAP ticker → `ScrollTrigger.update()` each frame.
5. **Content change**: `refreshAllLenises()` recalculates heights.
6. **Unmount**: `destroyLenis()` → remove ticker → detach scroll → kill scoped ScrollTriggers.

## Extension Points

- **Custom easing**: Modify `lerp`/`duration` in `lenis-manager.ts` `initLenis()`.
- **Scroll analytics**: Add event listener in scroll handler.
- **New scroll container**: Call `initLenis(wrapper, content)` in the layout effect. Ensure `.scroll-content-inner` (or equivalent) child exists.
- **Programmatic scroll**: Use `getLenisInstance(wrapper)` → `.scrollTo()`.
