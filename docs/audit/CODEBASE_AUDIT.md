# Codebase Audit — Antonio Salvatore Calò — Portfolio

**Date**: 03 June 2026
**Auditor**: AccessibilityAuditor / Engineering Review
**Scope**: Full codebase audit — architecture, quality, performance, accessibility, maintainability
**Build Status**: ✅ `tsc --noEmit` passes. ✅ `npm run build` passes.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture & Strengths](#architecture--strengths)
3. [Technical Debt](#technical-debt)
4. [Dead Code](#dead-code)
5. [Performance Risks](#performance-risks)
6. [Accessibility Issues](#accessibility-issues)
7. [Documentation Gaps](#documentation-gaps)
8. [Maintainability Risks](#maintainability-risks)
9. [Dependency Analysis](#dependency-analysis)
10. [Recommended Roadmap](#recommended-roadmap)

---

## Executive Summary

**Overall health**: GOOD with moderate debt. Architecture is well-structured — dual-column layout, per-column Lenis, centralized GSAP, strong separation of concerns. TypeScript strict mode enforces quality.

**Critical issues**: 0
**Serious issues**: 3 (empty engine file, duplicate data sources, dead component)
**Moderate issues**: 8
**Low issues**: 12+

### Verdict by Layer

| Layer | Health | Notes |
|-------|--------|-------|
| Architecture | ✅ Strong | Dual-column, per-column Lenis, clean provider chain |
| TypeScript | ✅ Passes | Strict mode, no errors |
| Motion/Animation | ✅ Good | Centralized GSAP, isolated contexts, reduced-motion support |
| Routing | ✅ Good | BrowserRouter + AnimatePresence, lazy routes |
| Accessibility | ⚠️ Moderate | Skip-link on projects only, focus management untested |
| Performance | ⚠️ Moderate | No bundle analysis, GSAP in main chunk, large CSS |
| Documentation | ⚠️ Moderate | Good structure but some inaccuracies |
| Testing | ❌ Missing | No unit tests. Playwright E2E configured but coverage unknown |
| Dead Code | ⚠️ Present | 5+ dead/placeholder files |
| Duplication | ⚠️ Present | Two project data registries with overlap |

---

## Architecture & Strengths

### What's done right

| Pattern | Location | Why it matters |
|---------|----------|---------------|
| Per-column Lenis instances | `useSmoothScroll` hook | No global scroll conflict. Each column scrolls independently |
| Centralized GSAP registration | `lib/gsap-setup.ts` | Single `registerPlugin(ScrollTrigger)` — no duplicate registration errors |
| Lenis singleton manager | `lib/lenis-manager.ts` | Module-level `Map<wrapper, instance>` — StrictMode-safe, init-once guarantee |
| Animation orchestrator | `animations/orchestrator.ts` | Synchronous state machine for section cascade — no race conditions |
| Reduced motion provider | `MotionPreferenceProvider.tsx` | `MotionConfig` + `data-motion` attribute — respected everywhere |
| CSS design tokens | `index.css` | `:root` variables for colors, spacing, z-index, typography — single source of truth |
| Security headers | `vercel.json` | CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy |
| Loading gate | `index.css` / `main.tsx` | `html.loading` → `html.ready` — prevents flash of unstyled content |
| Error boundary | `components/ErrorBoundary.tsx` | Class-based React error boundary with styled fallback |
| Skip-to-content link | `ProjectBrutalistLayout.tsx` | WCAG 2.4.1 — keyboard-accessible skip link (present on project pages) |
| React strict mode + lazy routes | `AppRouter.tsx`, `App.tsx` | Double-invoke safe. Suspense boundaries on all route components |
| Agnostic path aliases | `tsconfig.json` | `@/` maps to `./src/` — clean imports |
| Vite manual chunks | `vite.config.ts` | Separate vendor chunks for react, router, motion, GSAP, Lenis |
| Swipe navigation | `useSwipeNavigation.ts` | Axis-locked, threshold-based swipe — works without hammer.js |

### Render layer architecture

```
main.tsx
├── MotionPreferenceProvider  (reduced-motion context)
│   └── ScrollProvider         (scroll refs, tab state, responsive)
│       └── BrowserRouter
│           └── AnimatedRoutes (AnimatePresence + motion.div per route)
│               └── App
│                   ├── Preloader (3.2s min duration, asset readiness)
│                   └── PortfolioLayout
│                       ├── AnimationProvider (ScrollTrigger cascade)
│                       ├── CentralNavMenu
│                       ├── Left Column (About sections, Lenis A)
│                       └── Right Column (Project cards, Lenis B)
```

---

## Technical Debt

### 🔴 HIGH: Empty engine file

**File**: `src/motion/engine/index.ts` (0 bytes)
**Impact**: Dead module barrel. Consumers may expect this to export `cascadeEngine` — README references it.
**Fix**: Either implement `cascadeEngine` or remove the file + update README.

### 🔴 HIGH: Duplicate project data registries

**Files**: `src/content/projects.ts` and `src/content/projectWorkData.ts`
**Impact**: Two `ProjectData[]` registries (`projectsRegistry` vs `projectWorkData`). `projectsRegistry` only stores thumbnail paths; `projectWorkData` stores full image arrays. PortfolioLayout uses `projectsRegistry`; WorkPage uses `projectWorkData`. Inconsistency risk when adding projects.
**Fix**: Consolidate into single source of truth. `projectsRegistry` should be the canonical export.

### 🔴 HIGH: Dead SidebarMenu component

**File**: `src/components/ui/SidebarMenu.tsx` (35 lines)
**Impact**: Renders a fixed left-side vertical nav with hardcoded links (Home, Bugonia, Newsquest). Superseded by `CentralNavMenu`. Not imported anywhere (checked via grep).
**Fix**: Remove file + CSS.

### 🟡 MODERATE: Large commented-out code block

**File**: `src/layouts/PortfolioLayout.tsx` (lines ~47-97)
**Impact**: The `animateColumns` function (~50 lines) is commented out to avoid TS unused-var errors. Leftover from column hover-resizing feature that was disabled.
**Fix**: Either uncomment and make functional, or delete permanently.

### 🟡 MODERATE: Placeholder files with empty exports

**Files**:
- `src/content/navigation/menu.ts` — `menuItems: MenuItem[] = []`
- `src/content/about/services.ts` — `services: Service[] = []`

**Impact**: Dead imports if any component pulls from these. Incomplete data layer.
**Fix**: Populate with real data or remove. If unused, check for stale imports.

### 🟡 MODERATE: `lodash` dependency with no real usage

**Evidence**: `package.json` has `"lodash": "^4.18.1"`. `src/types/lodash.d.ts` has `declare module 'lodash';`. No `import from 'lodash'` found anywhere in source.
**Impact**: ~24KB in bundle (even tree-shaken). Unnecessary dependency.
**Fix**: Remove `lodash` from `package.json` and remove type declaration.

### 🟡 MODERATE: `AnimatedLink.tsx` usage unknown

**File**: `src/components/ui/AnimatedLink.tsx`
**Impact**: May be unused. Should verify import references. If dead, remove.
**Fix**: Grep for `AnimatedLink` imports and remove if unreferenced.

### 🟡 MODERATE: Editorial.tsx page may be unused

**File**: `src/pages/work/Editorial.tsx`, `Editorial.css`
**Impact**: Not referenced in AppRouter. Dead code consuming maintenance surface.
**Fix**: Confirm purpose. Either wire into route or remove.

### 🟢 LOW: `_build_agency_skills.ps1` in project root

**File**: `_build_agency_skills.ps1`
**Impact**: Build script in wrong location. Should be in `scripts/` directory.
**Fix**: Move to `scripts/` directory.

### 🟢 LOW: `vite.config.ts` references `framer-motion` chunk

**File**: `vite.config.ts`, line 29: `id.includes('/node_modules/framer-motion/')`
**Impact**: Project uses `motion` (the successor), not `framer-motion`. This chunk rule never matches.
**Fix**: Change to `id.includes('/node_modules/motion/')`.

### 🟢 LOW: `split-type` in README but not in imports

**Evidence**: README references SplitType segmentation pipeline. `package.json` includes `"split-type": "^0.3.4"`. No `import from 'split-type'` found in source.
**Impact**: README describes architecture that doesn't exist (SplitType pipeline). Misleading documentation.
**Fix**: Either implement SplitType integration or remove from README and dependency.

---

## Dead Code

| File | Size | Status | Notes |
|------|------|--------|-------|
| `src/motion/engine/index.ts` | 0 B | **DEAD** | Empty file |
| `src/content/navigation/menu.ts` | 147 B | **PLACEHOLDER** | Empty array, no real content |
| `src/content/about/services.ts` | 164 B | **PLACEHOLDER** | Empty array, no real content |
| `src/components/ui/SidebarMenu.tsx` | 1.1 KB | **DEAD** | Superseded by CentralNavMenu |
| `src/components/ui/AnimatedLink.tsx` | 564 B | **SUSPECTED DEAD** | Check imports |
| `src/pages/work/Editorial.tsx` | 4.9 KB | **SUSPECTED DEAD** | Not in router |

**Total dead/placeholder code**: ~7 KB (small but creates maintenance surface).

---

## Performance Risks

### 🟡 MODERATE: GSAP (114 KB) potentially loaded unnecessarily

**File**: `src/hooks/animation/useSmoothScroll.ts` — calls `initGSAP()` at module level.
**Impact**: GSAP is loaded whenever `useSmoothScroll` is imported, even on pages that don't need it (contact page). Comment in code says this was intentional: "Moved here so GSAP is only loaded by lazy pages that actually use smooth scroll." But `PortfolioLayout` and `ProjectBrutalistLayout` both import it eagerly.
**Fix**: Verify GSAP is truly lazy-loaded from non-animated pages. Consider dynamic `import()` wrapper.

### 🟡 MODERATE: No bundle analysis tool

**Issue**: No `vite-plugin-inspect` or `rollup-plugin-visualizer` configured.
**Impact**: Impossible to verify bundle composition without manual audit.
**Fix**: Add bundle analysis tool to dev dependencies.

### 🟡 MODERATE: Single monolithic CSS file

**File**: `src/index.css` at 867 lines, 35KB
**Impact**: All global styles in one file. No CSS modules or component-scoped styles. Risk of specificity conflicts.
**Fix**: Consider extracting section-specific CSS into component files (already partially done with per-component CSS files, but `index.css` accumulates globals).

### 🟢 LOW: Hardcoded asset paths in Preloader

**File**: `src/components/effects/loaders/Preloader.tsx`, lines 19-20
**Issue**: `CRITICAL_ASSETS` array hardcodes image paths. Adding new projects requires manual updates.
**Fix**: Derive critical assets from project registry automatically.

### 🟢 LOW: Safely ignorable `lodash` bundle waste

**Issue**: `lodash` installed but unused. Adds ~24KB to `node_modules` even if tree-shaken.
**Fix**: Remove dependency.

---

## Accessibility Issues

### 🟡 MODERATE: Skip-to-content link only on project pages

**WCAG**: 2.4.1 — Bypass Blocks (Level A)
**Files**: Present in `ProjectBrutalistLayout.tsx`. Absent from `PortfolioLayout.tsx` (home page) and `ContactPage.tsx`.
**Impact**: Keyboard users navigating from home page must tab through all navigation and hero content before reaching main content.
**Fix**: Add skip-to-content link to `PortfolioLayout.tsx` and `ContactPage.tsx`.

### 🟡 MODERATE: Navigation uses `aria-pressed` instead of `aria-current`

**WCAG**: 4.1.2 — Name, Role, Value
**Files**: `CentralNavMenu.tsx`, `NavTab` component
**Issue**: `aria-pressed` is for toggle buttons. Navigation tabs should use `aria-current="page"`.
**Fix**: Replace `aria-pressed={isActive}` with `aria-current={isActive ? 'page' : undefined}`.

### 🟡 MODERATE: No `role="main"` or landmark regions

**WCAG**: 1.3.1 — Info and Relationships (Level A)
**Impact**: Screen reader users navigating by landmark (`Rotor` in VoiceOver, `M` in NVDA) find no regions.
**Fix**: Add `<main>` tag wrapping page-specific content in each layout. Add `role="banner"` / `<header>` for navigation.

### 🟡 MODERATE: Focus management on route transitions untested

**WCAG**: 2.4.3 — Focus Order (Level A)
**Issue**: `AnimatePresence mode="wait"` handles exit/enter animations but no explicit focus management. After page transition, focus may land on unexpected elements or reset to document body.
**Fix**: Add `useEffect` in route components to focus the `<main>` or heading element after transition completes. Or use `useFocusOnMount` pattern.

### 🟢 LOW: Image alt text consistency

**Files**: `ProjectCard.tsx` uses `alt="${client} image ${i}"` — slightly informative but could be more descriptive. `FeaturedCard` uses `alt="${project.title} — image ${i + 1}"`.
**Issue**: No differentiation between informational images (need descriptive alt) and decorative (needs `alt=""`).
**Fix**: Audit images and assign meaningful alt text vs. `alt=""` based on context.

### 🟢 LOW: Color contrast tokens documented but not verified

**Issue**: `index.css` has contrast ratio annotations (e.g., `/* 5.74:1 on bg-primary */`). These are claims, not verified measurements.
**Fix**: Run automated contrast checker (`axe-core` or `puppeteer` + `contrast` library) to validate all token combinations in both themes.

### 🟢 LOW: Touch target sizes on mobile nav

**WCAG**: 2.5.8 — Target Size (Minimum, Level AA) — newer WCAG 2.2 criterion
**Issue**: MobileBottomNav buttons are sized by content. Should verify minimum 24×24px (Level AA).
**Fix**: Ensure `.mobile-nav-btn` has explicit `min-height: 44px` and `min-width: 44px`.

---

## Documentation Gaps

### 🟡 MODERATE: README architecture description is inaccurate

**Issue**: README references SplitType segmentation pipeline, `motion/engine/cascadeEngine`, `motion/utils/scrollCascade` — none of these exist in the codebase.
**Impact**: Misleading for new developers onboarding via README.
**Fix**: Audit README against actual codebase. Remove or correct inaccurate sections.

### 🟡 MODERATE: No hooks API documentation

**Issue**: Custom hooks (`useSmoothScroll`, `useEntranceReveal`, `useSwipeNavigation`, `useTheme`, `useProjectTextScroll`) have no documentation beyond inline comments.
**Impact**: Developers must read source to understand parameters and behavior.
**Fix**: Add JSDoc-style `@param` and `@returns` documentation to each hook. Consider auto-generating from TypeScript.

### 🟢 LOW: No component documentation / Storybook

**Issue**: 47 UI components, 6 effect groups, 9 page/view components — none have visual documentation.
**Impact**: Design changes require code reading to understand component capabilities.
**Fix**: Add Storybook or at minimum a component index in `docs/design/components.md`.

### 🟢 LOW: No changelog

**Issue**: No `CHANGELOG.md`. Git log is the only history.
**Impact**: Stakeholders can't easily see what changed between releases.
**Fix**: Add conventional-changelog or manual `CHANGELOG.md`.

### 🟢 LOW: `docs/engineering/` and `docs/design-system/` not fully explored

**Issue**: Audit scope didn't deep-read all doc files. May have additional inaccuracies.
**Recommendation**: Run docs-codebase consistency check as separate task.

---

## Maintainability Risks

### 🔴 HIGH: Large component files

| File | Lines | Issue |
|------|-------|-------|
| `ProjectBrutalistLayout.tsx` | 693+ | Exports 10+ components + 1 main layout. Hard to test, hard to reason about |
| `ContactBuilder.tsx` | ~18KB | Complex component with significant UI logic |
| `PortfolioLayout.tsx` | 395 | Contains inline GSAP animation logic + multiple sections |
| `letter-swap.tsx` | 10KB | Complex text animation component |

**Fix**: Split `ProjectBrutalistLayout.tsx` — move UI primitives (`SectionLabel`, `HeroText`, `MediaBlock`, `LayoutFullMedia`, etc.) to separate component files.

### 🟡 MODERATE: GSAP animation logic in component files

**Issue**: `PortfolioLayout.tsx` contains `useEffect` with direct GSAP animation for project cards. `AboutHero.tsx` has its own GSAP timeline. Animation logic is scattered across components instead of centralized.
**Fix**: Extract reusable animation hooks or move to `animations/` directory. Components should declare intent via data attributes; animations should be orchestrated centrally.

### 🟡 MODERATE: No unit test coverage

**Issue**: Zero unit tests for hooks, utilities, or components. Only E2E tests via Playwright.
**Impact**: Logic errors in hooks (`useEntranceReveal`, `orchestrator.ts`) can only be caught via E2E or manual testing.
**Fix**: Add Vitest + React Testing Library. Focus on:
- `orchestrator.ts` — state machine logic
- `useEntranceReveal` — ScrollTrigger creation
- `useSwipeNavigation` — swipe axis detection
- `cn()` utility

### 🟢 LOW: Barrel exports inconsistent

**Issue**: Some directories have `index.ts` barrel exports (effects, hooks, motion), others don't (components/ui/ has no barrel).
**Impact**: Import paths are inconsistent: `import { X } from '@/components/ui/SomeComponent'` vs `import { Y } from '@/components/effects'`.
**Fix**: Add barrel exports for `components/ui/` and `layouts/`.

### 🟢 LOW: `isTablet` unused in project pages

**Files**: `Bugonia/ProjectPage.tsx`, `Newsquest/ProjectPage.tsx` — destructure `isTablet` as `_isTablet` (prefixed with underscore to suppress TS warning).
**Impact**: Clue that responsive logic at the page level may not be fully utilized.
**Fix**: Either use `isTablet` for responsive layout decisions or remove from destructuring.

---

## Dependency Analysis

### Dependencies (production)

| Package | Version | Size (approx) | Status |
|---------|---------|---------------|--------|
| `react` | ^19.0.0 | 144KB | ✅ Used everywhere |
| `react-dom` | ^19.0.0 | — | ✅ Used |
| `react-router-dom` | ^7.14.0 | 68KB | ✅ Used |
| `motion` | ^12.23.24 | ~120KB | ✅ Used (AnimatePresence, motion.div) |
| `clsx` | ^2.1.1 | 1KB | ✅ Used in `cn()` |
| `tailwind-merge` | ^3.5.0 | 3KB | ✅ Used in `cn()` |
| `lodash` | ^4.18.1 | 24KB | ❌ **UNUSED** — remove |
| `split-type` | ^0.3.4 | 8KB | ❌ **UNUSED** — remove or implement |

### Dependencies (dev)

| Package | Version | Status |
|---------|---------|--------|
| `gsap` | ^3.14.2 | ✅ Active use |
| `lenis` | ^1.3.21 | ✅ Active use |
| `typescript` | ~5.8.2 | ✅ |
| `vite` | ^6.2.0 | ✅ |
| `@playwright/test` | ^1.59.1 | ✅ Configured |
| `tailwindcss` | ^4.1.14 | ✅ |
| `@tailwindcss/vite` | ^4.1.14 | ✅ |
| `@vitejs/plugin-react` | ^5.0.4 | ✅ |

### Recommendations

1. **Remove** `lodash` — unused, 24KB saved
2. **Remove** `split-type` — unused, 8KB saved (or implement SplitType integration if the README describes intended future state)
3. **Add** `vite-plugin-inspect` — bundle analysis
4. **Add** `vitest` + `@testing-library/react` — unit testing infrastructure

---

## Recommended Roadmap

### Immediate (next sprint) — High Impact / Low Effort

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | Remove `lodash`, `split-type` from `package.json` | 5 min | Removes unused deps |
| 2 | Delete `src/motion/engine/index.ts` if empty, update README | 15 min | Eliminates dead code |
| 3 | Remove `SidebarMenu.tsx` + CSS | 5 min | Eliminates dead code |
| 4 | Fix `vite.config.ts` — `framer-motion` → `motion` | 2 min | Fixes chunk rule |
| 5 | Add skip-to-content link to `PortfolioLayout.tsx` | 30 min | Accessibility win |
| 6 | Consolidate `projects.ts` / `projectWorkData.ts` | 1 hr | Eliminates data duplication |
| 7 | Delete placeholder files (`menu.ts`, `services.ts`) if unused | 5 min | Less noise |

### Short-term (next 2 sprints) — High Impact / Moderate Effort

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 8 | Add `role="main"` / landmark regions to layouts | 30 min | Screen reader navigation |
| 9 | Fix `aria-pressed` → `aria-current="page"` in nav tabs | 15 min | Corrects ARIA semantics |
| 10 | Add focus management after route transitions | 1 hr | Keyboard UX |
| 11 | Refactor `ProjectBrutalistLayout.tsx` — extract UI primitives | 2 hr | Maintainability |
| 12 | Remove dead code: `AnimatedLink`, `Editorial.tsx` (if unused) | 20 min | Cleanup |
| 13 | Add Vitest + RTL, test `orchestrator.ts` and hooks | 3 hr | Test coverage |
| 14 | Audit README against actual codebase | 1 hr | Documentation accuracy |

### Medium-term (next milestone) — Variable Impact / Higher Effort

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 15 | Add bundle analysis tool, optimize chunking | 2 hr | Performance visibility |
| 16 | Extract GSAP animation logic into centralized hooks | 3 hr | Animation maintainability |
| 17 | Add color contrast verification in CI | 2 hr | Accessibility confidence |
| 18 | Implement SplitType text segmentation (or remove README ref) | 4 hr | Feature or cleanup |
| 19 | Audit image alt text across all components | 1 hr | WCAG 1.1.1 compliance |
| 20 | Add barrel exports for `components/ui/` and `layouts/` | 30 min | Import consistency |

### Ongoing

- Add accessibility checks (axe-core) to CI pipeline
- Establish component documentation pattern (Storybook or markdown)
- Run a full assistive technology audit (screen reader, keyboard-only, zoom) before each release
- Implement changelog convention for releases

---

## Raw Metrics

| Metric | Value |
|--------|-------|
| Source files (tsx + ts + css) | 103 |
| TypeScript files | 70 |
| CSS files | 33 |
| Total source lines (approx) | 24,000+ |
| TypeScript strict errors | 0 (strict mode passes) |
| Routes | 7 |
| Components (ui + effects + layout) | ~60 |
| Hooks | 6 |
| Custom types/interfaces | ~20 |
| Design tokens (CSS vars) | 45+ |
| Directories in `src/` | 14 |
| npm dependencies (production) | 7 (2 unused) |
| npm dependencies (dev) | 11 |
| Test files | 0 unit, E2E configured |
| Bundle chunks (manual) | 5 vendor chunks |
| Accessible skip-link | Only on project pages |
| Dark mode | Full token override system |
| Reduced-motion support | Full (provider + per-component guards) |
