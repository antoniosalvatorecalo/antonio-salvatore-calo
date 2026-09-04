# Engineering Rules

> Critical rules, styling conventions, and the z-index system.
> Owner: Engineering

---

## 6 Critical Rules — Violating These Breaks the App

1. **Hooks**: Never call `useTransform`/`useScroll`/`useSpring` conditionally — they must be top-level in the component body.
2. **GSAP**: Never use `!important` on CSS properties that GSAP animates (opacity, transform, etc.) — GSAP cannot override `!important`.
3. **Lenis**: Never create a global Lenis instance — `ScrollProvider` holds refs and responsive state; `PortfolioLayout` and `ProjectBrutalistLayout` wire Lenis locally via `lenis-manager`.
4. **Carousel**: Never use `motion.div` with `drag="x"` — pointer events + GSAP tweens only (the home gallery does not use drag today, but if reintroduced, follow the pointer + GSAP pattern).
5. **Router**: Never use `createBrowserRouter` — `BrowserRouter` + `AnimatePresence` only.
6. **Visibility**: Never hardcode `visibility:hidden` — let `AnimatePresence` handle transitions.

---

## Z-Index System

All z-index values are centralized as CSS custom properties in `:root` of `src/index.css`. Use the token classes (e.g. `z-nav`) instead of scattered inline `z-[50]` / `z-[60]` / `z-[100]` / etc.

**Stacking order (lowest → highest):**

| Token | Value | Layer |
|-------|-------|-------|
| `--z-dropdown` | 20 | `ContactBuilder` dropdown |
| `--z-mobile-bottom-nav` | 50 | Reserved (no current component) |
| `--z-project-shell` | 60 | `ProjectBrutalistLayout` (page) |
| `--z-nav-floating` | 70 | Floating controls |
| `--z-view-switcher` | 90 | Reserved (no current component) |
| `--z-nav` | 100 | `SiteHeader` |
| `--z-preloader` | 900 | Reserved (no preloader currently) |
| `--z-skip-link` | 999 | Skip-to-content link (WCAG 2.4.1) |

**Invariants enforced:**
- `nav (100)` > `project shell (60)` — navigation always on top of project pages.
- `skip link (999)` > all other layers — must be visible when focused for keyboard users.

**CSS utility classes** (use in `className`):
- `z-dropdown`, `z-mobile-bottom-nav`, `z-project-shell`, `z-nav-floating`
- `z-view-switcher`, `z-nav`, `z-preloader`, `z-skip-link`

Do NOT add new raw z-index values. If a new overlay layer is needed, add a token to `:root` and use the corresponding class.

---

## Known Technical Debt

| Issue | Location | Priority |
|-------|----------|---------|
| Bundle ~606KB (target <700KB, watch for growth) | All chunks | MEDIUM |
| Three.js integration | Roadmap | LOW |
