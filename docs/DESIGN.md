# Design System — Antonio Salvatore Calò Portfolio

> Reverse-engineered from the active implementation. `src/` is the source of truth; this document does not define a redesign.

## 1. Visual direction

Editorial, typography-led portfolio with a restrained monochrome palette, media-first project presentation, square geometry, dense utility labels, and cinematic transitions. The implementation uses a white primary surface and dark inverse surfaces; no separate CSS dark-theme selector is currently defined.

## 2. Foundations

### Color tokens

| Token                  | Value                   | Use                       |
| ---------------------- | ----------------------- | ------------------------- |
| `--bg-primary`         | `#FFFFFF`               | page surface              |
| `--bg-secondary`       | `#F0F0F0`               | secondary/active surfaces |
| `--bg-tertiary`        | `#E8E8E8`               | tertiary surface          |
| `--bg-inverse`         | `#141414`               | inverse/dark surface      |
| `--bg-inverse-subtle`  | `#1F1F1F`               | subtle inverse surface    |
| `--text-primary`       | `#0A0A0A`               | primary text              |
| `--text-secondary`     | `#3D3D3D`               | secondary text            |
| `--text-muted`         | `#6B6B6B`               | labels/muted text         |
| `--text-inverse`       | `#F5F5F5`               | text on inverse surfaces  |
| `--text-inverse-muted` | `#A0A0A0`               | muted inverse text        |
| `--cta-color`          | `#0A0A0A`               | CTA links                 |
| `--border-subtle`      | `#E2E2E2`               | separators                |
| `--border-default`     | `#C8C8C8`               | default borders           |
| `--border-strong`      | `#0A0A0A`               | active/focus borders      |
| `--border-inverse`     | `rgba(245,245,245,0.1)` | inverse separators        |

Additional implemented values: `.plain-overlay` uses `rgba(0,0,0,0.6)`; glass-nav defaults are transparent; focus outlines use `rgba(10,10,10,0.55)`.

### Typography

- Primary family: `TT Interphases Pro`, local WOFF2 files, weights `300`, `400`, `500`, `600`, `700`, `900`; fallback `ui-sans-serif, system-ui, sans-serif` in the Tailwind theme and `sans-serif` on `body`.
- Fluid display scale: `--text-display-xl` `clamp(3rem, 6vw + .5rem, 5rem)`, `--text-display` `clamp(2.063rem, 4vw + .5rem, 3.625rem)`, `--text-h1` `clamp(1.75rem, 3.5vw + .25rem, 3rem)`, `--text-h2` `clamp(1.5rem, 2.8vw + .25rem, 2.5rem)`, `--text-h3` `clamp(1.25rem, 2.2vw + .2rem, 2.063rem)`, `--text-h4` `clamp(1.125rem, 1.8vw + .125rem, 1.75rem)`, `--text-h5` `clamp(1rem, 1.5vw + .1rem, 1.438rem)`, `--text-h6` `clamp(.875rem, 1.2vw + .1rem, 1.188rem)`.
- Fixed text: base `1rem`, small `.813rem`, extra-small `.688rem`.
- UI labels: `.7rem`, weight `500`, tracking `.12em`, line-height `1.2`, muted color.
- UI body/value text: `.8125rem`, line-height `1.4`, primary color.

### Spacing, shape, layering

- Base spacing: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128px` (`--space-1` through `--space-32`).
- Fluid sections: `--section-xs` `clamp(2rem,4vw,3rem)`, `--section-sm` `clamp(3rem,6vw,4rem)`, `--section-md` `clamp(4rem,8vw,6rem)`, `--section-lg` `clamp(6rem,10vw,8rem)`.
- Page padding: top `clamp(1.5rem,3vw,2.5rem)`, lateral `clamp(1.25rem,3.5vw,3rem)`.
- Radii: default square (`0px`), small `2px`, medium `4px`, pill `9999px`; circular controls use `50%` where explicitly implemented.
- Z-index: dropdown `20`, project shell `60`, navigation `100`, skip link `999`.

## 3. Responsive behavior

- `<768px`: single-column layout, mobile/tab navigation, swipe-oriented interaction; display-xl is reduced to `clamp(1.75rem,7vw + .5rem,2.5rem)`; page/body overflow remains hidden.
- `768–1023px`: tablet retains the single-column behavior; header and project controls use intermediate spacing.
- `>=1024px`: desktop layout enables the dual-column/navigation arrangements and project presentation rules.
- `>=1280px`: header height and content gap increase again.
- Header heights: `96px` mobile, `110px` at `768px`, `130px` at `1024px`, `140px` at `1280px`.
- Other active media queries include project-grid adjustments at `<768px`, `480–1023px`, and `768–1023px`, plus hover-capability and reduced-motion queries.

## 4. Layout and components

### Global shell and navigation

`PortfolioLayout`, `SiteHeader`, and `AppRouter` provide the persistent shell. The header has informational, project, navigation, language, CTA, contact, and mobile variants. It uses transparent backgrounds, text/border state changes, minimum 44px interactive chips, visible focus outlines, and transition-phase attributes (`idle`, `opening`, `closing`, `project`).

### Home / project index

`ProjectIndex`, `ProjectGrid`, `FilterBar`, and `PortfolioScene` compose the archive. The gallery is media-dominant and supports Sanity images and Vimeo video embeds. The scene uses nested planes and CSS variables `--scene-angle` and `--scene-depth`; the index and project views are mutually inert during transitions.

### Project detail

`SingleProjectView`, `ProjectPreviewCarousel`, `ProjectPreview`, `ProjectDetailsGrid`, `ProjectAbout`, and `PreviewMediaAsset` provide project title, media, details, about content, carousel/lightbox states, and Vimeo playback. Media keeps poster fallbacks and explicit video handling.

### Contact

`ContactPage`, `ContactFormExperience`, and `AnimatedContactPanel` implement a progressive, sentence-style contact interaction with step counter, dropdown options, keyboard/focus states, disabled controls, cursor blink, CTA underline, and arrow motion. On mobile the page reserves space using the measured header height.

### Interaction rules

- Links and buttons use underline, opacity, color, arrow rotation, or small translation rather than shadows or large decorative effects.
- `.glass-chip` has `44px` minimum dimensions, `2px` radius, opacity hover, and `scale(1.03)` hover motion.
- Service descriptions reveal on hover-capable devices and via `.is-active` on touch devices.
- Focus-visible states generally use a `2px` outline with a `2px` offset.

## 5. Motion system

- GSAP registers `ScrollTrigger` once and refreshes after layout stabilization and window load.
- Project navigation rotates one scene angle from `0deg` (home) to `-90deg` (project), using `power2.inOut`; default duration is `1.8s` for a 90-degree move and scales with remaining angle.
- Motion is supplied by GSAP, `motion/react`, CSS transitions/keyframes, and the `MotionPreferenceProvider`.
- CSS motion includes `breathe` (`4000ms` default), ambient rotation (`20s`), scroll pulse (`1.4s`), contact cursor blink (`1s`), reveal transforms, underline opacity, arrow rotation, and hover translations.
- `prefers-reduced-motion` and `html[data-motion="reduced"]` collapse transitions/animations to `0.01ms`, disable smooth scrolling, and make project transitions instantaneous.
- `Lenis` is not referenced in the active `src/` implementation.

## 6. Data and media integration

Sanity supplies projects, site settings, branding, SEO, images, and Vimeo media. Image URLs are normalized through `src/cms`; Vimeo embeds use autoplay, loop, muted, controls disabled, and `playsinline` parameters. CMS-provided `themeColor` is applied to the document metadata, but it does not create a CSS theme.

## 7. Do / don't

### Do

- Reuse the existing CSS variables and exact responsive ranges.
- Preserve the header geometry and project scene angle model.
- Keep media primary and controls editorial/minimal.
- Preserve visible keyboard focus and reduced-motion behavior.
- Treat current inconsistencies as implementation facts until intentionally changed.

### Don't

- Add unverified colors, fonts, shadows, gradients, or radii.
- Assume a dark-mode CSS theme exists; only inverse tokens and media-specific dark surfaces are defined.
- Replace the single-column tablet behavior with desktop behavior.
- Remove Vimeo poster fallbacks or transition input locking.
- Add Lenis behavior without an active implementation reference.

## 8. Audit notes

- `src/index.css` contains duplicated/repeated compatibility rules and comments referring to historical fixes; this document records active behavior rather than treating comments as API.
- Some comments describe “glass” navigation, but its active tokens are transparent and shadowless.
- The source contains an empty tablet media block and an empty reduced-motion media block alongside active global reduced-motion rules.
- No standalone `tailwind.config` file was found; Tailwind v4 tokens are declared through `@theme` and CSS variables.
- No active Lenis import/reference was found.

## 9. Audited sources

`src/index.css`, `src/styles/hover.css`, all component/page CSS files, `src/components/`, `src/pages/`, `src/layouts/`, `src/providers/`, `src/hooks/`, `src/motion/`, `src/lib/`, `src/cms/`, `src/main.tsx`, `package.json`, and `vite.config.ts`.
