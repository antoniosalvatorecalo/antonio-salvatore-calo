# Component Behaviors & Interaction Patterns

> Component anatomy, states, and interaction guidelines.
> Every interactive element has defined idle, hover, active, focus-visible, and disabled states.

---

## Interactive Element States

All interactive elements follow this state matrix:

| State | Visual requirement |
|-------|-------------------|
| Idle | Default appearance per component |
| Hover | Cursor change, visual feedback (opacity/color/scale) within 0.2s |
| Active/Press | Immediate feedback (scale/opacity) within 0.1s |
| Focus-visible | 2px outline + offset, visible on keyboard tab (not mouse click) |
| Disabled | Reduced opacity (`opacity: 0.4`), no hover effects |

### Focus-Visible Pattern

```css
*:focus-visible {
  outline: 2px solid var(--glass-nav-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

Use `:focus-visible` (not `:focus`) to show focus only on keyboard navigation. Never use `outline: none` without a `:focus-visible` replacement.

---

## Buttons

### Navigation Tab Buttons (CentralNavMenu, MobileBottomNav)

```css
.nav-tab-btn {
  border-radius: var(--radius-sm);
  padding: 0 var(--space-4);
  font-size: var(--text-sm);
  letter-spacing: 0.08em;
  transition: all 0.2s ease;
  min-height: 44px;  /* WCAG 2.5.8 touch target */
}

.nav-tab-btn--active {
  background-color: var(--glass-nav-btn-active);
  font-weight: 500;
  color: var(--glass-nav-text);
}

.nav-tab-btn--inactive:hover {
  color: var(--glass-nav-text);
  background-color: var(--glass-nav-btn-hover);
}
```

### Magnetic Buttons (Desktop Nav)

```tsx
<motion.button
  initial={{ x: 0, y: 0 }}
  whileHover={{ x: cursorX, y: cursorY }}
  transition={{ stiffness: 150, damping: 15, mass: 0.1 }}
/>
```

### Glass Chip

```css
.glass-chip {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.2s cubic-bezier(0.22,1,0.36,1);
}

.glass-chip:hover {
  opacity: 0.85;
  transform: scale(1.03);
}

.glass-chip:focus-visible {
  outline: 2px solid var(--glass-nav-focus);
  outline-offset: 2px;
}
```

**Do**: Use glass-chip for secondary actions, filters, tags.
**Don't**: Use glass-chip as primary CTA — it's a supporting element.

---

## Links

### Standard Links

```css
.hover-underline {
  position: relative;
  text-decoration: none;
  display: inline-block;
}

.hover-underline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  width: 100%;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: left;
}

@media (hover: hover) {
  .hover-underline:hover::after {
    transform: scaleX(1);
  }
}

.hover-underline:focus-visible::after {
  transform: scaleX(1);
}
```

### CTA Links

```css
.project-type-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.project-type-cta:hover {
  color: var(--text-muted);
}

.project-type-cta:focus-visible {
  outline: 2px solid var(--text-primary);
  outline-offset: 2px;
  border-radius: 2px;
}
```

### Link with Arrow

```tsx
// Rotates arrow -45deg on hover
.link-arrow-icon {
  transition: transform 0.3s ease-out;
}
```

---

## ProjectCard

### Structure

```
┌────────────────────────────────────────┐
│  .project-card                         │
│  ┌────────────────────────────────┐    │
│  │  .project-img-container       │    │
│  │  ┌─────────────────────────┐   │    │
│  │  │  Image (aspect-ratio 2:1) │   │    │
│  │  │  .project-img-overlay    │   │    │
│  │  │  ┌─────────────────┐    │   │    │
│  │  │  │ overlay-link    │    │   │    │
│  │  │  │ → project client│    │   │    │
│  │  │  │ → arrow icon    │    │   │    │
│  │  │  └─────────────────┘    │   │    │
│  │  └─────────────────────────┘   │    │
│  └────────────────────────────────┘    │
│  .project-caption (title + meta)       │
└────────────────────────────────────────┘
```

### States

| State | Behavior |
|-------|----------|
| Idle | Image visible, overlay text prominent |
| Hover (desktop) | Overlay background appears (`bg-black/70`), weight swap 300→700 on title, arrow rotates -45deg |
| Hover (touch) | Tap reveals overlay details |
| Focus-visible | 2px outline on overlay link |
| Entrance | GSAP staggered reveal from below + perspective transform |

### Key CSS

```css
.project-img-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-md);
  cursor: pointer;
  aspect-ratio: 2 / 1;
}

.project-card-wrapper {
  opacity: 0;
  transform: translateY(40px);
  will-change: opacity, transform;
}

/* Image reveal matte (GSAP animated) */
.project-img-reveal-matte {
  background: linear-gradient(90deg, transparent 0%, var(--bg-inverse) 18%, var(--bg-inverse) 78%, transparent 100%);
  mix-blend-mode: normal;
  transform: skewX(-12deg) translateX(-118%);
}
```

---

## Cards (Generic)

```css
.card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background-color: var(--bg-primary);
}

.card-header   { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-1); }
.card-title    { font-size: var(--text-h2); font-weight: 600; line-height: 1; letter-spacing: -0.01em; }
.card-description { font-size: var(--text-sm); color: var(--text-muted); }
.card-content  { padding: var(--space-6); padding-top: 0; }
.card-footer   { padding: var(--space-6); padding-top: 0; display: flex; align-items: center; }
```

---

## Service Card

### Structure

```
┌───────── .service-card ──────────────────┐
│                                           │
│  .service-icon (top-left, absolute)       │
│                                           │
│  .service-card-bottom (absolute, bottom)  │
│  └─ .service-label (uppercase, bold)      │
│                                           │
│  .service-desc-mask (absolute, bottom)    │
│  └─ .service-desc (hidden by default)     │
│                                           │
└───────────────────────────────────────────┘
```

### States

| State | Behavior |
|-------|----------|
| Idle | Background: `var(--bg-tertiary)`. Only icon + label visible |
| Hover (desktop) | Background → `var(--bg-secondary)`. Label shifts up 4px. Description fades in below |
| Active (touch) | `.is-active` class toggles same hover state. Background → `var(--bg-secondary)` |
| Focus-visible | Outline on link elements inside card |

```css
.service-card { aspect-ratio: 4 / 3; min-height: 9.5rem; }
.service-hover-desc {
  opacity: 0; transform: translateY(8px); max-height: 0;
  transition: opacity 0.3s, transform 0.3s, max-height 0.3s;
}
@media (hover: hover) {
  .service-hover-card:hover .service-hover-desc { opacity: 1; transform: translateY(0); max-height: 80px; }
}
```

---

## Navigation Components

### CentralNavMenu (Desktop)

- **Position**: Fixed bottom center, `z-index: var(--z-nav)`
- **Container**: `.glass-nav` class (backdrop-filter blur + border + shadow)
- **Height**: 46px
- **Items**: Logo | Home | Work | Studio | Contact | Theme toggle
- **Interaction**: Magnetic hover spring on buttons. Active state via pathname.

### MobileBottomNav (Mobile/Tablet)

- **Position**: Fixed bottom, `z-index: var(--z-mobile-bottom-nav)`
- **Tabs**: Home | Work | Studio | Contact | Theme (last tab)
- **Active state**: Derived from `pathname`. Theme toggle excluded from active matching.

### ProjectMobileNav (Mobile project pages)

- **Position**: Floating bottom, `z-index: var(--z-nav-floating)`
- **Behavior**: Horizontal scroll with `scroll-snap-type: x mandatory`
- **Active section**: Synced to `ScrollerContext.activeSection`
- **Underline**: `scaleX` 0→1 via Motion spring

### Skip Link

- **Position**: Fixed top center, `z-index: var(--z-skip-link)`
- **Visibility**: Hidden by default, visible on first Tab key press
- **Behavior**: Skip to main content, then focus returns programmatically

```css
.skip-link {
  position: fixed;
  top: var(--space-2);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-skip-link);
  background-color: black;
  color: white;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-sm);
}
.skip-link:focus { outline: 2px solid white; outline-offset: 2px; }
```

---

## ContactBuilder

Sentence-based form builder with typewriter-style interaction.

### States

| Step | Component | Visual |
|------|-----------|--------|
| Step 1 | Sentence prompt + inline input + dropdown suggestions | Inline editing, mirror sizing |
| Step 2 | Follow-up prompts based on step 1 | Same pattern |
| Review | Summary of all selections | Read-only, click to change |
| Submitted | Confirmation message | CTA link to email/phone |

### CSS

```css
.sentence-input {
  background: transparent;
  font-weight: 700;
  color: var(--text-primary);
  caret-color: var(--text-primary);
}
.sentence-input::placeholder { opacity: 0.25; font-weight: 400; }

.sentence-dropdown {
  z-index: var(--z-dropdown);
  background: var(--bg-primary);
  min-width: 14rem;
  padding: var(--space-2) 0;
}
.dropdown-option { opacity: 0.6; transition: opacity 0.15s; }
.dropdown-option:hover { opacity: 1; }
```

---

## Contact Link Pattern

Consistent hover underline + arrow rotation:

```css
.text-part::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.contact-link:hover .text-part::after { opacity: 1; }

.arrow { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.contact-link:hover .arrow { transform: rotate(-45deg); }
```

---

## Preloader

- **Duration**: MIN_DURATION_MS = 3200ms
- **Z-index**: `--z-preloader` (900)
- **Content**: CurvedLoop animated text + preloader-loop-row
- **Gate**: Page content hidden (`html.loading opacity: 0`) until preloader completes
- **Navigation**: Skip hero GSAP entrance on back-navigation via `isFirstLoad` flag

---

## Scroll Stagger Animation System

Data attributes for left-column cascade reveals:

```html
<div data-stagger>         <!-- 18px translateY → 0 -->
<div data-stagger-medium>  <!-- 12px translateY → 0 -->
<div data-stagger-shallow> <!-- 8px translateY → 0 -->
```

Triggered by adding `.animate` class via GSAP ScrollTrigger or AnimationOrchestrator.

Media query responsive adjustments:
- **Mobile**: Reduced `translateY` values, faster duration (0.45s)
- **Reduced motion**: All transforms set to none, opacity forced to 1

---

## Loading States

| Component | Loading behavior |
|-----------|-----------------|
| Page | Preloader with CurvedLoop animation, 3200ms min |
| Project cards | GSAP reveals after Lenis init (initial opacity 0, translateY 40px) |
| Lenis | MutationObserver watches for `.scroll-content`, 1500ms timeout → fallback to native scroll |
| Fonts | `font-display: block` for body weights (no FOUT), `swap` for display weights |
| Images | Natural loading (no blur placeholder). Aspect-ratio containers prevent CLS |

---

## Error & Empty States

| Component | Error state | Empty state |
|-----------|-------------|-------------|
| All | No dedicated error states (static portfolio) | N/A |
| Contact form | Styled failures via sentence-builder interaction | Default prompts always present |
| Router | 404 handled by route structure | N/A |

---

## Dos and Don'ts

### Do
- Define all four interactive states (idle, hover, active, focus-visible)
- Use `:focus-visible` for keyboard focus indicators
- Set `min-height: 44px` on all interactive touch targets (WCAG 2.5.8)
- Use `@media (hover: hover)` for hover effects — prevents sticky-hover on touch
- Use `aspect-ratio` on image containers
- Wrap interactive content in `<a>` or `<button>` — not `<div>` with onClick

### Don't
- Remove `outline` without providing `:focus-visible` replacement
- Use `:focus` instead of `:focus-visible` (shows focus ring on click)
- Create interactive `<div>` or `<span>` without `role` + `tabindex` + keyboard handler
- Nest interactive elements (button inside button, clickable inside clickable)
- Use hover-only effects on mobile — provide tap alternatives (`.is-active` class pattern)
- Forget to hide decorative images from screen readers (`alt=""` or `aria-hidden`)
