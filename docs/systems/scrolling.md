# Scrolling System

**Files**: `useSmoothScroll` → `lenis-manager` → Lenis | **Owner**: Engineering

## Architecture

Per-column Lenis. No global instance. 4-layer stack:

```
Component (provides wrapper/content refs)
  → useSmoothScroll hook (lifecycle, DOM readiness)
    → lenis-manager (singleton Map<HTMLElement, LenisBinding>)
      → Lenis instance (scroll interpolation, velocity)
        → GSAP ticker bridge (same frame)
        → ScrollTrigger.update() on scroll event
```

**Key files**:

| File | Role |
|------|------|
| `src/hooks/animation/useSmoothScroll.ts` | Per-column Lenis lifecycle hook |
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

**GSAP ticker bridge**: `gsap.ticker.add(rafCallback)` — Lenis runs on GSAP's RAF, not its own. Both update same frame.

**Scroll → ScrollTrigger**: `lenisInstance.on('scroll', () => ScrollTrigger.update())` — GSAP stays synced.

## useSmoothScroll Hook

```typescript
function useSmoothScroll(
  wrapperRef: React.RefObject<HTMLElement | null>,
  { enabled = true }: SmoothScrollOptions = {},
)
```

**Lifecycle**:

1. **Mount guard**: `initializedRef` prevents double-init in StrictMode
2. **DOM readiness**: Look for `.scroll-content` in wrapper
   - Found → `doInit()`
   - Not found → `MutationObserver` watching `childList`, 1500ms timeout
3. **Init**: `initLenis(wrapper, content)` → `ScrollTrigger.refresh()`
4. **Cleanup**: Disconnect observer, clear timeout, `destroyLenis()`

**Timeout fallback**: If `.scroll-content` never appears, add `lenis-fallback` class → native smooth scroll.

## lenis-manager

Module-level `Map<HTMLElement, LenisBinding>`. StrictMode-safe — same wrapper reuses instance.

| Function | Purpose |
|----------|---------|
| `initLenis(wrapper, content)` | Create or return existing instance |
| `getLenisInstance(wrapper)` | Retrieve without creating |
| `refreshAllLenises()` | Call `.resize()` on all instances |
| `destroyLenis(wrapper)` | Remove ticker, detach scroll, destroy |

## Usage in Layouts

**PortfolioLayout**: 2 independent Lenis (left + right columns)
```typescript
useSmoothScroll(leftScrollRef, { enabled: effectsEnabled });
useSmoothScroll(rightScrollRef, { enabled: effectsEnabled });
```

**ProjectBrutalistLayout**: Direct `initLenis()` in effect (not hook). Desktop only. Mobile = native scroll.

## ScrollTrigger Refresh Triggers

| Event | Action |
|-------|--------|
| Project cards mount | `refreshAllLenises()` + `ScrollTrigger.refresh()` |
| Mobile tab switch | `refreshAllLenises()` + `ScrollTrigger.refresh()` |
| Project page tab switch | `ScrollTrigger.refresh()` |
| Resize | RAF-throttled resize handler |
| Route transition | Auto via unmount/remount cleanup |

## Sidebar Wheel Forwarding

Left column mouse wheel forwarded to right column Lenis on project pages:

```typescript
const handleSidebarWheel = (event: React.WheelEvent) => {
  if (!isDesktop || !lenisInstance) return;
  event.preventDefault();
  lenisInstance.scrollTo(lenisInstance.targetScroll + event.deltaY, { programmatic: false });
};
```

## Lifecycle Summary

1. **Module import**: `initGSAP()` runs (module-level in useSmoothScroll)
2. **Component mount**: Refs created. useSmoothScroll starts DOM readiness check
3. **DOM ready**: Lenis init → GSAP ticker add → scroll listener → `ScrollTrigger.refresh()`
4. **Scroll**: Lenis interpolates → `raf` via GSAP ticker → `ScrollTrigger.update()` each frame
5. **Content change**: `refreshAllLenises()` recalculates heights
6. **Unmount**: `destroyLenis()` → remove ticker → detach scroll → kill scoped ScrollTriggers

## Extension Points

- **Custom easing**: Modify `lerp`/`duration` in `lenis-manager.ts` `initLenis()`
- **Scroll analytics**: Add event listener in scroll handler
- **New scroll container**: Call `useSmoothScroll(ref)` in component. Ensure `.scroll-content` child exists
- **Programmatic scroll**: Use `getLenisInstance(wrapper)` → `.scrollTo()`
