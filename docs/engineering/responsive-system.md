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
| **Desktop** | >= 1024px | Desktop layout | Lenis (where mounted) |

### Breakpoint Detection

**File:** `src/providers/ScrollProvider.tsx`

```typescript
const DESKTOP_BREAKPOINT = 1024;
const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
```

`isDesktop` is set once at mount time and stored in context. Components don't re-evaluate on resize — it's the component's responsibility to handle resize if needed.

### CSS Media Queries

```css
/* Desktop-first — base styles assume desktop */
/* Tablet */
@media (max-width: 1024px) { ... }
/* Mobile */
@media (max-width: 768px) { ... }
```

---

## 2. Home Layout (`PortfolioLayout`)

`PortfolioLayout` renders a single-column scroll on every tier:

```
┌─────────────────────────────────────────┐
│   SiteHeader                            │
├─────────────────────────────────────────┤
│                                         │
│   ProjectIndex                          │
│   └── ProjectGrid                       │
│                                         │
└─────────────────────────────────────────┘
```

The home is the same DOM on all tiers — no tab switching, no dual-column shell. On desktop, the layout wires its own Lenis instance; on mobile/tablet it falls back to native scroll.

---

## 3. Project Layout (`ProjectBrutalistLayout`)

`ProjectBrutalistLayout` is the only place with a true left/right split. On mobile/tablet, the split collapses to a single column with a tab switcher between the project content and the credits tab.

### Desktop (>=1024px)

```
┌───────────────┬──────────────────────────────┐
│ Left (20%)    │       Right (80%)            │
│               │                              │
│ Hero Text     │  Lenis scroll container      │
│ ScrollingProj │  ├── ProjectGallery          │
│ ectText       │  ├── ProjectSection × N      │
│               │  └── ProjectCreditsSection   │
│ (synced to    │                              │
│  right col)   │                              │
└───────────────┴──────────────────────────────┘
```

### Mobile/Tablet (<1024px)

`ProjectBrutalistLayout` switches to a tab-based mobile layout:

- A single scroll column visible at a time (project tab or credits tab).
- Tab derived from `location.pathname` (`endsWith('/credits')`).
- Native scroll — no Lenis.
- `ProjectSection` blocks stack vertically inside the scroll column.

---

## 4. Mobile (<768px)

Same single-column behavior as tablet. Tighter spacing (16px padding vs 24px). Smaller type. Touch targets >= 44px (WCAG 2.5.8). Swipe gestures between projects active via `useSwipeNavigation` (50px threshold).

---

## 5. Component Responsive Behavior

### `SiteHeader`

Adapts across tiers — same component, different layout. Logo, nav links, language toggle, and theme toggle remain visible on all tiers; on mobile the layout compresses but the component tree does not change.

### Project Card / Gallery

- **Desktop**: Full animations (blur reveals, 3D card entries).
- **Tablet/Mobile**: Simplified entrance, no blur reveals.

---

## 6. Viewport Strategies

### Dynamic Viewport Height

```css
body, html {
  height: 100dvh;
}
```

Using `dvh` instead of `vh` prevents the mobile browser chrome collapse/expand from causing layout jumps. This is critical for layouts where the scroll container must match viewport height.

### Touch Optimization

- Minimum touch target: 44x44px (WCAG 2.5.8).
- Swipe gesture threshold: 50px to prevent accidental triggers.

### Viewport Meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

`viewport-fit=cover` ensures the notch area on iOS devices is respected.

---

## 7. Responsive Motion

### Animation Scaling

- **Desktop**: Full animations (blur reveals, stagger cascades, 3D card entries).
- **Tablet/Mobile**: Simplified entrance. No blur reveals, no per-section cascade.

### Reduced Motion

All animations respect `prefers-reduced-motion` regardless of breakpoint. See [animation system](animation-system.md#7-reduced-motion) for details.

---

## 8. Cross-References

- [Layouts](layouts.md) — Layout-level column behavior
- [Navigation & Theming](navigation-and-theming.md) — `SiteHeader` adaptation by breakpoint
- [Scrolling system](scrolling-system.md) — Lenis desktop-only, native scroll on mobile
- [Animation system](animation-system.md) — Animation scaling by device tier
- [Performance](performance-and-deployment.md) — Mobile performance considerations
