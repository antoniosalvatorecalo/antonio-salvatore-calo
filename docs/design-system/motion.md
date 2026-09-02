# Motion System

> Two engines, strict domain split. Purposeful motion only — never decorative.
> GSAP for scroll-driven + complex timelines. Motion for springs + gestures.

---

## Engine Split

| Engine | Scope | Files |
|--------|-------|-------|
| **GSAP 3** + ScrollTrigger | Timelines, scroll-linked reveals, 3D card entrance, section cascade, stagger | `src/lib/gsap-setup.ts`, scroll |
| **Motion 12** | Springs, gestures (magnetic hover), AnimatePresence transitions, scroll-linked transforms | `src/motion/`, components |

### GSAP

Bootstrapped once at module load:

```typescript
// src/lib/gsap-setup.ts
export function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false, units: { left: "px", top: "px", rotation: "deg" } });
}
```

All GSAP animations wrapped in `gsap.context()` for cleanup:

```typescript
const ctx = gsap.context(() => {
  gsap.to(targets, { ... });
}, containerRef);
return () => ctx.revert();
```

### GSAP Animations List

| Animation | Component | Mechanism | Duration |
|-----------|-----------|-----------|----------|
| Section cascade (left column) | PortfolioLayout → AnimationOrchestrator | ScrollTrigger → state machine | 0.6-0.9s per section |
| Project card 3D entrance | PortfolioLayout | Staggered timeline, perspective transform | 0.16s stagger |
| ScrollingProjectText | ProjectBrutalistLayout | ScrollTrigger y:24→0 + opacity | 0.6s |
| Scroll reveal (blur + y) | useEntranceReveal hook | ScrollTrigger + stagger | 0.7-0.9s |
| Media stack reveal | LayoutSplitTextMediaStack | ScrollTrigger per stack | 0.7s |
| Word-level blur reveal | BlurText | GSAP stagger by word | 0.05s stagger |

### Motion Animations List

| Animation | Component | Mechanism |
|-----------|-----------|-----------|
| Route transitions | AppRouter | AnimatePresence mode="wait", fade 0.25s |
| Magnetic buttons | CentralNavMenu | Spring stiffness 150, damping 15, mass 0.1 |
| Theme toggle icon | CentralNavMenu | AnimatePresence + rotate spring |
| Project card scroll skew | ProjectCard | useScroll → useTransform → useSpring |
| Nav tab parallax | Nav components | Spring x/y on cursor proximity |
| Mobile nav underline | ProjectMobileNav | scaleX spring 0→1 |

---

## Easing & Springs

### CSS Easing Curves

```css
--ease-premium: cubic-bezier(0.16, 1, 0.3, 1);        /* Standard ease-out */
--ease-cinematic: cubic-bezier(0.85, 0, 0.15, 1);     /* Dramatic ease-out */
--ease-spring: cubic-bezier(0.22, 1, 0.36, 1);        /* Spring-like */
```

### Application

| Context | Easing | Duration |
|---------|--------|----------|
| Entrance transitions | `cubic-bezier(0.16, 1, 0.3, 1)` | 0.6-0.9s |
| Hover effects | `ease-out` | 0.2-0.3s |
| Button transitions | `ease` | 0.15-0.2s |
| Route fades | `ease` | 0.25s |
| Link arrow rotate | `ease-out` | 0.3s |
| Service card details | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.3s |
| App reveal | `cubic-bezier(0.16, 1, 0.3, 1)` | 1s |

### Motion Spring Constants

```typescript
// src/motion/constants/easing.ts
export const SPRING_SNAPPY = { stiffness: 400, damping: 30 };
export const SPRING_MAGNETIC = { stiffness: 150, damping: 15, mass: 0.1 };
export const SPRING_CURSOR = { stiffness: 150, damping: 15 };
```

### GSAP Presets

```typescript
// src/motion/presets/presets.ts
const cascadePresets = {
  default: { y: 24, blur: 10, duration: 0.9, ease: 'power4.out' },
  soft:    { y: 16, blur: 6,  duration: 1.1, ease: 'power3.out' },
  sharp:   { y: 32, blur: 14, duration: 0.7, ease: 'power4.inOut' },
};
```

### Stagger Depths

| Layer | TranslateY | Duration | Ease |
|-------|-----------|----------|------|
| `[data-stagger]` | 18px (12px mobile) | 0.6s | `cubic-bezier(0.22,1,0.36,1)` |
| `[data-stagger-medium]` | 12px | 0.6s | same |
| `[data-stagger-shallow]` | 8px | 0.6s | same |

---

## AnimationOrchestrator

Deterministic state machine for left-column section cascade (home page).

**File**: `src/animations/orchestrator.ts`

```
idle → visible → playing → done
```

### Sections (strict order)

1. hero (instant — no ScrollTrigger)
2. bio (standard)
3. principles (standard)
4. services (standard)
5. contact (standard)

### API

```typescript
const orchestrator = new Map<SectionId, SectionState>();

markVisible(id)     // ScrollTrigger fires → section enters viewport
markComplete(id)    // Section done playing → unlock next section
registerPlayFn(id, fn)  // Register the play callback
reset()             // Revert all sections to idle
```

Uses module-level `Map` — not React state — avoids render cycle delay.

---

## useEntranceReveal Hook

Reusable scroll-reveal hook. GSAP blur + translateY per element group.

**File**: `src/hooks/animation/useEntranceReveal.ts`

```typescript
useEntranceReveal(containerRef, {
  selector: '[data-entrance-item]',
  stagger: 0.08,
  duration: 0.72,
  y: 18,
  blur: 10,
  once: true,
  start: 'top 85%',
});
```

---

## Reduced Motion

Four-layer cascade ensures motion is fully disabled for users who prefer reduced motion.

### Layer 1: CSS Attribute

```css
html[data-motion="reduced"] *,
html[data-motion="reduced"] *::before,
html[data-motion="reduced"] *::after {
  scroll-behavior: auto;
  transition-duration: 0.01ms !important;
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
}
```

### Layer 2: Motion Library

```typescript
const reducedMotion = useReducedMotionPreference();
// → instantTransition (duration 0)
```

### Layer 3: GSAP

```typescript
if (reducedMotion) {
  gsap.set(targets, { opacity: 1, y: 0 });  // Skip animation, set final state
} else {
  gsap.to(targets, { opacity: 1, y: 0, ... });
}
```

### Layer 4: Provider

```typescript
// MotionPreferenceProvider listens for live MediaQueryList changes
// Sets data-motion on <html> → CSS cascade kills all animations
```

### Reduced Motion Effects on Stagger System

```css
@media (prefers-reduced-motion: reduce) {
  [data-stagger],
  [data-stagger-medium],
  [data-stagger-shallow] {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
```

---

## Theme Toggle Animation

```typescript
animate={{ rotate: reducedMotion ? 0 : theme === 'dark' ? 180 : 0 }}
```

- Icon swap via `AnimatePresence mode="wait"`
- Rotate spring disabled when reduced motion is active

---

## Link & Arrow Hover Pattern

Consistent hover behavior across all interactive links:

```css
.arrow-icon {
  transform: rotate(0deg);
  transition: transform 0.3s ease-out;
}

@media (hover: hover) {
  .overlay-link:hover .arrow-icon {
    transform: rotate(-45deg);
  }
  .overlay-link:hover .arrow-icon {
    transform: rotate(-45deg) translateY(-3px);
  }
}
```

Applied in: `overlay-link`, `cta-link`, `social-link`, `link-arrow-wrap`, `project-link-tab`.

---

## Keyframe Animations (CSS)

### Breathe

```css
@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: calc(1 - var(--breathe-intensity, 0.03)); }
}
.breathing-wrapper {
  animation: breathe ease-in-out infinite 4000ms;
}
```

### Rotate Ambient

```css
@keyframes rotateAmbient {
  to { transform: rotate(360deg); }
}
.rotating-ambient {
  background: conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.4) 15%, ...);
  animation: rotateAmbient 20s linear infinite;
}
```

### Scroll Pulse

```css
@keyframes scrollPulse {
  0%, 100% { opacity: 0.2; transform: scaleY(0.6); }
  50% { opacity: 0.8; transform: scaleY(1.0); }
}
.scroll-pulse-bar {
  animation: scrollPulse 1.4s ease-in-out infinite;
}
```

### Cursor Blink

```css
@keyframes contact-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.contact-builder-cursor {
  animation: contact-blink 1s step-end infinite;
}
```

---

## Lifecycle

1. **Module load**: `initGSAP()` registers ScrollTrigger. Multi-stage refresh.
2. **Component mount**: `gsap.context()` creates scoped timeline. ScrollTrigger creates trigger.
3. **Scroll**: ScrollTrigger fires → orchestrator `markVisible()` → plays section.
4. **Navigate**: Route exit → AnimatePresence fade out → component unmount → `ctx.revert()` kills tweens.
5. **Reduced motion toggle**: MediaQueryList event → `data-motion` attribute updates → CSS kills animations.

---

## Dos and Don'ts

### Do
- Wrap all GSAP animations in `gsap.context()` for cleanup
- Check `reducedMotion` before animating with GSAP — use `gsap.set()` as fallback
- Use CSS transitions for simple hover effects (color, opacity)
- Use Motion springs for interactive / gesture-based animations
- Use GSAP ScrollTrigger for scroll-driven reveals
- Apply `will-change` before animation, clear with `clearProps` when done

### Don't
- Use `!important` on CSS properties GSAP animates (opacity, transform)
- Animate `height` or `width` — prefer `transform: scaleY()` or `clip-path`
- Use `visibility: hidden` — use `opacity` + `pointer-events` or `AnimatePresence`
- Add animation without considering `prefers-reduced-motion`
- Mix Motion and GSAP on the same element
- Use `requestAnimationFrame` directly — GSAP ticker handles frame sync
- Animate layout-triggering properties (width, height, top, left, margin, padding)
