# CSS Custom Properties — Complete Reference

> Source of truth: `src/index.css` `:root` and `[data-theme="dark"]` blocks.
> All tokens are defined once and referenced across all components.

---

## Color Tokens — Surfaces

| Property | Light | Dark |
|----------|-------|------|
| `--bg-primary` | `#FFFFFF` | `#141414` |
| `--bg-secondary` | `#F0F0F0` | `#1F1F1F` |
| `--bg-tertiary` | `#E8E8E8` | `#2A2A2A` |
| `--bg-inverse` | `#141414` | `#F5F5F5` |
| `--bg-inverse-subtle` | `#1F1F1F` | `#F0F0F0` |

## Color Tokens — Text

| Property | Light | Dark |
|----------|-------|------|
| `--text-primary` | `#0A0A0A` (19.6:1) | `#F5F5F5` (15.3:1) |
| `--text-secondary` | `#3D3D3D` (9.73:1) | `#A0A0A0` (5.21:1) |
| `--text-muted` | `#6B6B6B` (5.74:1) | `#888888` (5.35:1) |
| `--text-inverse` | `#F5F5F5` (15.3:1) | `#0A0A0A` (19.6:1) |
| `--text-inverse-muted` | `#A0A0A0` (5.21:1) | `#3D3D3D` (9.73:1) |

## Color Tokens — Borders

| Property | Light | Dark |
|----------|-------|------|
| `--border-subtle` | `#E2E2E2` | `rgba(245, 245, 245, 0.08)` |
| `--border-default` | `#C8C8C8` | `rgba(245, 245, 245, 0.15)` |
| `--border-strong` | `#0A0A0A` | `#F5F5F5` |
| `--border-inverse` | `rgba(245, 245, 245, 0.1)` | `rgba(10, 10, 10, 0.15)` |

## Glass Nav Tokens

| Property | Light Value | Dark Value |
|----------|-------------|------------|
| `--glass-nav-bg` | `rgba(255, 255, 255, 0.72)` | `rgba(22, 22, 24, 0.78)` |
| `--glass-nav-border` | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.10)` |
| `--glass-nav-highlight` | `rgba(255, 255, 255, 0.9)` | `rgba(255, 255, 255, 0.07)` |
| `--glass-nav-shadow` | `0 2px 20px rgba(0,0,0,0.08)` | `0 2px 24px rgba(0,0,0,0.40)` |
| `--glass-nav-text` | `#0A0A0A` | `#F5F5F5` |
| `--glass-nav-text-inactive` | `#626262` | `#AAAAAA` |
| `--glass-nav-btn-hover` | `rgba(0, 0, 0, 0.06)` | `rgba(255, 255, 255, 0.08)` |
| `--glass-nav-btn-active` | `rgba(0, 0, 0, 0.10)` | `rgba(255, 255, 255, 0.14)` |
| `--glass-nav-divider` | `rgba(0, 0, 0, 0.10)` | `rgba(255, 255, 255, 0.10)` |
| `--glass-nav-focus` | `rgba(10, 10, 10, 0.55)` | `rgba(245, 245, 245, 0.65)` |

## Spacing Tokens

| Token | Value (rem) | Value (px) |
|-------|-------------|------------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-24` | 6rem | 96px |
| `--space-32` | 8rem | 128px |

## Section Padding Tokens (Fluid)

| Token | `clamp()` |
|-------|-----------|
| `--section-xs` | `clamp(2rem, 4vw, 3rem)` → 32–48px |
| `--section-sm` | `clamp(3rem, 6vw, 4rem)` → 48–64px |
| `--section-md` | `clamp(4rem, 8vw, 6rem)` → 64–96px |
| `--section-lg` | `clamp(6rem, 10vw, 8rem)` → 96–128px |

## Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | Square edges — preferred default |
| `--radius-sm` | 2px | Buttons, chips, cards |
| `--radius-md` | 4px | Card borders, image containers |
| `--radius-pill` | 9999px | Reserved (not currently used) |

## Typography Scale Tokens

### Heading Sizes (Fluid)

| Token | `clamp()` | Min → Max |
|-------|-----------|-----------|
| `--text-display-xl` | `clamp(3rem, 6vw + 0.5rem, 5rem)` | 48px → 80px |
| `--text-display` | `clamp(2.063rem, 4vw + 0.5rem, 3.625rem)` | 33px → 58px |
| `--text-h1` | `clamp(1.75rem, 3.5vw + 0.25rem, 3rem)` | 28px → 48px |
| `--text-h2` | `clamp(1.5rem, 2.8vw + 0.25rem, 2.5rem)` | 24px → 40px |
| `--text-h3` | `clamp(1.25rem, 2.2vw + 0.2rem, 2.063rem)` | 20px → 33px |
| `--text-h4` | `clamp(1.125rem, 1.8vw + 0.125rem, 1.75rem)` | 18px → 28px |
| `--text-h5` | `clamp(1rem, 1.5vw + 0.1rem, 1.438rem)` | 16px → 23px |
| `--text-h6` | `clamp(0.875rem, 1.2vw + 0.1rem, 1.188rem)` | 14px → 19px |

### Fixed Sizes

| Token | Value (rem) | Value (px) |
|-------|-------------|------------|
| `--text-base` | 1rem | 16px |
| `--text-sm` | 0.813rem | 13px |
| `--text-xs` | 0.688rem | 11px |

### Mobile Override

```css
@media (max-width: 767px) {
  --text-display-xl: clamp(1.75rem, 7vw + 0.5rem, 2.5rem); /* 28px→40px */
}
```

### Tablet Fixed Scale

| Token | Value |
|-------|-------|
| `--text-tablet-xs` | 0.75rem (12px) |
| `--text-tablet-sm` | 0.875rem (14px) |
| `--text-tablet-base` | 1rem (16px) |
| `--text-tablet-lg` | 1.125rem (18px) |
| `--text-tablet-xl` | 1.25rem (20px) |
| `--text-tablet-2xl` | 1.5rem (24px) |
| `--text-tablet-3xl` | 1.875rem (30px) |
| `--text-tablet-4xl` | 2.25rem (36px) |

### Left Column (Home page) Desktop Scale

```css
.left-col-container {
  --text-h1:  clamp(1.35rem, 2.5vw + 0.15rem, 1.85rem);
  --text-h2:  clamp(1.2rem, 2vw + 0.12rem, 1.65rem);
  --text-h3:  clamp(1.05rem, 1.5vw + 0.1rem, 1.35rem);
  --text-h4:  clamp(0.925rem, 1.2vw + 0.08rem, 1.15rem);
  --text-h5:  clamp(0.825rem, 0.9vw + 0.05rem, 1.0rem);
  --text-h6:  clamp(0.75rem, 0.8vw + 0.05rem, 0.9rem);
  --text-base: 0.875rem;  /* 14px */
  --text-sm:   0.75rem;   /* 12px */
  --text-xs:   0.65rem;   /* 10.4px */
}
```

### Left Column (Project page) Desktop Scale

```css
.project-left-col {
  --text-base: clamp(1rem, 1.6vw, 1.1rem);
  --text-h5:   clamp(0.9rem, 1.4vw, 1rem);
  --text-h4:   clamp(1rem, 1.6vw, 1.1rem);
  --text-h3:   clamp(1.1rem, 1.8vw, 1.25rem);
  --text-h2:   clamp(1.3rem, 2vw, 1.45rem);
  --text-h1:   clamp(1.5rem, 2.2vw, 1.7rem);
}
```

---

## Z-Index Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `--z-dropdown` | 20 | ContactBuilder dropdown |
| `--z-mobile-bottom-nav` | 50 | MobileBottomNav |
| `--z-project-shell` | 60 | ProjectBrutalistLayout |
| `--z-nav-floating` | 70 | ProjectMobileNav, BackToTop, mobile ThemeToggle |
| `--z-view-switcher` | 90 | WorkViewSwitcher |
| `--z-nav` | 100 | CentralNavMenu, desktop ThemeToggle |
| `--z-preloader` | 900 | Preloader overlay |
| `--z-skip-link` | 999 | Skip link (keyboard first focus) |

---

## Font Family Token

```css
--font-sans: "TT Interphases Pro", ui-sans-serif, system-ui, sans-serif;
```

Applies to `body` via Tailwind `@theme`:

```css
@theme {
  --font-sans: "TT Interphases Pro", ui-sans-serif, system-ui, sans-serif;
}
```

---

## Easing Curves (Used across CSS + GSAP + Motion)

| Name | Curve | Usage |
|------|-------|-------|
| Premium ease | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, transitions |
| Cinematic ease | `cubic-bezier(0.85, 0, 0.15, 1)` | Dramatic reveals |
| Spring-like | `cubic-bezier(0.22, 1, 0.36, 1)` | Stagger animations |

---

## CSS Class Utilities

### Z-Index Classes

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

### Animation Classes

```css
.will-change-transform { will-change: transform; }
.blur-word             { display: inline-block; will-change: opacity, transform, filter; }
.hide-scrollbar        { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
```

### Glass Classes

```css
.glass-nav  { /* See colors.md — glass nav token set */ }
.glass-chip { /* See colors.md + components.md */ }
.plain-overlay { /* See colors.md */ }
```

---

## Data Attributes Reference

| Attribute | System | Values | Purpose |
|-----------|--------|--------|---------|
| `data-section` | AnimationOrchestrator | `hero`, `bio`, `principles`, `services`, `contact` | Section identity |
| `data-split` | ProjectBrutalistLayout | — | Scroll reveal trigger |
| `data-fade` | ProjectBrutalistLayout | — | Scroll reveal trigger |
| `data-stagger` | CSS animations | — | Deep stagger (18px y) |
| `data-stagger-medium` | CSS animations | — | Medium stagger (12px y) |
| `data-stagger-shallow` | CSS animations | — | Shallow stagger (8px y) |
| `data-entrance-item` | useEntranceReveal | — | Scroll reveal target |
| `data-project-stack` | LayoutSplitTextMediaStack | — | Media stack reveal |
| `data-scroll-sentinel` | Project credits | — | Scroll position tracking |
| `data-theme` | ThemeProvider | `light`, `dark` | Theme switching |
| `data-motion` | MotionPreferenceProvider | `reduced`, `full` | Motion intensity |
| `data-loading` | App | `true`, `false` | Loading state |
| `data-reveal` | Entrance system | `title`, `paragraph`, `cta`, `label`, `word`, `item` | Reveal type |

---

## When Adding a New Token

1. Add to `:root` in `src/index.css` with a `clamp()` value for responsive tokens
2. Add `[data-theme="dark"]` override if theme-dependent
3. Reference via `var(--token-name)` in component CSS — never duplicate the value
4. Add utility class in `src/index.css` if commonly used
5. Update this file with the new token
