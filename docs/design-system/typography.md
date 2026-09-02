# Typography System

> Single-family type system with fluid Minor Third scale.
> Font: TT Interphases Pro (local WOFF2, no CDN).

---

## Font Stack

```css
--font-sans: "TT Interphases Pro", ui-sans-serif, system-ui, sans-serif;
```

### Font Files

All local in `/public/fonts/tt-interphases-pro/`. Preloaded via `<link rel="preload">` in `index.html`.

| Weight | Value | File | `font-display` |
|--------|-------|------|----------------|
| Light | 300 | `...Light.woff2` | swap |
| Regular | 400 | `...Regular.woff2` | block |
| Medium | 500 | `...Medium.woff2` | block |
| DemiBold | 600 | `...DemiBold.woff2` | swap |
| Bold | 700 | `...Bold.woff2` | swap |
| Black | 900 | `...Black.woff2` | swap |

**CSP**: `font-src 'self' fonts.gstatic.com` — Google Fonts only as fallback. Zero network requests after initial load.

---

## Type Scale

Fluid Minor Third (base 16px × 1.200). CSS `clamp()` for responsive scaling without breakpoints.

### Global Scale (`:root`)

| Token | CSS Value | Min → Max | Weight | Usage |
|-------|-----------|-----------|--------|-------|
| `--text-display-xl` | `clamp(3rem, 6vw + 0.5rem, 5rem)` | 48px → 80px | 700 | Hero headlines |
| `--text-display` | `clamp(2.063rem, 4vw + 0.5rem, 3.625rem)` | 33px → 58px | 700 | Section hero |
| `--text-h1` | `clamp(1.75rem, 3.5vw + 0.25rem, 3rem)` | 28px → 48px | 700 | Page titles |
| `--text-h2` | `clamp(1.5rem, 2.8vw + 0.25rem, 2.5rem)` | 24px → 40px | 600 | Section headings |
| `--text-h3` | `clamp(1.25rem, 2.2vw + 0.2rem, 2.063rem)` | 20px → 33px | 600 | Subsection heads |
| `--text-h4` | `clamp(1.125rem, 1.8vw + 0.125rem, 1.75rem)` | 18px → 28px | 500 | Group headings |
| `--text-h5` | `clamp(1rem, 1.5vw + 0.1rem, 1.438rem)` | 16px → 23px | 500 | Card titles |
| `--text-h6` | `clamp(0.875rem, 1.2vw + 0.1rem, 1.188rem)` | 14px → 19px | 500 | Small headings |
| `--text-base` | `1rem` | 16px fixed | 400 | Body paragraphs |
| `--text-sm` | `0.813rem` | 13px fixed | 400 | Secondary text |
| `--text-xs` | `0.688rem` | 11px fixed | 400 | Captions, footnotes |

### The Hierarchy Rule

Every typographic role maintains a **≥1.25× size ratio** to its predecessor. No flat scales.

```
text-xs (11px) → text-sm (13px) → text-base (16px) → text-h6 (14-19px) → text-h5 (16-23px) → ...
```

---

## Typographic Roles

### Display (Hero)

```css
font-size: var(--text-display-xl);
font-weight: 700;
line-height: 1.05;
letter-spacing: -0.03em;
```

- Used for: "Antonio Salvatore Calò" hero headline
- Mobile override: `--text-display-xl: clamp(1.75rem, 7vw + 0.5rem, 2.5rem)` at <768px

### H1 — Page Titles

```css
font-size: var(--text-h1);
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.02em;
```

### H2 — Section Headings

```css
font-size: var(--text-h2);
font-weight: 600;
line-height: 1.15;
letter-spacing: -0.015em;
```

### Body

```css
font-size: var(--text-base);
font-weight: 400;
line-height: 1.6;
max-width: 75ch;
text-wrap: pretty;
```

### Small — Labels, captions, metadata

```css
font-size: var(--text-sm);
font-weight: 500;
letter-spacing: 0.08em;
text-transform: uppercase;
```

### Extra Small — Credits, footnotes

```css
font-size: var(--text-xs);
font-weight: 500;
letter-spacing: 0.1em;
text-transform: uppercase;
```

---

## Left Column Typographic Scaling

Desktop left column (20% width) uses its own scaled-down type tokens to fit narrow width.

### PortfolioLayout (Home page)

```css
.left-col-container {
  --text-h1:  clamp(1.35rem, 2.5vw + 0.15rem, 1.85rem);
  --text-h2:  clamp(1.2rem, 2vw + 0.12rem, 1.65rem);
  --text-h3:  clamp(1.05rem, 1.5vw + 0.1rem, 1.35rem);
  --text-h4:  clamp(0.925rem, 1.2vw + 0.08rem, 1.15rem);
  --text-h5:  clamp(0.825rem, 0.9vw + 0.05rem, 1.0rem);
  --text-h6:  clamp(0.75rem, 0.8vw + 0.05rem, 0.9rem);
  --text-base: 0.875rem; /* 14px */
  --text-sm:   0.75rem;  /* 12px */
  --text-xs:   0.65rem;  /* 10.4px */
  font-size: var(--text-sm);
}
```

### ProjectBrutalistLayout (Project pages — left column)

```css
.project-left-col {
  --text-base: clamp(1rem, 1.6vw, 1.1rem);
  --text-h5:   clamp(0.9rem, 1.4vw, 1rem);
  --text-h4:   clamp(1rem, 1.6vw, 1.1rem);
  --text-h3:   clamp(1.1rem, 1.8vw, 1.25rem);
  --text-h2:   clamp(1.3rem, 2vw, 1.45rem);
  --text-h1:   clamp(1.5rem, 2.2vw, 1.7rem);
  font-size: clamp(0.9rem, 1.6vw, 1rem);
}
```

---

## Project-Specific Typographic Roles

| Role | Token | Weight | Letter-spacing | Used for |
|------|-------|--------|----------------|----------|
| `.project-type-section-title` | `var(--text-sm)` | 500 | 0.1em uppercase | Section titles |
| `.project-type-body` | `var(--text-h5)` | 400 | — | Project descriptions, max 58ch |
| `.project-type-body--mobile` | `var(--text-base)` | 400 | — | Mobile descriptions, max 64ch |
| `.project-type-cta` | `var(--text-sm)` | 500 | 0.08em uppercase | Call-to-action links |
| `.project-type-credits-label` | `var(--text-xs)` | 500 | 0.14em uppercase | Credit field labels |
| `.project-type-credits-value` | `var(--text-xs)` | 400 | -0.01em | Credit values |
| `.project-type-metadata-value` | `var(--text-h6)` | 300 | -0.01em | Metadata values |

---

## Line Lengths

| Context | Max width | Rule |
|---------|-----------|------|
| Body paragraphs | 75ch | Readability |
| Project descriptions | 58ch | Narrow column fit |
| Mobile project descriptions | 64ch | Slightly wider on mobile |
| Left column (desktop) | Natural (20% width) | Scaled type compensates |

---

## Tablet Typography Scale

Tablet mode (768-1024px) uses dedicated fixed-size tokens for consistency:

```css
--text-tablet-xs:   0.75rem;   /* 12px */
--text-tablet-sm:   0.875rem;  /* 14px */
--text-tablet-base: 1rem;      /* 16px */
--text-tablet-lg:   1.125rem;  /* 18px */
--text-tablet-xl:   1.25rem;   /* 20px */
--text-tablet-2xl:  1.5rem;    /* 24px */
--text-tablet-3xl:  1.875rem;  /* 30px */
--text-tablet-4xl:  2.25rem;   /* 36px */
```

---

## Color

OKLCH color space for perceptual uniformity. All text tokens exceed WCAG AA 4.5:1.

| Token | Light | Dark |
|-------|-------|------|
| `--text-primary` | #0A0A0A (19.6:1) | #F5F5F5 (15.3:1) |
| `--text-secondary` | #3D3D3D (9.73:1) | #A0A0A0 (5.21:1) |
| `--text-muted` | #6B6B6B (5.74:1) | #888888 (5.35:1) |
| `--text-inverse` | #F5F5F5 (on dark) | #0A0A0A (on light) |

---

## Dos and Don'ts

### Do
- Use fluid `clamp()` for all heading sizes — never hard px
- Maintain full heading hierarchy (h1 → h2 → h3...) with no jumps
- Keep body text ≤75ch line length
- Use `text-wrap: pretty` for body paragraphs
- Apply `letter-spacing: -0.02em` to display/h1 for tighter editorial feel

### Don't
- Use different font families for display vs body
- Add `line-height < 1.0` to any text (causes descender clipping)
- Apply `text-transform: uppercase` to body paragraphs
- Use font weights outside the 6 provided (300, 400, 500, 600, 700, 900)
- Create custom font sizes outside the defined scale
- Use Google Fonts CDN — fonts are local only
