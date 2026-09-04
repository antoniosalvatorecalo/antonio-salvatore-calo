# Documentation + Orphan Cleanup — Phase 2

## Goal

Bring documentation to `DOCUMENTATION = CURRENT CODEBASE`. Remove references to deleted components, systems, and routes. Eliminate residual orphan code confirmed by independent audit. Do not change visual/functional behavior.

## Current State (confirmed by audit)

### Active stack
- React 19 + Vite 6 + react-router-dom 7
- GSAP 3.14 + motion 12 + Lenis 1.3
- Tailwind v4 (CSS via `@tailwindcss/vite`) — kept only for tokens; no `@apply` use, styles in plain CSS
- API: Vercel serverless `api/contact.ts` (Nodemailer + SMTP, mailto fallback)
- TypeScript strict, ESLint pass, build pass, preview pass

### Active architecture
- `src/providers/AppRouter.tsx` registers:
  - `/` → `App` (renders lazy `PortfolioLayout` → `ProjectIndex` → `ProjectGrid`)
  - `/projects/bugonia` and `/projects/bugonia/credits` → `BugoniaPage`
  - `/projects/newsquest` and `/projects/newsquest/credits` → `NewsquestPage`
  - `/contact` → `ContactPage`
- `LanguageProvider` is the only top-level provider in the router. `FilterProvider` is local to `PortfolioLayout`. `MotionPreferenceProvider`, `ScrollProvider`, `ThemeProvider` are local to pages/layouts that need them.
- No `/about`, no `/work`, no carousel/grid views.

### Active components (verified)
- `src/components/home/`: `ProjectIndex`, `ProjectGrid` (the "GalleryGrid")
- `src/components/ui/`: `SiteHeader`, `ContactBuilder`, `ProjectCreditsSection`, `ProjectGallery`, `ProjectLeftTextReveal`, `ProjectListRow`, `ProjectSection`, `RollingText`, `ScrollingProjectText`, `WorkViewSwitcher` (orphan — built but not mounted anywhere — see step 5), `letter-swap` (`LetterSwapForward`, `LetterSwapBlock`), `ArrowIcon`
- `src/layouts/`: `PortfolioLayout`, `ProjectBrutalistLayout`

### Active hooks
- `useItalyTime`, `usePressedState`, `useTheme`, `useSwipeNavigation`, `useEntranceReveal`, `useProjectTextScroll`

### Active motion
- `src/motion/constants/{types,easing,index}.ts` — consumed by `ProjectBrutalistLayout`
- `src/motion/utils/scrollCascade.ts` — consumed by `ProjectBrutalistLayout`
- `src/animations/orchestrator.ts` — **orphan** (zero importers). `AnimationProvider` component is gone. The orchestrator file exists with an `about`-flavored `SectionId` union but nothing imports it.

### Confirmed dead/orphan code (residual from prior pass)
1. `src/animations/orchestrator.ts` — no consumers.
2. `src/components/ui/WorkViewSwitcher.tsx` (+ `.css`) — built but not mounted.
3. Stale comments referencing deleted components:
   - `src/i18n/translations.ts:203` — `AboutPrinciples component`
   - `src/content/contact.ts:3` — `Used by AboutContact (home page)…`
   - `src/index.css:124` — `ProjectMobileNav, BackToTop, mobile ThemeToggle` z-index layer legend (these three are gone)
   - `src/index.css:415` — `AwwwardsText` z-index label
4. Possibly unused deps to re-verify before removal:
   - `lodash` — only imported by `src/components/ui/letter-swap.tsx` (`import { debounce } from "lodash"`) — used.
   - `split-type` — no importer anywhere in `src/`. Strong candidate to remove (keep only after the agent confirms a second grep, including `letter-swap.tsx` / `LetterSwap*`).

## Decisions (resolved)

1. **Routes** — only the five routes in `AppRouter.tsx`. `/about` and `/work` are gone.
2. **Motion system** — describe `motion/constants`, `motion/utils/scrollCascade`, `useEntranceReveal`, `useProjectTextScroll`, GSAP via `gsap-setup.ts`, `MotionPreferenceProvider`, `useReducedMotionPreference`. Drop `AnimationProvider`, `orchestrator`, `presets/presets.ts` references — file `src/animations/orchestrator.ts` will be deleted.
3. **Components** — only the verified list. Drop `About*`, `MagneticButton`, `ProjectMobileNav`, `ProjectHeader`, `SidebarMenu`, `WorkPage`, `GridProjectsView`, `ProjectViewer`, `FullwidthSection`, `BlurText`, `RevealParagraph`, `AwwwardsText`, `CurvedLoop`, `ConcentricRings`, `AnimatedSectionHeader`, `SectionHeader`, `RevealLabel`, `LinkComponent`, `LinkWithArrow`, `Footer`, `ThemeToggle`, `AnimatedLink`, `BackToTop`, `CentralNavMenu`, `MobileBottomNav`, `ArtworkCarousel`, `ProjectCard`.
4. **Hooks** — only `useItalyTime`, `usePressedState`, `useTheme`, `useSwipeNavigation`, `useEntranceReveal`, `useProjectTextScroll`. Drop `useScrollReveal`, `useScrollStagger`, `useSectionReveal`, `useTextReveal`, `useSmoothScroll` (was used previously but its only consumer was deleted in the cleanup; verify in step 1 then delete from docs). `useEndOfContentReached` — also dropped.
5. **`WorkViewSwitcher`** — orphan component, no parent renders it. Delete the files.
6. **`split-type` dependency** — confirm with grep that there are zero importers; if confirmed, remove from `package.json` and `package-lock.json` (run `npm uninstall split-type`).
7. **Orphan documentation files** — delete or rewrite, see plan below.
8. **`docs/design/README.md`** — explicitly self-superseded by `docs/design-system/`. Delete.
9. **No redesign.** No visual/functional changes. No new deps. No new tests.

## Plan

Execute in order. After each major group, re-run lint + tsc + build + preview. After all groups, run the final orphan scan.

### Step 1 — Final code-side confirmation before any change

```
git status
git diff --stat
```
Then verify the four open uncertainties with greps:
- `rg "split-type|from 'lodash|split\\(" src` — confirm `split-type` has zero consumers
- `rg "useSmoothScroll" src` — confirm zero consumers
- `rg "WorkViewSwitcher" src` — confirm only self-reference (its own file)
- `rg "orchestrator" src` — confirm only `src/animations/orchestrator.ts`

If `useSmoothScroll` has consumers (likely `ProjectBrutalistLayout` or a lenis hook file), DO NOT remove its docs. If `split-type` has zero consumers, proceed with removal.

### Step 2 — Delete confirmed orphan code

Files to delete:
- `src/animations/orchestrator.ts`
- `src/animations/` (now empty)
- `src/components/ui/WorkViewSwitcher.tsx`
- `src/components/ui/WorkViewSwitcher.css`

If `src/animations/` and `src/motion/` are siblings and `src/animations/` becomes empty, delete the directory itself.

### Step 3 — Remove unused dependencies (only if Step 1 confirms)

- `split-type` — `npm uninstall split-type`
- `lodash` — KEEP (still used by `letter-swap.tsx`). Do not remove.

If `useSmoothScroll` is confirmed dead in code, optionally remove the file `src/hooks/animation/useSmoothScroll.ts` if it still exists (it was deleted in prior pass per audit; confirm via `ls`). Skip removal of unused animation hooks if they no longer exist.

### Step 4 — Clean stale comments in surviving source files

- `src/i18n/translations.ts` — replace `// ── Principles (condensed — AboutPrinciples component) ──────` with `// ── Principles (page-level section) ──────` or remove the comment if context is generic.
- `src/content/contact.ts` — replace comment `Used by AboutContact (home page) and ProjectBrutalistLayout (project pages).` with `Used by ProjectBrutalistLayout (project pages).`
- `src/index.css` — update z-index legend comments to reflect only the components that exist today. Specifically: drop `ProjectMobileNav`, `BackToTop`, `mobile ThemeToggle`, `AwwwardsText` from the legend entries (lines ~124 and ~415). Replace with the components actually present (`SiteHeader`, `ContactBuilder`, `LetterSwap*`, etc.). Keep layer indices; just make labels truthful.

### Step 5 — Rewrite documentation

Strategy: **edit, don't rewrite**. Update each file to describe the current architecture. Where entire pages describe deleted systems, rewrite the section minimally.

Files to update:

**Root**
- `README.md` — replace directory tree (no more `effects/`, `motion/engine`, `motion/presets`, `animations/AnimationProvider`, `work/`, `about/`). Replace architecture diagram (no more `About*`, no `WorkPage`/`GridProjectsView`). Replace Motion Architecture table to reference `motion/constants`, `motion/utils/scrollCascade`, `useEntranceReveal`, `useProjectTextScroll`. Remove `SplitType segmentation pipelines` mention. Drop `MagneticButton`, `BlurText`, `AwwwardsText`, `CurvedLoop`, `ConcentricRings`, `AnimatedSectionHeader`, `SectionHeader`, `RevealLabel`, `SidebarMenu`, `FullwidthSection`, `LinkComponent`. Update stack section: GSAP, Motion (motion/react), Lenis; keep Tailwind only if used (it is, for tokens); remove any claim about effects/text subdirs. Update commands section to match `package.json` scripts (`dev`, `build`, `preview`, `clean`, `lint`, `hooks:install`, `hooks:check`).

- `AI.md` — remove carousel/ProjectCard description if it doesn't match current home (the current home is `ProjectIndex`/`ProjectGrid`). Remove the `AboutBio.tsx:28, AboutPrinciples.tsx:28` XSS debt note (those files are gone). Replace with current reality.

- `AGENTS.md` — sweep for deleted-component mentions. Likely small edits.

- `CONTRIBUTING.md` — sweep for deleted-component mentions.

- `docs/INDEX.md` — verify links still resolve after the other doc changes.

**docs/animations/README.md** — heavily stale. Rewrite to describe the actual animation stack: GSAP setup via `src/lib/gsap-setup.ts`, `ScrollTrigger`, per-component `useEntranceReveal`, `useProjectTextScroll`, `motion/react` for primitives, `MotionPreferenceProvider` + `useReducedMotionPreference`, easing from `src/motion/constants/easing.ts`. Drop the entire `AnimationProvider` + `AnimationOrchestrator` + `ConcentricRings` + `presets.ts` + 3200ms preloader sections unless they describe active code. Keep the reduced-motion section (real).

**docs/engineering/**
- `README.md` — drop references to deleted systems.
- `agent-brief.md` — references `Maximum Effort/` (Obsidian) and orchestrator-vocabulary. Drop orchestrator claims; keep Obsidian-vault reference if it's used as a real external note.
- `animation-system.md` — full rewrite of the AnimationOrchestrator portion. Drop `motion/engine/cascadeEngine`, `motion/presets/presets.ts`, `useScrollReveal`, `AnimationProvider` content. Keep `useEntranceReveal`, `useProjectTextScroll`, reduced-motion, CSS animations.
- `architecture.md` — remove `AnimationProvider`, all `About*` from component list, drop `CentralNavMenu`/`BackToTop`/`MobileBottomNav`. Replace with `SiteHeader`, `ProjectIndex`, `ProjectGrid`, `ProjectBrutalistLayout`, `ContactBuilder`, `MotionPreferenceProvider`, `ScrollProvider`, `FilterProvider`, `LanguageProvider`, `ThemeProvider`. Update entrypoint chain.
- `contact-api.md` — likely OK, verify.
- `content-architecture.md` — update to reflect `projects.ts` + `workProjectExtras.ts` + `projectImageMetadata.ts` + `projectDetails/*`. Drop references to deleted `ProjectSectionText`, `ProjectMediaGrid`, `FullWidthImage`, `ProjectStatsGrid`, `projectWorkData`.
- `key-files.md` — drop `motion/engine/cascadeEngine.ts`, `hooks/animation/useScrollReveal.ts`, `src/lib/motion.ts`. Replace with the verified source-of-truth list.
- `layouts.md` — drop `ProjectMobileNav`, `CentralNavMenu`, `BackToTop`, `MobileBottomNav`. Replace with `SiteHeader`. Keep `ProjectBrutalistLayout`, `ScrollingProjectText`, `ProjectSection`, `ProjectCreditsSection`, `LetterSwapBlock`/`LetterSwapForward`.
- `navigation-and-theming.md` — drop `CentralNavMenu`, `MobileBottomNav`, `ProjectMobileNav`, `ThemeToggle`. Replace with `SiteHeader` + `useTheme` description.
- `performance-and-deployment.md` — drop `gsap-setup.ts` (still real, keep) and any `AnimationProvider` references. Verify chunk names match `vite.config.ts` (`vendor-react`, `vendor-router`, `vendor-motion`, `vendor-gsap`, `vendor-lenis`).
- `responsive-system.md` — drop `BackToTop`, `MobileBottomNav`, `CentralNavMenu`, `ProjectMobileNav`. Update to current responsive story (ProjectBrutalistLayout handles mobile via tab switching, SiteHeader adapts).
- `routing-and-pages.md` — drop `/about`, `/work`, `WorkPage`, `FeaturedProjectsView`, `GridProjectsView`. Replace with current 5 routes.
- `rules.md` — drop `AboutBio.tsx:28`, `AboutPrinciples.tsx:28` XSS debt. Drop deleted-component z-index mentions.
- `scrolling-system.md` — verify; mostly real (`useSmoothScroll`, `lenis-manager`). If `useSmoothScroll` was deleted, remove from docs.
- `state-management.md` — drop provider tree to match: `LanguageProvider` (top-level), `MotionPreferenceProvider` (per-page), `ScrollProvider` (per-page/layout), `ThemeProvider` (per-page), `FilterProvider` (PortfolioLayout). Drop `AnimationProvider`. Update ScrollerContext reference (still real if used in `ProjectBrutalistLayout`).

**docs/systems/**
- `theme.md` — drop `CentralNavMenu`, `MobileBottomNav`, `ThemeToggle`, `MotionPreferenceProvider` if not present at that layer. Keep `useTheme`.
- `shared-utilities.md` — drop `AnimationProvider` + `AnimationOrchestrator`; keep `useSmoothScroll` only if real.
- `scrolling.md` — keep if `useSmoothScroll` is real; otherwise trim.
- `routing.md` — replace route table with current 5 routes. Drop `/about`, `/work`.
- `responsive.md` — drop `BackToTop`, `MobileBottomNav`, `ProjectMobileNav`, `CentralNavMenu`. Update to current reality.
- `project-rendering.md` — update path of `ProjectCard` (does not exist as `src/components/projects/ProjectCard.tsx`; home shows `ProjectGrid` from `src/components/home/`). Drop `ProjectMobileNav`. Update layout description.
- `navigation.md` — currently lists 3 nav layers (CentralNavMenu desktop, MobileBottomNav + ProjectMobileNav mobile). Reality: `SiteHeader` only. Rewrite as a single section describing `SiteHeader` + `useTheme` + `useLanguage` + `useItalyTime`.
- `animations.md` — drop `AnimationProvider` + `AnimationOrchestrator`. Replace with the real motion stack (`gsap-setup.ts`, `motion/presets/presets.ts` [verify], `useEntranceReveal`, reduced-motion). Note `src/motion/presets/presets.ts` was deleted in prior pass per audit; remove references to it.

**docs/design/README.md** — DELETE (superseded by `docs/design-system/`).

**docs/design-system/**
- `README.md` — verify, may still be current.
- `colors.md` — verify, may still be current.
- `components.md` — drop `CurvedLoop`, `MotionPreferenceProvider` (only real one is providers, not in components), `ProjectMobileNav`, `BackToTop`, `ThemeToggle`, `CentralNavMenu`, `MobileBottomNav`. Drop `BlurText` from animation list.
- `motion.md` — drop `BlurText`. Drop the entire `AnimationOrchestrator` section. Replace with real motion primitives (`useEntranceReveal`, `useProjectTextScroll`, GSAP presets from `src/motion/constants/easing.ts`, `MotionPreferenceProvider`).
- `spacing-layout.md` — verify.
- `tokens.md` — drop `ProjectMobileNav`, `BackToTop`, `MobileBottomNav`, `CentralNavMenu`, `ThemeToggle` from z-index legend. Keep `SiteHeader`. Remove `data-section` rows referencing deleted orchestrator sections (`hero`, `bio`, `principles`, `services`, `contact`) unless any section uses them today (verify).
- `typography.md` — verify.
- `z-index.md` — same z-index cleanup as `tokens.md`.

**docs/adr/**
- `001-custom-router.md` — likely OK.
- `002-lenis-usage.md` — verify and trim if `useSmoothScroll` is gone.
- `003-scrolltrigger-integration.md` — likely OK.
- `004-dual-column-layout.md` — drop `AboutHero`, `Bio`, `Principles`, `Services`, `Contact`, `CentralNavMenu`, `BackToTop`, `ProjectMobileNav`. Replace with `SiteHeader` + dual-column home (`ProjectIndex`/`ProjectGrid`) + dual-column project (`ProjectBrutalistLayout`).
- `005-mobile-navigation.md` — DELETE OR REWRITE. The decision describes a 3-layer mobile nav (`MobileBottomNav`, `ProjectMobileNav`, `useSwipeNavigation`). `MobileBottomNav` and `ProjectMobileNav` are gone. `useSwipeNavigation` is real. Two options:
  1. **Recommended:** DELETE the file and replace content in `docs/adr/README.md` (if exists) or `docs/INDEX.md` with a note "superseded by SiteHeader consolidation".
  2. Keep but rewrite to describe actual mobile nav today: `SiteHeader` adapts, `useSwipeNavigation` powers `ProjectBrutalistLayout` swipe.
  Choose (1).
- `006-animation-strategy.md` — drop `AnimationProvider` references. Rewrite to describe the GSAP + Motion split and `MotionPreferenceProvider`.
- `007-typography-system.md` — verify, may still be current.

**docs/ai/** — likely OK (focuses on repo strategy, not code).
**docs/audit/** — KEEP as historical record. They accurately document the prior cleanup. Add a short note at the top of `docs/audit/INDEX.md` (if missing) saying "Historical snapshots — see current docs for live architecture."
**docs/onboarding/**
- `README.md` — drop orchestrator reference.
- `coding-standards.md` — drop `LinkComponent`, `useScrollReveal`, `useSmoothScroll` (if gone), any `AboutHero` reference. Replace with verified examples.
- `setup.md` — drop `useSmoothScroll`, `initGSAP` (verify gsap-setup still exports it). Keep `main.tsx`.
- `workflow.md` — likely OK.

**docs/product/README.md** — verify, may still be current.
**docs/qa/README.md** — verify.
**docs/repository/** — verify.
**docs/security/ENVIRONMENT_POLICY.md** — verify.

### Step 6 — Verification

After all changes:

```
npm install
npm run lint
npm run build
npm run preview
```

Check:
- TypeScript errors: 0
- Lint errors: 0
- Build pass
- Preview HTTP 200
- No broken imports
- No broken routes
- No CSS references to deleted files
- No asset references broken

Then a final grep sweep:
```
rg -l "AnimationProvider|cascadeEngine|useScrollReveal|useScrollStagger|useSectionReveal|useTextReveal|AboutHero|AboutBio|AboutServices|AboutPrinciples|AboutContact|AboutSection|MagneticButton|ProjectMobileNav|ProjectHeader|SidebarMenu|WorkPage|GridProjectsView|ProjectViewer|FullwidthSection|BlurText|RevealParagraph|AwwwardsText|CurvedLoop|ConcentricRings|AnimatedSectionHeader|SectionHeader|RevealLabel|LinkComponent|LinkWithArrow|AnimatedLink|ArtworkCarousel|BackToTop|CentralNavMenu|MobileBottomNav|ThemeToggle|projectWorkData|useEndOfContentReached|useSmoothScroll" .
```
Filter out `docs/audit/*` (historical) and `package-lock.json`. Every remaining hit must be inside `docs/audit/*` or in a verified live context.

### Step 7 — Final report

Produce the FINAL DOCUMENTATION + ORPHAN AUDIT report as specified in the brief.

## Open uncertainties (resolved during execution)

1. **Is `useSmoothScroll` still present in code?** — likely deleted in prior pass. If present, keep docs. If not, remove from docs.
2. **Is `src/motion/presets/presets.ts` present?** — per audit, deleted. Confirm via `ls` and remove references.
3. **Is `src/animations/` directory present?** — yes, contains only `orchestrator.ts`. Will be deleted along with the file.
4. **`WorkViewSwitcher` confirmation** — already confirmed unused by audit.

## Out of scope

- Visual redesign, animation tweaks, UX changes
- Adding/removing routes
- New dependencies
- New components
- Test creation
- Commit / push / deploy (user will do that)

## Validation gates

1. `npm install` exits 0
2. `npm run lint` exits 0
3. `npm run build` exits 0
4. `npm run preview` returns HTTP 200 on `/`, `/projects/bugonia`, `/projects/newsquest`, `/contact`
5. Final grep sweep returns no live-code references to deleted components
6. Documentation matches actual `AppRouter.tsx` routes