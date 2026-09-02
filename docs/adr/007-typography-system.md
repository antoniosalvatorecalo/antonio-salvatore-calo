# ADR-007: Typography System

**Status**: Accepted | **Date**: 2026-06-03 | **Owner**: Design + Engineering

## Context

Need typography that matches brutalist editorial identity. High contrast, strong hierarchy, no generic web fonts. Must perform well, respect content-security-policy, and maintain visual cohesion across light/dark modes.

## Decision

### Font stack
Single family: **TT Interphases Pro** for both display and body. Served as local `.ttf` files from `/public/fonts/`. Preloaded in `index.html`.

No Google Fonts CDN — CSP `font-src` allows only `'self'` and `fonts.gstatic.com` (for fallback only). Zero network requests for fonts after initial load.

### Type scale
Fluid Minor Third progression anchored at 16px, clamped to viewport:

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Display | `clamp(2.5rem, 5vw + 0.5rem, 4.375rem)` | Bold (700) | Hero sections |
| H1 | `clamp(1.75rem, 3.5vw + 0.25rem, 3rem)` | Bold (700) | Page titles |
| H2 | `clamp(1.5rem, 2.8vw + 0.25rem, 2.5rem)` | Semi-bold (600) | Section headings |
| Body | `1rem` | Regular (400) | Paragraphs, max 75ch |
| Small | `0.813rem` | Regular (400) | Captions, footnotes |

**The Hierarchy Rule**: Each role ≥ 1.25× size ratio to predecessor. No flat scales.

### Color
OKLCH color space for perceptual uniformity. Four text tokens per theme:

| Token | Light | Dark |
|-------|-------|------|
| `--color-text` (primary) | oklch(0.15 0.005 300) | oklch(0.92 0.005 300) |
| `--color-muted` | oklch(0.56 0.008 300) | oklch(0.39 0.008 300) |

All text pairs exceed WCAG AA 4.5:1 contrast minimum.

## Tradeoffs

| Pro | Con |
|-----|-----|
| Local fonts = zero network requests, instant render | ~200 KB font files in initial bundle |
| Single family = cohesive rhythm, no FOUT | No fallback distinct from primary — same family for display/body |
| Fluid scale = responsive without breakpoints | Minor Third can feel compressed on very small screens |
| OKLCH = perceptually uniform, gamut-accurate | Older browser support gaps (Safari <15.4) |

## Consequences

1. Font files preloaded via `<link rel="preload">` in `index.html` — critical path
2. No `@font-face` loading from CDN — all local
3. Fluid clamp() values used everywhere — no hard px breakpoints for type
4. Max line length 75ch on body text — readable even on wide screens
5. Left column light theme, right column dark theme — text tokens swap accordingly
6. Heading hierarchy enforced via The Hierarchy Rule — no skipped levels
