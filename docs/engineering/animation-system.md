# Animation System

> Comprehensive guide to the animation architecture — GSAP setup, Motion primitives, AnimationOrchestrator, entrance reveals, and animation presets.
> Owner: Engineering

---

## 1. Overview

The animation system operates at three distinct levels:

| Level | Technology | Scope |
|-------|-----------|-------|
| **Infrastructure** | GSAP + ScrollTrigger | Timeline orchestration, scroll-linked animations, plugin registration |
| **Primitives** | Motion (framer-motion successor) | `motion.div`, springs, AnimatePresence, gesture transforms |
| **Orchestration** | AnimationProvider + orchestrator | Deterministic section cascade (idle → visible → playing → done) |

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

`initGSAP()` is called when `useSmoothScroll` module first loads (not in `main.tsx`):

```typescript
// useSmoothScroll.ts — module level
initGSAP();
```

This defers GSAP loading until a scroll-dependent component actually mounts, keeping the initial bundle smaller.

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

## 4. AnimationOrchestrator

**File:** `src/animations/orchestrator.ts`

### State Machine

The orchestrator is a **synchronous, deterministic state machine** managing the left-column section cascade:

```
idle → visible → playing → done
```

### Section Order

```typescript
const SECTIONS: readonly SectionId[] = [
  'hero',      // Type: 'instant' — completes immediately without playFn
  'bio',        // Type: 'standard'
  'principles', // Type: 'standard'
  'services',   // Type: 'standard'
  'contact',    // Type: 'standard'
];
```

### Execution Guarantee

```
AnimationProvider.useLayoutEffect runs FIRST → creates ScrollTriggers
Children's useLayoutEffect runs AFTER → registerPlayFn calls
ScrollTrigger fires when user scrolls → markVisible triggers play
```

### Key Operations

| Operation | Purpose |
|-----------|---------|
| `markVisible(id)` | Called by ScrollTrigger.onEnter. Transitions `idle` → `visible`. If previous section is `done`, plays immediately. |
| `markComplete(id)` | Called by timeline `onComplete`. Transitions `playing` → `done`. Tries to advance to next section. |
| `registerPlayFn(id, fn)` | Late-binding: stores the play function. If section is already visible, fires immediately. |
| `reset()` | Resets all sections to `idle`. Called on route change or remount. |

### Cascade Logic

```typescript
_canPlay(id): boolean {
  const idx = SECTIONS.indexOf(id);
  const prev = SECTIONS[idx - 1];
  if (idx === 0) return status.get(id) === 'visible';
  return status.get(id) === 'visible' && status.get(prev) === 'done';
}
```

Sections play **strictly in order**. Section N can only play when section N-1 is `done`. This guarantees predictable reveal sequencing.

---

## 5. AnimationProvider

**File:** `src/animations/AnimationProvider.tsx`

### ScrollTrigger Integration

Creates ScrollTrigger instances for each standard section:

```typescript
SECTIONS.filter((id) => id !== 'hero').forEach((id) => {
  const el = document.querySelector(`[data-section="${id}"]`);
  const st = ScrollTrigger.create({
    trigger: el,
    scroller,
    start: id === 'contact' ? 'top 95%' : 'top 90%',
    once: true,
    invalidateOnRefresh: true,
    onEnter: () => orchestrator.markVisible(id),
  });
  triggers.push(st);
});

// Hero is instant — mark immediately
orchestrator.markVisible('hero');
```

**Props:**
- `children` — wrapped content
- `enabled` — when false, no ScrollTriggers are created (used during initial load)

The `activeTab` and `isDesktop` dependency array ensures triggers are re-created when the mobile tab switches or viewport changes.

---

## 6. Entrance Reveal System

**File:** `src/hooks/animation/useEntranceReveal.ts`

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
| `WorkPage ListViewContainer` | `.project-list-row-wrap` | y:18, blur:4, stagger:0.07 |
| `WorkPage FeaturedProjectsView` | `.featured-card-v2` | y:20, blur:5, stagger:0.1 |
| `LayoutSplitTextMediaStack` | `[data-project-stack]` | y:18, blur:0, stagger:0 |

---

## 7. Animation Presets

**File:** `src/motion/presets/presets.ts`

```typescript
export interface CascadePresetConfig {
  y: number;
  blur: number;
  duration: number;
  ease: string;
}

export const cascadePresets: Record<CascadePreset, CascadePresetConfig> = {
  default: { y: 24, blur: 10, duration: 0.9, ease: 'power4.out' },
  soft:    { y: 16, blur: 6,  duration: 1.1, ease: 'power3.out' },
  sharp:   { y: 32, blur: 14, duration: 0.7, ease: 'power4.inOut' },
};
```

---

## 8. Project-Specific Animations

### Project Card Entry (PortfolioLayout)

3D entrance from a tilted, zoomed-out position behind the right column:

```
Timeline (per card, staggered 0.16s):
  card.wrapper   → opacity: 1, transform: none  (1.28s, start: 0.08 + i*0.16)
  card.mask      → y: 0, scale: 1               (1.46s)
  card.image     → x: 0, y: 0, scale: 1         (1.56s)
  card.matte     → xPercent: 112, opacity: 0     (1.08s + 0.2s)
  card.meta      → opacity: 1, y: 0             (0.68s, stagger: 0.04)
  card.caption   → opacity: 1, y: 0             (0.68s, stagger: 0.04)
```

### Project Card Scroll Effect (ProjectCard)

During normal scroll, each card subtly skews and scales based on scroll velocity:

```typescript
const { scrollYProgress } = useScroll({ target: localRef, offset: ["start end", "end start"] });
const scrollVelocity = useVelocity(scrollYProgress);
const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
const skewYTransform = useTransform(smoothVelocity, [-1, 1], [-2, 2]);
const microScaleTransform = useTransform(smoothVelocity, [-2, 0, 2], [1.02, 1, 0.98]);
const microRotateTransform = useTransform(smoothVelocity, [-1, 1], [0.5, -0.5]);
```

This creates a parallax-like micro-motion effect — the card skews slightly in the direction of scroll.

### Project Page Scroll Reveals (ProjectBrutalistLayout)

Three types of scroll-reveal within the right column:

| Type | Selector | Animation | Trigger |
|------|----------|-----------|---------|
| Word split | `[data-split]` | blur(10px) → 0, y:40 → 0, stagger:0.03 | top 70% |
| Fade blur | `[data-fade]` | blur(10px) → 0, y:15 → 0 | top 85% |
| CTA delay | `[data-cta]` | y:20 → 0, delay:0.4 | top 85% |
| Media stack | `.media-stack-item-0/1` | y:24, scale 0.985 → 1, stagger:0.08 | top 88% |
| Section paragraph | `[data-section-reveal="paragraph"]` | blur(10px) → 0, y:15 → 0, delay:0.4 | top 70% |

### Project Card Caption Reveal (ProjectCard)

Editorial captions (client name, category) fade in when card scrolls into view:

```typescript
gsap.to(captionEls, {
  opacity: 1, y: 0,
  duration: 0.7, stagger: 0.04,
  scrollTrigger: { trigger: container, scroller, start: 'top 85%' },
});
```

---

## 9. CSS Animations

### Global Keyframes

| Name | Purpose |
|------|---------|
| `breathe` | Subtle opacity pulse (`--breathe-intensity` variable) |
| `rotateAmbient` | 360° rotation for decorative conic gradient |
| `scrollPulse` | Vertical scale pulse for scroll indicator bar |
| `contact-blink` | Cursor blink for ContactBuilder input |

### Stagger Data Attributes

Left-column sections use CSS transitions triggered by `.animate` class addition:

| Attribute | TranslateY | Used In |
|-----------|-----------|---------|
| `data-stagger` | 18px | Section headers |
| `data-stagger-medium` | 12px | Labels |
| `data-stagger-shallow` | 8px | List items/values |

The `.animate` class is added via GSAP ScrollTrigger integration (AnimationProvider → orchestrator → markComplete).

---

## 10. Reduced Motion

All animations respect the user's `prefers-reduced-motion` preference:

1. **CSS level**: `html[data-motion="reduced"]` forces all transitions/animations to 0.01ms
2. **Motion level**: `useReducedMotionPreference()` returns boolean; components use `instantTransition` when true
3. **GSAP level**: Components check the preference and call `gsap.set()` to final state instead of `gsap.to()` when reduced
4. **Provider level**: `MotionPreferenceProvider` listens for live changes via MediaQueryList event

---

## 11. Performance Considerations

- **will-change is temporary**: Added before animation, cleared via `clearProps: 'willChange'` on completion
- **GPU acceleration**: Animations constrained to `transform`, `opacity`, and `filter` only — no layout-triggering properties
- **GSAP context scoping**: Every animation group is scoped with `gsap.context()` for proper cleanup
- **No opacity-only reveals**: The system intentionally avoids opacity-only transitions to maintain edge definition during motion
- **ScrollTrigger.invalidateOnRefresh**: Set `true` to recalculate on resize without destroying triggers

---

## 12. Cross-References

- [Architecture overview](architecture.md) — Rendering layers, component contracts
- [Scrolling system](scrolling-system.md) — ScrollTrigger integration with Lenis
- [Layouts](layouts.md) — Project card entry, section cascade, page animations
- [State management](state-management.md) — AnimationOrchestrator state machine
- [Performance](performance-and-deployment.md) — Bundle splitting, will-change strategy
