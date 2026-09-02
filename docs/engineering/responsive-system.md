# Responsive System

> Three-tier responsive model, mobile behavior, breakpoints, and viewport strategy.
> Owner: Engineering

---

## 1. Three-Tier Model

The responsive system operates at three tiers:

| Tier | Breakpoint | Layout | Scroll |
|------|-----------|--------|--------|
| **Mobile** | < 768px | Single column | Native scroll |
| **Tablet** | 768px–1024px | Single column | Native scroll |
| **Desktop** | >= 1024px | Dual column | Lenis per column |

### Breakpoint Detection

**File:** `src/providers/ScrollProvider.tsx`

```typescript
const DESKTOP_BREAKPOINT = 1024;
const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
```

This is set once at mount time and stored in context. Components don't re-evaluate on resize — it's the component's responsibility to handle resize if needed (some do via useGSAP dependencies).

### CSS Media Queries

```css
/* Desktop-first — base styles assume desktop */
/* Tablet */
@media (max-width: 1024px) { ... }
/* Mobile */
@media (max-width: 768px) { ... }
```

---

## 2. Desktop Layout

```
┌───────────┬─────────────────────────────┐
│ Left (30%)│       Right (70%)           │
│           │                             │
│ Scrolls   │  Scrolls independently      │
│ via Lenis │  via Lenis                  │
│           │                             │
│ 5 sections│  Project cards carousel     │
│ (hero,    │  with GSAP-optimized        │
│  bio,     │  pointer events             │
│  prin,    │                             │
│  serv,    │                             │
│  contact) │                             │
│           │                             │
│ Smooth    │  Scroll-driven skew/scale   │
│ cascade   │  on project cards           │
│ reveal    │                             │
└───────────┴─────────────────────────────┘
```

Both columns have:
- Fixed height: `100dvh` (dynamic viewport height)
- Independent Lenis smooth scroll
- No scrollbar (handled by Lenis)

---

## 3. Tablet Layout

```
┌─────────────────────────────────────────┐
│              Single Column              │
│                                         │
│  Vertical stack:                        │
│  ┌─────────────────────────────────┐    │
│  │ Project card 1 (full width)     │    │
│  ├─────────────────────────────────┤    │
│  │ Section: Hero, Bio, Prin, ...   │    │
│  ├─────────────────────────────────┤    │
│  │ Project card 2 (full width)     │    │
│  ├─────────────────────────────────┤    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Fixed bottom nav (MobileBottomNav)     │
└─────────────────────────────────────────┘
```

- Single column, vertical stacking
- Native scroll (no Lenis)
- Fixed bottom navigation bar
- Tabs switch between "Work" and "About" content
- Project cards stack vertically at full width

---

## 4. Mobile Layout

```
┌─────────────────────────────────────────┐
│              Single Column              │
│                                         │
│  Same as tablet but:                    │
│  - Smaller padding (16px vs 24px)       │
│  - Smaller type scale                   │
│  - Touch-optimized targets (44px)       │
│  - Full-width cards                     │
│  - Swipe navigation between projects    │
└─────────────────────────────────────────┘
```

Mobile shares the same layout structure as tablet but with tighter spacing and smaller type.

---

## 5. Component Responsive Behavior

### Column Visibility

`PortfolioLayout` toggles column visibility based on tablet tab state:

```typescript
const [activeTab, setActiveTab] = useState<'work' | 'about'>('work');

// Desktop: both visible
// Tablet/mobile: only active tab's column visible
const leftVisible = isDesktop || activeTab === 'about';
const rightVisible = isDesktop || activeTab === 'work';
```

### Project Card

- **Desktop**: Responsive grid in right column
  - 1 card (initially) or multiple cards shown
  - Pointer-based drag
  - Scroll-driven skew/scale effect
- **Tablet/Mobile**: Full-width stack
  - No drag interaction
  - Tap to navigate to project page
  - Standard vertical scroll reveal

### Navigation

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| CentralNavMenu | Fixed header in left column | Hidden | Hidden |
| MobileBottomNav | Hidden | Fixed bottom bar | Fixed bottom bar |
| ProjectMobileNav | Hidden (sidebar replaces it) | Floating bottom tabs | Floating bottom tabs |

### Theme Toggle

Embedded in `CentralNavMenu` (desktop) or `MobileBottomNav` (tablet/mobile). Same component, different parent.

---

## 6. Viewport Strategies

### Dynamic Viewport Height

```css
body, html {
  height: 100dvh;
}
```

Using `dvh` instead of `vh` prevents the mobile browser chrome collapse/expand from causing layout jumps. This is critical for the dual-column layout where both columns must be exactly viewport height.

### Touch Optimization

- Minimum touch target: 44x44px (WCAG 2.5.8 Target Size)
- Navigation tabs are larger on mobile
- Bottom nav bar has `padding: 8px` above and below to prevent accidental touches
- Swipe gesture threshold: 50px to prevent accidental triggers

### Viewport Meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

`viewport-fit=cover` ensures the notch area on iOS devices is respected.

---

## 7. Responsive Motion

### Animation Scaling

- **Desktop**: Full animations (blur reveals, stagger cascades, 3D card entries)
- **Tablet/Mobile**: Reduced animation complexity
  - No blur reveals (single column doesn't benefit from the visual layering)
  - Simplified entrance: opacity + translateY only
  - No ScrollTrigger cascade per-section

### Reduced Motion

All animations respect `prefers-reduced-motion` regardless of breakpoint. See [animation system](animation-system.md#10-reduced-motion) for details.

---

## 8. Cross-References

- [Layouts](layouts.md) — PortfolioLayout column toggling, responsive layout components
- [Navigation & Theming](navigation-and-theming.md) — Nav component visibility by breakpoint
- [Scrolling system](scrolling-system.md) — Lenis desktop-only, native scroll on mobile
- [Animation system](animation-system.md) — Animation scaling by device tier
- [Performance](performance-and-deployment.md) — Mobile performance considerations
