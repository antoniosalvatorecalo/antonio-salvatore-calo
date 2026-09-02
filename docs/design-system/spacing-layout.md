# Spacing & Layout System

> 10-step spacing scale (4px → 128px), fluid section padding, dual-column grid.
> Brutalist foundation: consistent, predictable, no surprises.

---

## Spacing Scale

Base unit: 4px. Geometric progression up to 32px, then larger jumps.

| Token | Value (rem) | Value (px) | Usage |
|-------|-------------|------------|-------|
| `--space-1` | 0.25rem | 4px | Micro spacing, icon gaps |
| `--space-2` | 0.5rem | 8px | Tight gaps, chip padding |
| `--space-3` | 0.75rem | 12px | Button padding, form gaps |
| `--space-4` | 1rem | 16px | Standard gap, card padding |
| `--space-6` | 1.5rem | 24px | Between sections, form fields |
| `--space-8` | 2rem | 32px | Large gaps, section separation |
| `--space-12` | 3rem | 48px | Major section spacing |
| `--space-16` | 4rem | 64px | Hero bottom padding |
| `--space-24` | 6rem | 96px | Large section break |
| `--space-32` | 8rem | 128px | Maximum spacing |

**Rule**: Use these tokens for all margins, padding, and gaps. No ad-hoc spacing values.

---

## Section Padding (Fluid)

Fluid `clamp()` values that scale with viewport. Used for vertical padding of page sections.

| Token | Min | Preferred | Max | Usage |
|-------|-----|-----------|-----|-------|
| `--section-xs` | 2rem (32px) | 4vw | 3rem (48px) | Tight sections |
| `--section-sm` | 3rem (48px) | 6vw | 4rem (64px) | Standard spacing |
| `--section-md` | 4rem (64px) | 8vw | 6rem (96px) | Major sections |
| `--section-lg` | 6rem (96px) | 10vw | 8rem (128px) | Hero sections |

**Usage pattern**:

```css
.section {
  padding-top: var(--section-md);
  padding-bottom: var(--section-md);
}
```

---

## Layout Grid

### Desktop (>=1024px)

Dual-column layout. 20% left / 80% right. Both independent Lenis scroll.

```
┌─────────────┬──────────────────────────────────────┐
│  Left (20%) │            Right (80%)               │
│  —————————  │  ————————————————————————————————     │
│  AboutHero  │  ProjectCard × N (GSAP 3D entrance)  │
│  Bio        │  Scroll-driven skew + stagger         │
│  Principles │  Independent Lenis velocity           │
│  Services   │                                       │
│  Contact    │                                       │
│             │                                       │
│  Lenis      │  Lenis                                │
│  100dvh     │  100dvh                               │
└─────────────┴──────────────────────────────────────┘
```

#### Column Width Calculation

```css
.portfolio-columns {
  --left-col-target: 20%;
  --left-col-readable-min: 15rem;
  --right-col-readable-min: clamp(24rem, 38vw, 30rem);
  --left-col-width: clamp(
    var(--left-col-readable-min),
    var(--left-col-target),
    calc(100% - var(--right-col-readable-min))
  );
  --right-col-width: calc(100% - var(--left-col-width));
  --portfolio-column-gap: 1rem;
}
```

Collapse thresholds:

| Viewport | Left min | Right min | Note |
|----------|----------|-----------|------|
| 1024-1360px | 14rem | — | Tightens left column |
| 1024-1100px | 13rem | 22rem | Both columns compress |

#### Column Flex

```css
.left-col-container {
  width: calc(var(--left-col-width) - (var(--portfolio-column-gap) / 2));
  perspective: 1200px;  /* 3D card entrance */
}

.right-col-container {
  width: calc(var(--right-col-width) - (var(--portfolio-column-gap) / 2));
  perspective: 1200px;
}
```

### Tablet (768-1024px) & Mobile (<768px)

Single column. Content toggled via `activeTab` (`'work' | 'about'`). No Lenis — native scroll.

```
┌────────────────────────────────────────┐
│           Single column                │
│                                        │
│  Active tab: 'work' or 'about'         │
│                                        │
│  Full-width cards. No Lenis.           │
│  Simplified entrance animation.        │
│                                        │
│  MobileBottomNav (fixed bottom)        │
└────────────────────────────────────────┘
```

---

## Project Layout (Desktop)

Project pages use the same 20/80 column split:

```css
.project-left-col {
  width: 20%;
  /* Typography scaled for narrow column */
}

.project-right-col {
  width: 80%;
}
```

### Project Scroll Layout

Right column: native scroll (not Lenis) with `.project-scroll-container` — `inset:0; overflow-y: auto`.

Left column: sidebar with wheel-forwarding to right column Lenis on hover.

---

## Gap System

Consistent gap values through spacing tokens. No ad-hoc gap values.

| Context | Token | Example |
|---------|-------|---------|
| Card interior | `var(--space-2)` | gap between title and description |
| Form fields | `var(--space-4)` | between inputs |
| Section elements | `var(--space-6)` | between blocks |
| Grid items | `var(--space-3)` | service cards |
| Metadata grid | `var(--space-4)` | column gap, `var(--space-8)` row gap |
| Stack items | `var(--space-8)` | between scroll narrative sections |

---

## Component-Specific Padding

| Component | Padding | Notes |
|-----------|---------|-------|
| `card-header` | `var(--space-6)` | Top and sides |
| `card-content` | `var(--space-6)` bottom, 0 top | Continuous with header |
| `card-footer` | `var(--space-6)` bottom, 0 top | |
| `project-hero-section` | `var(--space-4)` (mobile), `var(--space-6)` (desktop) | Left/right padding |
| `mobile-hero-section` | `var(--space-4)` all sides | |
| `project-description-col` | `var(--space-3)` sides, `var(--space-16)` top, `var(--space-8)` bottom | |
| `service-card` | Icon: `var(--space-4)` top/left | Internal positioning |
| `service-card-bottom` | `var(--space-4)` bottom | Label area |
| `nav-container` | `var(--space-1)` wrap, `var(--space-8)` from bottom | Fixed nav |

---

## Min / Max Constraints

| Element | Constraint | Reason |
|---------|-----------|--------|
| Body text | `max-width: 75ch` | Readability |
| Project body | `max-width: 58ch` | Narrow column fit |
| Mobile buttons | `min-height: 44px`, `min-width: 44px` | WCAG 2.5.8 touch targets |
| Service cards | `min-height: 9.5rem` | Minimum readable area |
| Project images | `aspect-ratio: 2/1` | Consistent card appearance |
| Media stack items | `height: 92vh` (desktop) | Full-viewport impact |
| Glass chip | `min-height: 44px`, `min-width: 44px` | Touch target |
| Left column | `min-width: 15rem` (narrower on smaller screens) | Readable minimum |

---

## Dos and Don'ts

### Do
- Use spacing tokens for all margins, padding, and gaps
- Use fluid section padding (`--section-*`) for page sections
- Maintain 44px minimum touch targets on interactive elements
- Use `aspect-ratio` for image containers instead of fixed heights
- Apply `perspective: 1200px` to cards that animate with 3D transforms

### Don't
- Use ad-hoc px/rem values outside the spacing scale
- Hardcode heights on text containers — use `min-height` where needed
- Mix `gap` and individual margin on the same flex/grid container
- Set fixed widths on responsive columns — use `clamp()` or percentage
- Forget scroll padding on mobile content (`.right-scroll-inner` has `padding-bottom: var(--space-8)` for mobile nav clearance)
