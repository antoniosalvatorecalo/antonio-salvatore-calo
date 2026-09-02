# Color System

> Monochrome palette with light/dark themes.
> All tokens in OKLCH for perceptual uniformity. All pairs > WCAG AA 4.5:1.

---

## Surface Colors

### Light Theme (`:root` default)

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| `--bg-primary` | `#FFFFFF` | oklch(1 0 0) | Main background |
| `--bg-secondary` | `#F0F0F0` | Elevated surfaces, hover states |
| `--bg-tertiary` | `#E8E8E8` | Card/service backgrounds |
| `--bg-inverse` | `#141414` | Dark surfaces in light mode |
| `--bg-inverse-subtle` | `#1F1F1F` | Subtle inverse surfaces |

### Dark Theme (`[data-theme="dark"]`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#141414` | Main background |
| `--bg-secondary` | `#1F1F1F` | Elevated surfaces |
| `--bg-tertiary` | `#2A2A2A` | Card backgrounds |
| `--bg-inverse` | `#F5F5F5` | Light surfaces in dark mode |
| `--bg-inverse-subtle` | `#F0F0F0` | Subtle inverse surfaces |

---

## Text Colors

### Light Theme

| Token | Hex | Contrast ratio | Usage |
|-------|-----|----------------|-------|
| `--text-primary` | `#0A0A0A` | 19.6:1 on white | Body, headings |
| `--text-secondary` | `#3D3D3D` | 9.73:1 on white | Secondary info |
| `--text-muted` | `#6B6B6B` | 5.74:1 on white | Labels, captions |
| `--text-inverse` | `#F5F5F5` | 15.3:1 on #141414 | Text on dark surfaces |
| `--text-inverse-muted` | `#A0A0A0` | 5.21:1 on #141414 | Muted text on dark |

### Dark Theme

| Token | Hex | Contrast ratio | Usage |
|-------|-----|----------------|-------|
| `--text-primary` | `#F5F5F5` | 15.3:1 on #141414 | Body, headings |
| `--text-secondary` | `#A0A0A0` | 5.21:1 on #141414 | Secondary info |
| `--text-muted` | `#888888` | 5.35:1 on #141414 | Labels, captions |
| `--text-inverse` | `#0A0A0A` | 19.6:1 on #F5F5F5 | Text on light surfaces |
| `--text-inverse-muted` | `#3D3D3D` | 9.73:1 on #F5F5F5 | Muted text on light |

**All text tokens exceed WCAG AA 4.5:1 minimum. Primary text exceeds AAA 7:1.**

---

## Border Colors

### Light Theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--border-subtle` | `#E2E2E2` | Light dividers |
| `--border-default` | `#C8C8C8` | Standard borders on cards |
| `--border-strong` | `#0A0A0A` | High-contrast edges |
| `--border-inverse` | `rgba(245, 245, 245, 0.1)` | Subtle outlines on dark |

### Dark Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--border-subtle` | `rgba(245, 245, 245, 0.08)` | Light dividers |
| `--border-default` | `rgba(245, 245, 245, 0.15)` | Standard borders |
| `--border-strong` | `#F5F5F5` | High-contrast edges |
| `--border-inverse` | `rgba(10, 10, 10, 0.15)` | Subtle outlines on light |

---

## Glass Nav Tokens

Special tokens for navigation glass effect. Theme-aware via CSS custom properties.

### Light Theme

| Token | Value |
|-------|-------|
| `--glass-nav-bg` | `rgba(255, 255, 255, 0.72)` |
| `--glass-nav-border` | `rgba(0, 0, 0, 0.08)` |
| `--glass-nav-highlight` | `rgba(255, 255, 255, 0.9)` |
| `--glass-nav-shadow` | `0 2px 20px rgba(0, 0, 0, 0.08)` |
| `--glass-nav-text` | `#0A0A0A` |
| `--glass-nav-text-inactive` | `#626262` |
| `--glass-nav-btn-hover` | `rgba(0, 0, 0, 0.06)` |
| `--glass-nav-btn-active` | `rgba(0, 0, 0, 0.10)` |
| `--glass-nav-divider` | `rgba(0, 0, 0, 0.10)` |
| `--glass-nav-focus` | `rgba(10, 10, 10, 0.55)` |

### Dark Theme

| Token | Value |
|-------|-------|
| `--glass-nav-bg` | `rgba(22, 22, 24, 0.78)` |
| `--glass-nav-border` | `rgba(255, 255, 255, 0.10)` |
| `--glass-nav-highlight` | `rgba(255, 255, 255, 0.07)` |
| `--glass-nav-shadow` | `0 2px 24px rgba(0, 0, 0, 0.40)` |
| `--glass-nav-text` | `#F5F5F5` |
| `--glass-nav-text-inactive` | `#AAAAAA` |
| `--glass-nav-btn-hover` | `rgba(255, 255, 255, 0.08)` |
| `--glass-nav-btn-active` | `rgba(255, 255, 255, 0.14)` |
| `--glass-nav-divider` | `rgba(255, 255, 255, 0.10)` |
| `--glass-nav-focus` | `rgba(245, 245, 245, 0.65)` |

### CSS Class

```css
.glass-nav {
  background: var(--glass-nav-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-nav-border);
  box-shadow: var(--glass-nav-shadow), inset 0 1px 0 var(--glass-nav-highlight);
  color: var(--glass-nav-text);
}
```

Fallback for browsers without `backdrop-filter` support:

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass-nav {
    background: rgba(248, 248, 248, 0.98);   /* light */
    /* dark:  rgba(22, 22, 24, 0.98) */
  }
}
```

---

## Glass Chip

Same aesthetic as glass-nav, applied to inline chips and small interactive elements:

```css
.glass-chip {
  background: var(--glass-nav-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-nav-border);
  box-shadow: var(--glass-nav-shadow);
  color: var(--glass-nav-text);
  padding: var(--space-2) var(--space-3);
  min-height: 44px;
  min-width: 44px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.2s cubic-bezier(0.22,1,0.36,1);
}
```

---

## Plain Overlay

Non-glass overlay for project cards (transparent dark/light backdrops):

```css
.plain-overlay {
  background: rgba(0, 0, 0, 0.6);   /* light mode */
  color: var(--text-inverse);
}

/* dark mode */
html[data-theme="dark"] .plain-overlay {
  background: rgba(255, 255, 255, 0.6);
  color: var(--text-inverse);
}
```

---

## Color Implementation Rules

1. **Never use ad-hoc hex values.** All colors must come from the token system.
2. **Use OKLCH for new color tokens** — perceptual uniformity across themes.
3. **All text + background pairs must exceed WCAG AA 4.5:1.** Verify with contrast tool.
4. **No gradients** — not on text, backgrounds, or borders.
5. **No shadows** — depth via spacing, contrast, and motion only.
6. **Glass effect only on navigation elements** — never on cards or content.
7. **Theme toggle swaps `data-theme` on `<html>`** — CSS variables cascade automatically.

---

## Dos and Don'ts

### Do
- Use `--text-primary` for main body copy and headings
- Use `--text-muted` for labels, secondary info, captions
- Use `--border-default` for card borders and dividers
- Test all color combinations for WCAG AA contrast
- Use `oklch()` for new color tokens

### Don't
- Use `#000` or `#fff` directly — always use tokens
- Apply glass effect outside navigation components
- Add decorative gradients or color accents
- Use pastel, saturated, or low-contrast color combinations
- Hardcode color values for theme-aware elements — always use CSS variables
