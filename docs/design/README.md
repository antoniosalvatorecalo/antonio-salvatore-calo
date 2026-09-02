# Design System: Antonio Salvatore Calò — Portfolio

> Comprehensive design system documentation — color, typography, components, and guidelines.
> Owner: Design

---

## 1. Overview

**Creative North Star: "The Uncompromising Chronicle"**

The portfolio embraces a **Brutalismo Ordinato** — a rigorously ordered brutalist aesthetic that leverages stark grids, square edges, and an unapologetically bold typographic voice. It fuses a personal brand's *eversivo, massimalista, essenziale* spirit with product-level interaction precision. The dual-column scroll-driven navigation is the structural heartbeat, offering daring motion while always grounding the user with clear visual anchors.

**Key Characteristics:**
- Square-by-default geometry (radius-none, radius-sm) with occasional subtle curvature only where function demands.
- High-contrast monochrome palette that flips between Light and Dark modes, preserving visual identity across themes.
- Micro-interactions (magnetic button, hover overlays) are meticulous; every "crude" visual element is backed by silky code.

---

## 2. Colors

The palette is a disciplined set of neutrals and inverse tones that support both Light and Dark contexts. No decorative gradients or pastel foams appear.

### Primary
- **Pure White** (#FFFFFF) — background for Light mode surfaces.

### Secondary
- **Soft Gray** (#F0F0F0) — subtle surface distinction.
- **Medium Gray** (#E8E8E8) — tertiary background layer.

### Inverse (Dark Mode)
- **Deep Black** (#141414) — primary dark background.
- **Slightly Lighter Black** (#1F1F1F) — secondary dark surface.

### Text
- **On-Light Primary** (#0A0A0A) — main body copy.
- **On-Light Secondary** (#3D3D3D) — secondary information.
- **Muted** (#6B6B6B) — low-priority text.
- **On-Dark Primary** (#F5F5F5) — main copy in Dark mode.
- **On-Dark Muted** (#A0A0A0) — secondary copy in Dark mode.

### Borders
- **Subtle** (#E2E2E2) — light-weight dividers.
- **Default** (#C8C8C8) — standard border.
- **Strong** (#0A0A0A) — high-contrast edge.
- **Inverse** (rgba(245, 245, 245, 0.1)) — faint dark-mode outline.

---

## 3. Typography

**Display Font:** "TT Interphases Pro" — used for headings and hero text, delivering a high-impact, editorial feel.
**Body Font:** "TT Interphases Pro" — same family for cohesive typographic rhythm.

The type scale follows a fluid **Minor Third** progression anchored at 16 px, clamped to viewport width. Key roles:
- **Display** — `clamp(2.5rem, 5vw + 0.5rem, 4.375rem)` — Hero sections.
- **H1** — `clamp(1.75rem, 3.5vw + 0.25rem, 3rem)` — Primary page titles.
- **H2** — `clamp(1.5rem, 2.8vw + 0.25rem, 2.5rem)` — Section headings.
- **Body** — `1rem` — standard paragraph text, max line length 65-75 ch.
- **Small** — `0.813rem` — captions, footnotes.

**Named Rules:**
- **The Hierarchy Rule.** Every typographic role maintains a ≥1.25 × size ratio to its predecessor; no flat scales.

---

## 4. Elevation

The system is **flat by default** — no shadows are used on surfaces. Depth is conveyed through spacing, color contrast (inverse vs light), and motion (scroll-driven transforms). Any elevation would be introduced only as a purposeful response to interaction, never as decorative backdrop.

---

## 5. Components

### Buttons
- **Shape:** `rounded-sm` (2 px radius) — square-by-default with subtle rounding.
- **Primary:** Transparent background, `text-inverse` text, `0.5rem 1rem` padding. On hover/active a soft `rgba(255,255,255,0.15)` overlay appears.

### Links
- **Shape:** `rounded-none` — no radius, inline underline on hover.
- **Style:** `text-primary` text color, no background, seamless integration with surrounding typography.

### Cards (ProjectCard)
- **Background:** `bg-primary` with a faint `rounded-[4px]` (`rounded-sm`) radius.
- **Text:** `text-primary` for titles, `text-secondary` for secondary info.
- **Padding:** Fluid section spacing (`var(--section-sm)`).
- **Interaction:** Hover overlay uses `bg-black/70` with a subtle backdrop-blur.

---

## 6. Do's and Don'ts

### Do:
- **Do** use only the defined color tokens; never introduce ad-hoc hex values.
- **Do** maintain square or minimally rounded geometry; radius-none or radius-sm only.
- **Do** preserve the high-contrast WCAG AA ratios across both Light and Dark modes.
- **Do** respect the motion-energy rule: animations are purposeful, non-bouncy, and respect the user-controlled intensity toggle.

### Don't:
- **Don't** employ soft-UI aesthetics — no rounded-large corners, pastel gradients, or glassmorphism.
- **Don't** create chaotic layouts; grids must be visible and consistent.
- **Don't** use generic SaaS dashboard patterns or pre-made templates.
- **Don't** add side-stripe borders greater than 1 px as colored accents.
- **Don't** place gradient text or excessive visual noise.

---

## Cross-References

- Product principles inform design decisions → [`docs/product/`](../product/)
- Design tokens are implemented in CSS → see [`src/index.css`](../../src/index.css)
- Engineering rules govern component implementation → [`docs/engineering/rules.md`](../engineering/rules.md)
- QA validates visual consistency → [`docs/qa/`](../qa/)
