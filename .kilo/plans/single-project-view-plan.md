# Single Project View - Technical Implementation Plan

## 1. Concept Overview

### Transition Flow
```
[Grid View] ──click──> [Transition Animation] ──> [Single Project View]
                                   │
                    ┌──────────────┼──────────────┐
                    ↓              ↓              ↓
               Menu stays    Grid exits      Carousel enters
               (stable)     (down-right)    (from right)
```

---

## 2. Component Hierarchy

```
src/components/projects/
├── SingleProjectView.tsx        # Main container
├── SingleProjectView.css
├── ProjectCarousel.tsx          # Drag-to-scroll carousel
├── ProjectCarousel.css
├── ProjectAbout.tsx             # About section with + toggle
├── ProjectAbout.css
└── TransitionOverlay.tsx        # Animation orchestrator
    └── TransitionOverlay.css
```

---

## 3. Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]                              [Theme] [Lang] │  ← Top Right (persistent)
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐                                        │
│  │ About Bugonia│  [+]                                  │  ← Top Left (About)
│  │ ─────────── │                                       │
│  │ Description │                                       │
│  │ Links ● ● ● │                                       │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              IMAGE CAROUSEL                     │   │  ← Main Content
│  │         (drag to scroll horizontal)             │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Transition Animation Logic

### Phase Sequence

| Phase | Duration | Element | Animation |
|-------|----------|---------|-----------|
| 0 | 0ms | Menu | `position: fixed`, stays stable |
| 1 | 0-400ms | Grid | `translateY(100vh) translateX(100vw)`, opacity 1→0 |
| 2 | 200-800ms | Carousel | `translateX(100%) → translateX(0)`, opacity 0→1 |
| 3 | 400-800ms | About | `opacity: 0 → 1` (fade in) |

### CSS Animation Keyframes

```css
/* Grid Exit Animation */
@keyframes grid-exit {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(50vw);
    opacity: 0;
  }
}

/* Carousel Enter Animation */
@keyframes carousel-enter {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* About Section Fade In */
@keyframes about-enter {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### GSAP Implementation

```typescript
// TransitionOverlay.tsx
import { gsap } from '@/lib/gsap-setup';

interface TransitionState {
  gridRef: React.RefObject<HTMLDivElement>;
  carouselRef: React.RefObject<HTMLDivElement>;
  onComplete: () => void;
}

export function playTransition(state: TransitionState) {
  const { gridRef, carouselRef, onComplete } = state;
  const tl = gsap.timeline();

  // Phase 1: Grid exits down-right
  tl.to(gridRef.current, {
    y: '100vh',
    x: '50vw',
    opacity: 0,
    duration: 0.5,
    ease: 'power3.inOut',
  }, 0);

  // Phase 2: Carousel enters from right
  tl.fromTo(carouselRef.current,
    { x: '100%', opacity: 0 },
    { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out' },
    0.2
  );

  // Phase 3: About section fades in
  tl.fromTo('.project-about',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
    0.4
  );

  tl.call(onComplete);
}
```

### Menu Stability (Rubik's Cube Effect)

The menu remains `position: fixed` and is NOT part of the animated timeline. It stays at `z-index: var(--z-nav)` while everything else animates beneath it.

```css
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200; /* High z-index to stay above transition */
}
```

---

## 5. Carousel Component

### Drag-to-Scroll Implementation

```typescript
// ProjectCarousel.tsx
import { useRef, useState, useEffect } from 'react';

interface CarouselProps {
  images: string[];
}

export function ProjectCarousel({ images }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      className="carousel-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {images.map((src, i) => (
        <div key={i} className="carousel-item">
          <img src={src} alt="" draggable={false} />
        </div>
      ))}
    </div>
  );
}
```

### CSS

```css
.carousel-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  user-select: none;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.carousel-container:active {
  cursor: grabbing;
}

.carousel-item {
  flex-shrink: 0;
  scroll-snap-align: start;
  width: 80vw;
  max-width: 800px;
  aspect-ratio: 16/10;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
```

---

## 6. About Section Component

```typescript
// ProjectAbout.tsx
interface ProjectAboutProps {
  projectName: string;
  description: string;
  links: { label: string; href: string }[];
}

export function ProjectAbout({ projectName, description, links }: ProjectAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="project-about">
      <button
        className="project-about-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="project-about-title">{projectName}</span>
        <span className="project-about-icon">{isExpanded ? '−' : '+'}</span>
      </button>

      <div className={`project-about-content ${isExpanded ? 'is-expanded' : ''}`}>
        <p className="project-about-description">{description}</p>
        <ul className="project-about-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### CSS

```css
.project-about {
  position: absolute;
  top: 120px;
  left: 24px;
  max-width: 320px;
}

.project-about-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 1px solid var(--border-default);
  padding: 8px 16px;
  cursor: pointer;
  font-family: inherit;
}

.project-about-title {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.project-about-icon {
  font-size: 18px;
  line-height: 1;
}

.project-about-content {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
}

.project-about-content.is-expanded {
  max-height: 200px;
  opacity: 1;
  padding-top: 16px;
}

.project-about-description {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.project-about-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-about-links a {
  font-size: 12px;
  color: var(--text-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

---

## 7. Single Project View Container

```typescript
// SingleProjectView.tsx
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from '@/lib/gsap-setup';
import { ProjectCarousel } from './ProjectCarousel';
import { ProjectAbout } from './ProjectAbout';
import './SingleProjectView.css';

interface SingleProjectViewProps {
  project: {
    slug: string;
    title: string;
    description: string;
    images: string[];
    links: { label: string; href: string }[];
  };
  onBack: () => void;
}

export function SingleProjectView({ project, onBack }: SingleProjectViewProps) {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    // Play reverse animation
    const tl = gsap.timeline();
    
    tl.to(carouselRef.current, {
      x: '100%',
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
    });

    tl.call(() => {
      onBack();
      navigate('/');
    });
  };

  return (
    <div className="single-project-view">
      <header className="single-project-header">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
        <div className="header-controls">
          {/* Theme/Lang controls */}
        </div>
      </header>

      <ProjectAbout
        projectName={project.title}
        description={project.description}
        links={project.links}
      />

      <div ref={carouselRef} className="single-project-carousel">
        <ProjectCarousel images={project.images} />
      </div>
    </div>
  );
}
```

---

## 8. Animation Constants

```typescript
// src/motion/constants/transitions.ts
export const TRANSITION_DURATION = {
  GRID_EXIT: 0.5,
  CAROUSEL_ENTER: 0.6,
  ABOUT_FADE: 0.4,
};

export const TRANSITION_EASE = {
  GRID_EXIT: 'power3.inOut',
  CAROUSEL_ENTER: 'power3.out',
  CAROUSEL_EXIT: 'power3.in',
};
```

---

## 9. Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .grid-exit,
  .carousel-enter,
  .about-enter {
    animation: none !important;
    transition: none !important;
  }

  .single-project-view {
    opacity: 1;
    transform: none;
  }
}

html[data-motion="reduced"] {
  .grid-exit,
  .carousel-enter,
  .about-enter {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 10. Files to Create

| File | Purpose |
|------|---------|
| `src/components/projects/SingleProjectView.tsx` | Main container |
| `src/components/projects/SingleProjectView.css` | Container styles |
| `src/components/projects/ProjectCarousel.tsx` | Drag-scroll carousel |
| `src/components/projects/ProjectCarousel.css` | Carousel styles |
| `src/components/projects/ProjectAbout.tsx` | Expandable about section |
| `src/components/projects/ProjectAbout.css` | About section styles |
| `src/motion/constants/transitions.ts` | Animation constants |

## 11. Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/ProjectIndex.tsx` | Add transition trigger on click |
| `src/components/home/ProjectIndex.css` | Add grid-exit animation class |
| `src/components/ui/SiteHeader.tsx` | Ensure z-index is high enough |

---

## 12. Validation Checklist

- [ ] Grid animates down-right on project click
- [ ] Carousel slides in from right
- [ ] Menu remains visible and stable
- [ ] Drag-to-scroll works on carousel
- [ ] About section expands/collapses
- [ ] Back button reverses animation
- [ ] Reduced motion: instant transitions
- [ ] Mobile: touch-friendly drag
