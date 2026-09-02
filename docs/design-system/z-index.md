# Z-Index System

> Centralized stacking order. No scattered inline `z-[50]` values.
> All layers defined as CSS custom properties in `:root`.

---

## Layer Chart

| Layer | Token | Value | Occupant | Notes |
|-------|-------|-------|----------|-------|
| Skip link | `--z-skip-link` | 999 | Skip-to-content link | Highest — must be above preloader when focused (WCAG 2.4.1) |
| Preloader | `--z-preloader` | 900 | App preloader overlay | Above ALL content during initial load |
| Main nav | `--z-nav` | 100 | CentralNavMenu, desktop ThemeToggle | Primary navigation layer |
| View switcher | `--z-view-switcher` | 90 | WorkViewSwitcher | Just below main nav |
| Floating nav | `--z-nav-floating` | 70 | ProjectMobileNav, BackToTop, mobile ThemeToggle | Floating controls |
| Project shell | `--z-project-shell` | 60 | ProjectBrutalistLayout | Project page overlay |
| Mobile nav | `--z-mobile-bottom-nav` | 50 | MobileBottomNav | Mobile navigation bar |
| Dropdown | `--z-dropdown` | 20 | ContactBuilder dropdown | Overlays content |
| Base | default | 0 | All page content | Default stacking |

```
999  ┌─── Skip link ──────────────────────────────┐
     │  (visible only on keyboard focus)           │
900  ├─── Preloader ───────────────────────────────┤
     │  (above all content during 3200ms load)      │
100  ├─── Main nav (CentralNavMenu) ───────────────┤
 90  ├─── View switcher (WorkViewSwitcher) ────────┤
 70  ├─── Floating nav (ProjectMobileNav, BackToTop)│
 60  ├─── Project shell (ProjectBrutalistLayout) ──┤
 50  ├─── Mobile nav (MobileBottomNav) ────────────┤
 20  ├─── Dropdown (ContactBuilder) ───────────────┤
  0  └─── Base content ────────────────────────────┘
```

---

## CSS Custom Properties

```css
:root {
  --z-dropdown:         20;
  --z-mobile-bottom-nav: 50;
  --z-project-shell:     60;
  --z-nav-floating:      70;
  --z-view-switcher:     90;
  --z-nav:              100;
  --z-preloader:        900;
  --z-skip-link:        999;
}
```

## Utility Classes

```css
.z-dropdown          { z-index: var(--z-dropdown); }
.z-mobile-bottom-nav { z-index: var(--z-mobile-bottom-nav); }
.z-project-shell     { z-index: var(--z-project-shell); }
.z-nav-floating      { z-index: var(--z-nav-floating); }
.z-view-switcher     { z-index: var(--z-view-switcher); }
.z-nav               { z-index: var(--z-nav); }
.z-preloader         { z-index: var(--z-preloader); }
.z-skip-link         { z-index: var(--z-skip-link); }
```

---

## Invariants (Cannot Violate)

1. **Skip link (999) > Preloader (900)** — skip link must be visible when focused, even during load
2. **Preloader (900) > all other layers** — preloader blocks all content during initial load
3. **Nav (100) > Project shell (60)** — project pages stack below main navigation
4. **Project shell (60) > Mobile nav (50)** — mobile nav is below project overlay
5. **No elements between 901-998** — reserved for preloader edge cases
6. **No elements above 999** — skip link is the ceiling
7. **No elements between 101-899** — keep the gap between nav and preloader clean

---

## Stacking Context Rules

1. **Use CSS custom properties**, never inline `z-index` values
2. **Use utility classes** (`.z-nav`, `.z-preloader`) when applying z-index in component CSS
3. **No `z-[number]` Tailwind classes** — they bypass the token system
4. Every `position: fixed`, `position: absolute`, or `position: sticky` element must use a z-index token
5. New layers require a new token and must respect the invariant chain
6. `position: relative` without z-index does not create a stacking context unless `z-index` is set

---

## Inserting a New Layer

1. Add token to `:root` in `src/index.css` with appropriate value between existing layers
2. Add utility class below the existing ones
3. Update this chart and verify invariants still hold
4. Search for scattered inline z-index values and replace them

Example — adding a "toast notification" layer between nav (100) and preloader (900):

```css
--z-toast: 200;
.z-toast { z-index: var(--z-toast); }
```

---

## Dos and Don'ts

### Do
- Use `--z-*` tokens or `.z-*` classes for all z-index values
- Keep the invariant chain intact when adding new layers
- Place new elements at the lowest possible z-index that works

### Don't
- Use Tailwind `z-[50]`, `z-10`, etc. — bypasses token system
- Add elements between 101 and 899 without careful consideration
- Use `z-index: 9999` — skip link already occupies 999
- Set z-index on non-positioned elements (has no effect)
- Create new stacking contexts unnecessarily (via `isolation: isolate`, `transform`, `filter`, `will-change`)
