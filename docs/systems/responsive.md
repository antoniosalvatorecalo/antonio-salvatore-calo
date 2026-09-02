# Responsive System

**File**: `ScrollProvider` + CSS media queries | **Owner**: Engineering

## Architecture

3 tiers. Desktop-first CSS. Breakpoint detected once at mount + live via RAF-throttled resize listener.

| Tier | Width | Layout | Scroll | Nav |
|------|-------|--------|--------|-----|
| Mobile | <768px | Single column | Native | MobileBottomNav |
| Tablet | 768–1024px | Single column | Native | MobileBottomNav |
| Desktop | ≥1024px | Dual column | Lenis | CentralNavMenu |

**Breakpoint constant**: `DESKTOP_BREAKPOINT = 1024`. Set in `ScrollProvider`, exposed via `isDesktop` context value.

## Layout Behavior by Tier

### Desktop (≥1024px)

```
┌─ Left (30%) ────────┬─ Right (70%) ────────┐
│ Lenis scroll         │ Lenis scroll          │
│ AboutHero → Bio →    │ ProjectCard × N      │
│ Principles → Services│ (GSAP 3D entrance)   │
│ → Contact            │ Scroll-driven skew   │
│                      │                      │
│ ScrollTrigger        │ Independent scroll   │
│ cascade reveals      │ velocity             │
└──────────────────────┴──────────────────────┘
```

Both columns: `height: 100dvh`, independent Lenis, no scrollbar.

### Tablet (768–1024px)

Single column. Both About and Work content stacked, toggled via `activeTab` state.

```
┌────────────────────────────────┐
│ Single column, native scroll   │
│                                │
│ Active tab content:            │
│ - 'about': Hero, Bio, ...      │
│ - 'work': ProjectCards         │
│                                │
│ MobileBottomNav (fixed)         │
└────────────────────────────────┘
```

Full-width cards. No Lenis. No blur reveals. Simplified entrance animation.

### Mobile (<768px)

Same single-column as tablet. Tighter spacing (16px padding vs 24px). Smaller type. Touch targets ≥44px (WCAG 2.5.8).

Swipe gestures between projects active. `useSwipeNavigation` with 50px threshold.

## Component Visibility

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| CentralNavMenu | Visible | Hidden | Hidden |
| MobileBottomNav | Hidden | Visible | Visible |
| ProjectMobileNav | Hidden (sidebar replaces) | Visible | Visible |
| BackToTop | Visible | Hidden | Hidden |
| Left column (home) | Visible | Tab-toggle | Tab-toggle |
| Right column (home) | Visible | Tab-toggle | Tab-toggle |

## Tab Switching (Mobile/Tablet)

```typescript
const [activeTab, setActiveTab] = useState<'work' | 'about'>('work');
const leftVisible = isDesktop || activeTab === 'about';
const rightVisible = isDesktop || activeTab === 'work';
```

Tab switch triggers `refreshAllLenises()` + `ScrollTrigger.refresh()` on desktop (when returning). No route change — component state only. Prevents full re-render.

## Viewport Strategy

- `100dvh` — dynamic viewport height prevents mobile browser chrome jump
- `viewport-fit=cover` — notch-safe on iOS
- `html/body overflow: hidden` — scroll handled by Lenis (desktop) or column containers (mobile)

## Animation Scaling

| Tier | Detail |
|------|--------|
| Desktop | Full blur reveals, stagger cascades, 3D card entries, ScrollTrigger sync |
| Mobile/Tablet | Simplified opacity + translateY. No blur reveals. No per-section cascade |

All tiers respect `prefers-reduced-motion`.

## Lifecycle

1. **Mount**: `ScrollProvider` reads `window.innerWidth`. Sets `isDesktop`/`isTablet` in context
2. **Resize**: RAF-throttled listener re-evaluates breakpoints. Components respond via context
3. **Breakpoint cross ≥1024px**: Column layout flips dual↔single. Lenis init/destroy. Nav components swap
4. **Tab switch**: `activeTab` state toggles column visibility. Lenis instances refreshed

## Dependencies

- `ScrollProvider` — `isDesktop`, `isTablet`, `activeTab` context
- Tailwind CSS — responsive utility classes (`md:`, `lg:` prefixes)
- Lenis — desktop only. Destroyed on downscale below 1024px

## Extension Points

- **New breakpoint**: Add to `ScrollProvider` breakpoint detection. Expose via context
- **Per-breakpoint animations**: GSAP `matchMedia()` for responsive timeline changes
- **Touch optimization**: Adjust threshold/axis in `useSwipeNavigation`. Modify touch target sizes
- **Orientation handling**: Add `orientationchange` listener for tablet landscape/portrait differences
