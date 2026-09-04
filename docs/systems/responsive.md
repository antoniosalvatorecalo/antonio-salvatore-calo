# Responsive System

**File**: `ScrollProvider` + CSS media queries | **Owner**: Engineering

## Architecture

3 tiers. Desktop-first CSS. Breakpoint detected once at mount + live via RAF-throttled resize listener.

| Tier | Width | Layout | Scroll | Header |
|------|-------|--------|--------|--------|
| Mobile | <768px | Single column | Native | `SiteHeader` (compact) |
| Tablet | 768–1024px | Single column | Native | `SiteHeader` (compact) |
| Desktop | ≥1024px | Single column (home) / split (projects) | Lenis where mounted | `SiteHeader` |

**Breakpoint constant**: `DESKTOP_BREAKPOINT = 1024`. Set in `ScrollProvider`, exposed via `isDesktop` context value.

## Layout Behavior by Tier

### Desktop (≥1024px)

- Home (`PortfolioLayout`): single-column, layout-local Lenis.
- Project pages (`ProjectBrutalistLayout`): 20/80 split, right column Lenis.

```
┌──────────────────────────────────────────┐
│  SiteHeader                              │
├──────────────────────────────────────────┤
│  PortfolioLayout  →  ProjectIndex        │
│                    →  ProjectGrid        │
└──────────────────────────────────────────┘
```

### Tablet (768–1024px)

Single-column throughout. `PortfolioLayout` keeps its single-column structure; `ProjectBrutalistLayout` collapses to mobile tab view. No Lenis — native scroll.

```
┌────────────────────────────────┐
│  SiteHeader                    │
├────────────────────────────────┤
│  Single column, native scroll  │
│                                │
│  ProjectIndex → ProjectGrid    │
└────────────────────────────────┘
```

### Mobile (<768px)

Same single-column as tablet. Tighter spacing (16px padding vs 24px). Smaller type. Touch targets ≥44px (WCAG 2.5.8).

Swipe gestures between projects active. `useSwipeNavigation` with 50px threshold.

## `SiteHeader` Adaptation

`SiteHeader` is shared across all tiers. The component tree is the same; the visual layout compresses on smaller viewports via Tailwind responsive utilities.

## Project Mobile Tab Switching

`ProjectBrutalistLayout` switches between project content and credits on mobile/tablet via `activeTab` state derived from `location.pathname`:

```typescript
const routeTab: 'project' | 'credits' = location.pathname.endsWith('/credits') ? 'credits' : 'project';
```

Tab switch updates both `activeTab` state and the URL via `navigate()`. This ensures URL/bookmark shareability and correct back-button behavior.

## Viewport Strategy

- `100dvh` — dynamic viewport height prevents mobile browser chrome jump.
- `viewport-fit=cover` — notch-safe on iOS.
- `html/body overflow: hidden` — scroll handled by Lenis (desktop) or column containers (mobile).

## Animation Scaling

| Tier | Detail |
|------|--------|
| Desktop | Full blur reveals, stagger cascades, 3D card entries, ScrollTrigger sync |
| Mobile/Tablet | Simplified opacity + translateY. No blur reveals. No per-section cascade |

All tiers respect `prefers-reduced-motion`.

## Lifecycle

1. **Mount**: `ScrollProvider` reads `window.innerWidth`. Sets `isDesktop`/`isTablet` in context.
2. **Resize**: RAF-throttled listener re-evaluates breakpoints. Components respond via context.
3. **Breakpoint cross ≥1024px**: Layout-level effects respond (Lenis init/destroy on project pages).
4. **Tab switch**: `activeTab` state toggles column visibility. Lenis instances refreshed.

## Dependencies

- `ScrollProvider` — `isDesktop`, `isTablet`, `activeTab` context.
- Tailwind CSS — responsive utility classes (`md:`, `lg:` prefixes).
- Lenis — desktop only where mounted. Destroyed on downscale below 1024px.

## Extension Points

- **New breakpoint**: Add to `ScrollProvider` breakpoint detection. Expose via context.
- **Per-breakpoint animations**: GSAP `matchMedia()` for responsive timeline changes.
- **Touch optimization**: Adjust threshold/axis in `useSwipeNavigation`. Modify touch target sizes.
- **Orientation handling**: Add `orientationchange` listener for tablet landscape/portrait differences.
