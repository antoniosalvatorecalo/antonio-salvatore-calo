# Animation System

> Comprehensive guide to the animation architecture — GSAP setup, Motion primitives, entrance reveals, reduced motion.
> Owner: Engineering

---

## 1. Overview

The animation system operates at three distinct levels:

| Level | Technology | Scope |
|-------|-----------|-------|
| **Infrastructure** | GSAP + ScrollTrigger | Timeline orchestration, scroll-linked animations, plugin registration |
| **Primitives** | Motion (framer-motion successor) | `motion.div`, springs, AnimatePresence, gesture transforms |
| **Coordination** | `MotionPreferenceProvider` + `runOrSetFinal` | Reduced motion detection + final-state fallback |

There is no longer an `AnimationProvider` / `AnimationOrchestrator` — the section cascade they used to manage (hero → bio → principles → services → contact) was part of the deleted `About*` components. Page-level reveals now go through `useEntranceReveal` and `useProjectTextScroll`.

---

## 2. GSAP Setup

**File:** `src/lib/gsap-setup.ts`

### Single Canonical Source

GSAP plugins are registered **exactly once** at module load time:

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({
    nullTargetWarn: false,
    units: { left: "px", top: "px", rotation: "deg" },
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  if (document.readyState === 'complete') {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }
}
```

**Critical rule:** No other file registers GSAP plugins. This prevents duplicate registration errors.

### Init Timing

`initGSAP()` is called when a scroll-dependent module first loads. It defers GSAP loading until a scroll-dependent component actually mounts, keeping the initial bundle smaller.

### GSAP Context Pattern

Every component that creates GSAP animations wraps them in `gsap.context()`:

```typescript
const ctx = gsap.context(() => {
  gsap.to(targets, { ... });
  gsap.from(elements, { ... });
}, container);

return () => ctx.revert();
```

This ensures all tweens are reverted on unmount, preventing memory leaks and stale animations on route transitions.

---

## 3. Motion Primitives

**File:** `src/motion/constants/easing.ts`

```typescript
export const EASE_PREMIUM: Easing = [0.16, 1, 0.3, 1];    // Standard ease
export const EASE_CINEMATIC: Easing = [0.85, 0, 0.15, 1];   // Dramatic ease-out

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

export const SPRING_CURSOR: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 15
};
```

### Motion Usage Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| Route transitions | `motion.div` keyed by pathname | Crossfade between pages |
| Magnetic buttons | `motion.button` with spring transform | Cursor-following UI elements |
| Theme toggle icon | `AnimatePresence mode="wait"` | Rotating sun/moon icon swap |
| Back arrow rotation | `motion.svg` with animated rotate | Arrow points up at top, left when scrolled |
| Nav tab parallax | `motion.button` with spring `x`/`y` | Subtle cursor-follow on nav items |

All Motion components check `prefersReducedMotion` and use `instantTransition` (duration: 0) when reduced motion is active.

---

## 4. Entrance Reveal System

**File:** `src/hooks/useEntranceReveal.ts`

### Purpose

A reusable hook that creates scroll-triggered blur + translateY reveal animations for groups of elements.

### Signature

```typescript
useEntranceReveal(containerRef, {
  selector: '[data-entrance-item]',  // Elements to animate
  triggerRef?:                        // Optional different trigger element
  scrollerRef?:                       // Optional different scroller (project pages)
  delay: 0,
  stagger: 0.08,                      // Stagger between items
  duration: 0.72,
  ease: 'power3.out',
  y: 18,                              // Start position offset
  blur: 10,                           // Start blur in px
  threshold: 0.15,                    // Scroll trigger threshold
  start: 'top 85%',                   // Custom start position
  once: true,                         // Animate once
  disabled: false,
  phases?: EntranceRevealPhase[],     // Multi-phase reveals
});
```

### Multi-Phase Support

Accepts an array of phases for complex reveals where different element groups animate with different timing:

```typescript
useEntranceReveal(containerRef, {
  phases: [
    { selector: '.title', y: 24, blur: 8, stagger: 0.03 },
    { selector: '.description', y: 16, blur: 4, stagger: 0.05, at: '>-0.1' },
  ],
});
```

Each phase can specify `at` (position parameter) for fine-grained timeline control.

### Used By

| Component | Selector | Preset |
|-----------|----------|--------|
| Home gallery cards | `.project-list-row-wrap` | y:18, blur:4, stagger:0.07 |
| `ProjectGallery` thumbnails | `.featured-card-v2` | y:20, blur:5, stagger:0.1 |
| `ProjectSection` media stacks | `[data-project-stack]` | y:18, blur:0, stagger:0 |

---

## 5. Project-Specific Animations

### Project Card 3D Entrance (`PortfolioLayout`)

The home gallery cards perform a 3D entrance animation on first load:

```
Timeline (per card, staggered 0.16s):
  card.wrapper   → opacity: 1, transform: none  (1.28s, start: 0.08 + i*0.16)
  card.mask      → y: 0, scale: 1               (1.46s)
  card.image     → x: 0, y: 0, scale: 1         (1.56s)
  card.matte     → xPercent: 112, opacity: 0     (1.08s + 0.2s)
  card.meta      → opacity: 1, y: 0             (0.68s, stagger: 0.04)
  card.caption   → opacity: 1, y: 0             (0.68s, stagger: 0.04)
```

`.revealed` class + `clearProps: 'willChange'` on complete.

### Project Page Scroll Reveals (`ProjectBrutalistLayout`)

Three types of scroll-reveal within the right column:

| Type | Selector | Animation | Trigger |
|------|----------|-----------|---------|
| Word split | `[data-split]` | blur(10px) → 0, y:40 → 0, stagger:0.03 | top 70% |
| Fade blur | `[data-fade]` | blur(10px) → 0, y:15 → 0 | top 85% |
| CTA delay | `[data-cta]` | y:20 → 0, delay:0.4 | top 85% |
| Media stack | `.media-stack-item-0/1` | y:24, scale 0.985 → 1, stagger:0.08 | top 88% |
| Section paragraph | `[data-section-reveal="paragraph"]` | blur(10px) → 0, y:15 → 0, delay:0.4 | top 70% |

### Project Text Scroll Sync (`useProjectTextScroll`)

Tracks which image section is visible in the right column and updates `visibleIdx` state. `ScrollingProjectText` in the left column highlights the matching section. 300ms init delay; cleanup kills triggers and reverts context.

---

## 6. CSS Animations

### Global Keyframes

| Name | Purpose |
|------|---------|
| `breathe` | Subtle opacity pulse (`--breathe-intensity` variable) |
| `rotateAmbient` | 360° rotation for decorative conic gradient |
| `scrollPulse` | Vertical scale pulse for scroll indicator bar |
| `contact-blink` | Cursor blink for ContactBuilder input |

### Stagger Data Attributes

| Attribute | TranslateY | Used In |
|-----------|-----------|---------|
| `data-stagger` | 18px | Section headers |
| `data-stagger-medium` | 12px | Labels |
| `data-stagger-shallow` | 8px | List items/values |

---

## 7. Reduced Motion

All animations respect the user's `prefers-reduced-motion` preference:

1. **CSS level**: `html[data-motion="reduced"]` forces all transitions/animations to 0.01ms.
2. **Motion level**: `useReducedMotionPreference()` returns boolean; components use `instantTransition` when true.
3. **GSAP level**: Components check the preference and call `gsap.set()` to the final state instead of `gsap.to()` when reduced.
4. **Provider level**: `MotionPreferenceProvider` listens for live changes via MediaQueryList event.

The `runOrSetFinal` helper in `src/lib/reduced-motion.ts` standardises the GSAP path.

---

## 8. Performance Considerations

- **will-change is temporary**: Added before animation, cleared via `clearProps: 'willChange'` on completion.
- **GPU acceleration**: Animations constrained to `transform`, `opacity`, and `filter` only — no layout-triggering properties.
- **GSAP context scoping**: Every animation group is scoped with `gsap.context()` for proper cleanup.
- **No opacity-only reveals**: The system intentionally avoids opacity-only transitions to maintain edge definition during motion.
- **ScrollTrigger.invalidateOnRefresh**: Set `true` to recalculate on resize without destroying triggers.

---

## 9. Cross-References

- [Architecture overview](architecture.md) — Rendering layers, component contracts
- [Scrolling system](scrolling-system.md) — ScrollTrigger integration with Lenis
- [Layouts](layouts.md) — Gallery entrance, project page reveals
- [State management](state-management.md) — `MotionPreferenceProvider`, route-derived state
- [Performance](performance-and-deployment.md) — Bundle splitting, will-change strategy
