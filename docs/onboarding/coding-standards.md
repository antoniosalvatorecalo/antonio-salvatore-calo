# Coding Standards

> Naming, structure, patterns, CSS conventions.
> Owner: Engineering

---

## TypeScript

### Config

- `tsconfig.json` uses `strict: true`
- `noUnusedLocals` + `noUnusedParameters` enabled
- Path alias `@/` maps to `./src/*`
- Target `ES2022`, module `ESNext`

### Preferences

- **Explicit types** over inference for function signatures and exports
- **Discriminated unions** for state machines
- **`interface`** for object shapes (extends-friendly), `type` for unions/utility types
- **`const`** over `let` — never use `var`
- **Barrel exports** (`index.ts`) per directory — import from directory, not deep paths

### Anti-patterns

- No `any` — use `unknown` + type guard instead
- No `// @ts-ignore` or `// @ts-expect-error` without documented reason
- No mutable exports — use `const` + `Readonly<T>`

---

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Files (components) | PascalCase | `ProjectCard.tsx`, `AboutHero.tsx` |
| Files (hooks) | camelCase prefix `use` | `useSmoothScroll.ts` |
| Files (utilities) | kebab-case | `gsap-setup.ts`, `lenis-manager.ts` |
| Files (barrel) | `index.ts` | `src/components/effects/text/index.ts` |
| Components | PascalCase | `function ProjectCard()`, export default |
| Hooks | camelCase, prefix `use` | `export function useScrollReveal()` |
| Functions | camelCase | `function handlePreloaderComplete()` |
| Interfaces/Type aliases | PascalCase | `interface ProjectData`, `type AnimationState` |
| Constants | UPPER_SNAKE_CASE | `MIN_DURATION_MS = 3200` |
| CSS custom properties | kebab-case, prefix `--` | `--z-nav`, `--text-primary` |
| CSS classes | kebab-case | `project-card-wrapper`, `glass-nav` |
| Data attributes | kebab-case | `data-section`, `data-reveal`, `data-stagger` |

### Directory Structure

```
src/
├── pages/           # Page-level components (one dir per route)
├── components/      # Reusable components
│   ├── effects/     # Animation effects (text/, interaction/, decorative/, loaders/, layout/)
│   ├── ui/          # Atomic primitives
│   ├── navigation/  # Nav components
│   ├── layout/      # Layout primitives
│   └── shared/      # ErrorBoundary, LinkComponent
├── hooks/           # Custom hooks (animation/, navigation/, theme/)
├── motion/          # Animation engine (engine/, presets/, constants/, utils/)
├── lib/             # Core setup (gsap-setup.ts, lenis-manager.ts)
├── content/         # Editorial data
├── layouts/         # Page layouts
├── providers/       # React context providers
├── styles/          # Additional CSS files
└── types/           # Type declarations
```

---

## React Components

### forwardRef Convention

All renderable primitives expose DOM via `forwardRef`. This lets GSAP target elements directly, no query selectors.

```tsx
export const MyComponent = forwardRef<HTMLDivElement, MyProps>(
  (props, ref) => {
    return <div ref={ref}>...</div>;
  }
);
```

### Composition

- Page components compose layouts, which compose sections, which compose UI primitives and effects
- No deeply nested default exports — export/import by name
- One component per file (exceptions: small tightly-coupled helpers)

### State

- Animation state goes in refs, not React state
- React state for UI only — open/closed, active tab, theme preference
- Context for shared state (scroll refs, theme), but no animation logic in context

---

## Animation Patterns

### GSAP Rules

- **Single canonical registration**: `lib/gsap-setup.ts` — `initGSAP()` calls `gsap.registerPlugin(ScrollTrigger)` once
- **Scoped contexts**: wrap all GSAP work in `gsap.context()` — auto-cleanup on unmount

```tsx
useGSAP(() => {
  const ctx = gsap.context(() => {
    gsap.to(ref.current, { ... });
  });
  return () => ctx.revert();
});
```

- **No `!important`** on properties GSAP animates (opacity, transform, etc.)
- **No `visibility: hidden`** — use `AnimatePresence`

### Motion (library) Rules

- `motion.div` for springs, gestures, AnimatePresence transitions
- **No `drag="x"`** on carousel — pointer events + GSAP tweens only

### Data Attributes

Animation triggers via data attributes, not imperative calls:

| Attribute | Purpose |
|-----------|---------|
| `data-section` | Section identity for orchestration |
| `data-split` | Word-split text reveal |
| `data-fade` | Blur-fade scroll reveal |
| `data-stagger` | CSS-based stagger animation |
| `data-reveal` | Legacy reveal system (deprecated, prefer above) |

### Lenis

- No global Lenis instance
- Per-column via `useSmoothScroll` hook only
- Active only on desktop (>=1024px)
- Synchronized through GSAP ticker bridge

---

## CSS Conventions

### Tailwind v4

Configured via `@tailwindcss/vite` plugin. Use `@theme` block for custom tokens.

### Custom Properties

All design tokens defined as CSS custom properties in `src/index.css` under `:root`:

- Use token classes instead of inline arbitrary values
- Never add raw z-index values — use `z-nav`, `z-preloader`, etc.
- Never add ad-hoc hex colors — use `var(--text-primary)`, etc.

### Z-Index System

Centralized in `:root`. Use the utility classes:

| Class | Value | Layer |
|-------|-------|-------|
| `.z-dropdown` | 20 | Dropdowns |
| `.z-mobile-bottom-nav` | 50 | Mobile nav |
| `.z-project-shell` | 60 | Project pages |
| `.z-nav-floating` | 70 | Floating nav elements |
| `.z-view-switcher` | 90 | View switcher |
| `.z-nav` | 100 | Main navigation |
| `.z-preloader` | 900 | Preloader |
| `.z-skip-link` | 999 | Skip link (accessibility) |

### will-change

Applied temporarily during animation, cleared on complete via `gsap.set(element, { clearProps: 'willChange' })`. No permanent `will-change`.

### Loading Gate

```css
html.loading { opacity: 0; }
html.ready   { opacity: 1; transition: opacity 0.2s ease-out; }
```

Never override these. The preloader lifecycle manages the transition.

---

## Animation-Constrained Properties

Only animate these GPU-composited properties:

| Property | Used For |
|----------|----------|
| `transform` | Position, scale, rotation |
| `opacity` | Fades |
| `filter` | Blur reveals |

**Never animate**: `width`, `height`, `top`, `left`, `margin`, `padding` — triggers layout.

---

## Imports

Order: third-party → absolute (`@/`) → relative.

```tsx
import { forwardRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from './ProjectCard';
```

---

## Component Checklist

Before committing a new component:

- [ ] `forwardRef` used for DOM access
- [ ] Animation scoped in `gsap.context()`
- [ ] No `!important` on animated properties
- [ ] No `visibility: hidden`
- [ ] Keyboard accessible (Tab, Enter/Escape)
- [ ] Screen reader friendly (labels, roles)

---

## Cross-References

- [Engineering Rules](../engineering/rules.md) — Critical rules, z-index, known debt
- [Architecture](../engineering/architecture.md) — Full system invariants
- [Design System](../design-system/README.md) — Tokens, dos and don'ts
