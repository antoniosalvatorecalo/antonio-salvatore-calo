# Projects Interaction Redesign - Implementation Plan

## Current Architecture Summary

| Aspect | Current State |
|--------|--------------|
| **Framework** | React 19 + TypeScript + Vite |
| **Routing** | React Router DOM v7 - explicit routes for `/projects/bugonia` and `/projects/newsquest` |
| **Styling** | Tailwind CSS v4 + CSS Modules |
| **Animation** | Motion (primary) v12, GSAP + ScrollTrigger, Lenis smooth scroll |
| **Motion Prefs** | `MotionPreferenceProvider.tsx` + `useReducedMotionPreference()` hook |
| **Project Data** | `bugoniaDetail.ts` / `newsquestDetail.ts` with full metadata + sections |
| **Header** | `SiteHeader.tsx` - already detects project pages via `isProjectPage` |
| **Home** | `PortfolioLayout` → `ProjectIndex` → `ProjectGrid` (gallery grid of images) |
| **Project Pages** | `ProjectBrutalistLayout` - sophisticated 2-column layout with scroll animations |
| **Easings Available** | `EASE_PREMIUM: [0.16, 1, 0.3, 1]`, `EASE_CINEMATIC: [0.85, 0, 0.15, 1]` |

**Projects to feature:**
- **Bugonia**: Title "Bugonia", category "Web Design", year "2025", `/projects/bugonia`
- **NewsQuest**: Title "Newsquest", category "UI/UX Design", year "2025", `/projects/newsquest`

---

## Critical Discovery: Data Structure

The `projectsRegistry` contains 12 duplicate entries (bugonia × 6, newsquest × 6) because the current `GalleryGrid` flattens each project's images. The **real project data** lives in:
- `src/content/projectDetails/bugoniaDetail.ts` - hero content, metadata, sections, media URLs
- `src/content/projectDetails/newsquestDetail.ts` - same structure

The new carousel should use these two projects with their cover images from `media.thumb`.

---

## Implementation Plan

### Phase 1: Create Project Data Hook

**File:** `src/hooks/useProjects.ts`

```typescript
// Returns unique projects (Bugonia, NewsQuest) with structured data
interface Project {
  id: string;           // 'bugonia' | 'newsquest'
  slug: string;         // 'bugonia' | 'newsquest'
  title: string;        // 'Bugonia' | 'Newsquest'
  category: string;     // 'Web Design' | 'UI/UX Design'
  year: string;         // '2025'
  coverImage: string;   // /media/bugonia/Thumbnail.webp
  images: string[];     // All 6 images
  detail: ProjectDetailContent; // Full detail from bugoniaDetail/newsquestDetail
}
```

**Purpose:** Single source of truth for project data. Deduplicates the 12-entry registry into 2 unique projects.

---

### Phase 2: Create Project Carousel Component

**File:** `src/components/projects/ProjectCarousel.tsx`
**CSS:** `src/components/projects/ProjectCarousel.css`

**Structure:**
- Replaces `GalleryGrid` inside `ProjectIndex`
- Vertical list layout (not horizontal - editorial typography-focused)
- Each row: index (01, 02), title, category, year
- No cards, no borders, no shadows - pure typography
- Click navigates to `/projects/{slug}`

**Interaction:**
- `onMouseEnter`: Set active project for preview
- `onMouseLeave`: Clear active project
- `onClick`: Navigate to project page
- Mobile: `onTouchStart` sets active, second tap navigates

---

### Phase 3: Create Hover Preview Component

**File:** `src/components/projects/ProjectPreview.tsx`
**CSS:** `src/components/projects/ProjectPreview.css`

**Behavior:**
```
mouse enters project row
    ↓
activeProject state updates
    ↓
preview image fades in (opacity 0→1, scale 0.95→1)
    ↓
mouse leaves project row
    ↓
preview fades out (opacity 1→0)
```

**Implementation:**
- Single shared `<div>` positioned `fixed` center-viewport
- `pointer-events: none` - doesn't block interaction
- `z-index: 200` - above everything
- Uses `transform-origin: center`
- CSS transition with `cubic-bezier(0.22, 1, 0.36, 1)`
- `will-change: transform, opacity` for GPU acceleration

**Image Crossfade (when switching projects):**
```
previous image: opacity 1→0, scale 1→0.96, translate 0→-20px
new image: opacity 0→1, scale 0.96→1, translate 20px→0
```

---

### Phase 4: Create 3D Project Transition

**File:** `src/components/projects/ProjectTransition.tsx`

**Concept:** When clicking a project, the cover image "becomes" the project page.

**Implementation using Motion:**
```tsx
// Container with perspective
<div style={{ perspective: '1200px' }}>

  {/* Project list with rows */}
  <AnimatePresence>
    {/* When project selected, animate OUT */}
    <motion.div
      exit={{
        opacity: 0,
        scale: 0.9,
        y: -50,
        filter: 'blur(10px)',
        transition: { duration: 0.4, ease: EASE_PREMIUM }
      }}
    />
  </AnimatePresence>

  {/* Selected project image flies to center */}
  <motion.div
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{
      scale: [0.5, 1.5, 2],  // grows as if becoming the page
      opacity: [0, 1, 1],
      rotateX: [0, 5, 0],      // subtle 3D rotation
      transition: { duration: 0.6, ease: EASE_CINEMATIC }
    }}
  />
</div>
```

**Alternative (simpler):** Use CSS transforms + `AnimatePresence` from Motion.

---

### Phase 5: Integrate into ProjectIndex

**Modify:** `src/components/home/ProjectIndex.tsx`

**Changes:**
1. Import `ProjectCarousel`, `ProjectPreview`, `useProjects`
2. Add `activeProject` state
3. Pass `onProjectHover` callback to `ProjectCarousel`
4. Render `<ProjectPreview project={activeProject} />`

**Structure:**
```tsx
export const ProjectIndex: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { projects } = useProjects();

  return (
    <section id="visual-index" className="project-index">
      <ProjectCarousel
        projects={projects}
        onProjectHover={setActiveProject}
      />
      <ProjectPreview project={activeProject} />
    </section>
  );
};
```

---

### Phase 6: Update Project Detail Page Gallery

**File:** `src/components/projects/ProjectDetailGallery.tsx`
**CSS:** `src/components/projects/ProjectDetailGallery.css`

**Features:**
- Large image display (uses `media.thumb` as primary)
- Prev/Next navigation buttons (← →)
- Image counter (01 / 06)
- Keyboard navigation (← → arrow keys)
- Touch/swipe support
- Thumbnail strip below main image (optional)

**Integration:** Replaces current inline image display in `ProjectBrutalistLayout` right column with a proper carousel.

---

### Phase 7: Header Variant (if needed)

**Inspect:** `src/components/ui/SiteHeader.tsx`

**Current behavior:** Already detects `/projects/*` routes and shows "← Home" back button + clock instead of bio.

**If enhancement needed:**
- Add `variant` prop: `default` | `minimal`
- On project pages: Show project title alongside back button
- Reuse existing typography/spacing

**Note:** The current header already provides the project-page state. Verify it works correctly with the new carousel before modifying.

---

### Phase 8: Routing Verification

**File:** `src/providers/AppRouter.tsx`

**Current routes:**
```
/ → PortfolioLayout (App)
/projects/bugonia → BugoniaPage
/projects/newsquest → NewsquestPage
/contact → ContactPage
```

**No changes needed** - explicit routes already exist for both projects. The new carousel navigates to these existing routes.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useProjects.ts` | Project data hook (deduplicates bugonia, newsquest) |
| `src/components/projects/ProjectCarousel.tsx` | Editorial typography-based project list |
| `src/components/projects/ProjectCarousel.css` | Carousel styles |
| `src/components/projects/ProjectPreview.tsx` | Hover preview component |
| `src/components/projects/ProjectPreview.css` | Preview styles |
| `src/components/projects/ProjectDetailGallery.tsx` | Image gallery/carousel for detail pages |
| `src/components/projects/ProjectDetailGallery.css` | Gallery styles |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/ProjectIndex.tsx` | Replace GalleryGrid with ProjectCarousel + ProjectPreview |
| `src/components/home/ProjectIndex.css` | May need style updates |
| `src/index.css` | Add `.project-preview` and transition CSS variables |

## Files NOT to Modify (Preserve Existing)

- `PortfolioLayout.tsx` - Home page structure intact
- `SiteHeader.tsx` - Header already handles project detection
- `AppRouter.tsx` - Routes already exist
- `ProjectBrutalistLayout.tsx` - Project detail layout sophisticated, keep as-is
- `pages/projects/bugonia/ProjectPage.tsx` - Uses existing detail data
- `pages/projects/newsquest/ProjectPage.tsx` - Uses existing detail data
- `content/projectDetails/*.ts` - Project data intact

---

## Animation Specifications

**Hover Preview Fade:**
```css
.project-preview {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
  will-change: transform, opacity;
}
.project-preview.is-visible {
  opacity: 1;
  transform: scale(1);
}
```

**Image Crossfade (between project hovers):**
```css
.project-preview-image {
  transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.project-preview-image.entering {
  opacity: 0;
  transform: translateX(20px) scale(0.96);
}
.project-preview-image.visible {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.project-preview-image.exiting {
  opacity: 0;
  transform: translateX(-20px) scale(0.96);
}
```

**3D Transition (project click → page):**
```css
perspective: 1200px;
transform: translate3d(0, 0, 0) scale(1) rotateX(2deg);
transition: all 0.6s cubic-bezier(0.85, 0, 0.15, 1);
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .project-preview,
  .project-preview-image {
    transition: opacity 0.2s ease;
    transform: none !important;
  }
}
```

---

## Mobile Behavior

**Tap interaction:**
```
tap project
    ↓
project becomes active (shows preview)
    ↓
tap again (or dedicated "Open" area)
    ↓
navigate to project page
```

**Implementation:**
- Use `onTouchStart` to set active project (with 300ms delay to distinguish from scroll)
- Store `lastTapTime` to detect double-tap for navigation
- Or: Show "tap to open" hint after first tap

---

## Validation Checklist

- [ ] Home page renders without visual changes
- [ ] Project list shows Bugonia and NewsQuest (not 12 image grid)
- [ ] Hovering project shows large preview image centered on screen
- [ ] Moving between projects produces smooth image crossfade
- [ ] Clicking project produces spatial transition effect
- [ ] `/projects/bugonia` loads correctly
- [ ] `/projects/newsquest` loads correctly
- [ ] Gallery has prev/next, keyboard, touch support
- [ ] Back button returns to home
- [ ] Prev/next project navigation works
- [ ] `prefers-reduced-motion` uses simple fades only
- [ ] No console errors

---

## Animation Library

**Using existing:** `motion/react` (Motion v12)

Already in use throughout the codebase:
- `motion` import from `motion/react`
- `AnimatePresence` for mount/unmount transitions
- `motion.div`, `motion.img` for animated elements
- Custom easings from `@/motion/constants`

No new dependencies needed.
