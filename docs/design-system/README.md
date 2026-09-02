# Design System: Antonio Salvatore Calò — Portfolio

> Complete design system reference.
> Brutalismo Ordinato — rigorously ordered brutalist aesthetic.
> Owner: Design + Engineering

---

## Contents

| File | Covers |
|------|--------|
| [Overview (this)](#overview) | North star, key characteristics, design principles |
| [Typography](typography.md) | Type scale, font roles, weights, fluid clamp(), left-column scaling |
| [Colors](colors.md) | Token reference, light/dark themes, WCAG contrast, glass tokens |
| [Spacing & Layout](spacing-layout.md) | Spacing scale, section padding, column system, grid patterns |
| [Z-Index](z-index.md) | Stacking order, invariants, layer chart |
| [Motion](motion.md) | Animation principles, GSAP / Motion split, reduced motion, easing |
| [Components](components.md) | Component behaviors, states, interaction patterns, anatomy |
| [Tokens](tokens.md) | Complete CSS custom properties reference |

---

## Overview

### Creative North Star

**"The Uncompromising Chronicle."**

A portfolio that fuses brutalist typographic authority with product-level interaction precision. Every element earns its place — nothing decorative, nothing accidental. The experience communicates: *this is made by someone who cares about the details that matter.*

### Key Characteristics

| Trait | Implementation |
|-------|---------------|
| Square-by-default geometry | `radius-none` (0px) or `radius-sm` (2px) only |
| High-contrast monochrome | Light ↔ Dark via OKLCH tokens, all WCAG AA 4.5:1+ |
| Purposeful motion | Scroll-driven reveals, magnetic hovers, never decorative |
| Dual-column heartbeat | 20%/80% split on desktop, independent Lenis scroll |
| Flat elevation | No shadows. Depth via spacing, contrast, motion. |

### Design Principles

1. **Every pixel earns its place.** No decorative gradients, glassmorphism, pastels, or soft-UI.
2. **Contrast is communication.** Text hierarchy defined by weight + size ratios, not color alone.
3. **Motion has a job.** Animate to reveal, connect, or respond — never for spectacle.
4. **Grids are visible.** Consistent structure beneath all layouts. Asymmetry is deliberate, not accidental.
5. **Accessibility is structural.** WCAG AA minimum. Semantic HTML before ARIA. Keyboard everything.
6. **One typeface, infinite range.** TT Interphases Pro covers display → body. Hierarchy via weight + scale.
7. **Responsive is not optional.** Three tiers (mobile/tablet/desktop). Each gets the right UX, not a crammed version.

---

## Quick Reference

### Core Tokens (CSS custom properties in `src/index.css`)

| Category | File location |
|----------|---------------|
| Colors | `:root` blocks (light) + `[data-theme="dark"]` overrides |
| Spacing | `--space-{1,2,3,4,6,8,12,16,24,32}` |
| Section padding | `--section-{xs,sm,md,lg}` — fluid `clamp()` |
| Type scale | `--text-{display-xl,display,h1,h2,h3,h4,h5,h6,base,sm,xs}` |
| Radius | `--radius-{none,sm,md,pill}` |
| Z-index | `--z-{dropdown,mobile-bottom-nav,project-shell,nav-floating,view-switcher,nav,preloader,skip-link}` |

### Breakpoint System

| Tier | Width | Layout | Scroll | Nav |
|------|-------|--------|--------|-----|
| Mobile | <768px | Single column | Native | MobileBottomNav |
| Tablet | 768-1024px | Single column | Native | MobileBottomNav |
| Desktop | >=1024px | Dual column (20/80) | Lenis per column | CentralNavMenu |

### Tech Stack

- **Font**: TT Interphases Pro (local WOFF2, 6 weights)
- **Animation**: GSAP 3 (ScrollTrigger, timelines) + Motion 12 (springs, AnimatePresence)
- **Scroll**: Lenis (desktop only, per-column instances)
- **Theme**: CSS custom properties + `data-theme` attribute + localStorage
- **Framework**: React 19 + Vite + Tailwind v4

---

## Cross-References

| Where | What |
|-------|------|
| [`src/index.css`](../../src/index.css) | All design tokens, global styles, glass nav |
| `src/components/ui/*.css` | Component-specific styles |
| [`docs/design/README.md`](../design/README.md) | Design README (superseded by this doc) |
| [`docs/adr/007-typography-system.md`](../adr/007-typography-system.md) | Typography ADR |
| [`docs/systems/theme.md`](../systems/theme.md) | Theme management system |
| [`docs/systems/responsive.md`](../systems/responsive.md) | Responsive system |
| [`docs/systems/animations.md`](../systems/animations.md) | Animation system |
| [`docs/engineering/rules.md`](../engineering/rules.md) | Engineering rules (z-index, visibility, GSAP) |

---

## Dos and Don'ts

### Do
- Use only defined token values — never ad-hoc hex or spacing
- Maintain square or minimally rounded geometry (`radius-none` or `radius-sm`)
- Preserve WCAG AA contrast across both themes
- Respect reduced motion (`prefers-reduced-motion` + `data-motion="reduced"`)
- Use semantic HTML before ARIA
- Test with keyboard-only navigation
- Keep line length 65-75ch for body text
- Use `gsap.context()` for scoped animations

### Don't
- Round corners >2px (no `rounded-lg`, no pill shapes)
- Use gradients, shadows, glassmorphism, pastels, or soft-UI
- Create chaotic or asymmetrical grids without purpose
- Apply `!important` on properties GSAP animates (opacity, transform)
- Hardcode `visibility: hidden` — use `AnimatePresence`
- Nest cards inside cards inside cards
- Use generic SaaS dashboard patterns or templates
- Place gradient text or excessive visual noise
- Add colored side-stripe borders >1px
