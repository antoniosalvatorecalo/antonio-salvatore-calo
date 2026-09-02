# Project Rendering System

**Files**: `ProjectPage` → `ProjectBrutalistLayout` + `ProjectCard` + content components | **Owner**: Engineering

## Architecture

2 views: home carousel cards + detail pages. Both driven by same data registry.

```
projects.ts (typed array)
  ├── PortfolioLayout → ProjectCard × N (home carousel)
  └── ProjectPage → ProjectBrutalistLayout (detail)
        ├── ScrollingProjectText (left column)
        ├── LayoutSplitTextMediaStack × N (right column)
        └── ProjectMobileNav (mobile tabs)
```

## Data Registry

**File**: `src/content/projects.ts`

Strongly typed `Project[]` array. No CMS, no Markdown, no API. Static TypeScript data.

```typescript
interface Project {
  slug: string;
  client: string;
  title: string;
  category: string;
  year: number;
  thumbnail: string;
  heroImage?: string;
  media?: ProjectMedia[];
  deliverables?: string[];
}
```

Lookup: `getProjectBySlug(slug)` → project data. `getAdjacentProjects(slug)` → prev/next for navigation.

Asset paths follow convention: `/assets/images/{slug}/01.jpg`, `/assets/videos/{slug}.mp4`.

## ProjectCard (Home Carousel)

**File**: `src/components/projects/ProjectCard.tsx`

Renders in right column of PortfolioLayout. GSAP 3D entrance:

```
Initial: opacity:0, x:72, y:126, z:-280, rotateX:9°, rotateY:-6°, scale:0.88
Final:   opacity:1, x:0, y:0, z:0, rotateX:0, rotateY:0, scale:1
```

Stagger: 0.16s per card. Sub-elements (mask, image, matte, caption) have own timing. `.revealed` class + `willChange` cleared on complete.

**Scroll effect**: useScroll + useVelocity + useSpring → subtle skew/scale based on scroll velocity.

**Responsive**: Desktop = carousel (pointer drag). Tablet/mobile = vertical stack, tap to navigate.

## ProjectBrutalistLayout (Detail Page)

**File**: `src/layouts/ProjectBrutalistLayout.tsx`

### Desktop (≥1024px)

```
┌─ Left (20%) ─────────┬─ Right (80%) ──────────┐
│ Hero text             │ Lenis scroll container  │
│ ScrollingProjectText  │ LayoutSplitTextMedia    │
│ (synced to right      │ Stack × N              │
│  column scroll)       │ (images, text, CTAs)   │
│                       │                        │
│ Year: 2025            │                        │
│ Industry: Web         │                        │
│ Deliverables: [...]   │                        │
└───────────────────────┴────────────────────────┘
```

**ScrollerContext**: Provides right-column ref + Lenis to children. Mobile = null Lenis (native scroll).

### Mobile (<1024px)

Single column. Content rendered from `leftColumnSections` as vertical blocks via `ProjectSection`. Each section: image → title → description → CTA. Native scroll. Credits at end.

### Tab System

2 tabs derived from URL: `/projects/:slug` = project tab, `/projects/:slug/credits` = credits tab.

```typescript
const routeTab = location.pathname.endsWith('/credits') ? 'credits' : 'project';
```

Tab switch updates both `activeTab` state and URL via `navigate()`. Enables bookmark/share.

### Scroll Reveals (Right Column)

| Type | Selector | Animation |
|------|----------|-----------|
| Text split | `[data-split]` | blur(10)→0, y:40→0, stagger 0.03 |
| Fade blur | `[data-fade]` | blur(10)→0, y:15→0 |
| CTA | `[data-cta]` | y:20→0, delay 0.4 |
| Media stack | `.media-stack-item-0/1` | y:24, scale 0.985→1, stagger 0.08 |

All bound to right-column scroller, not window.

## ScrollingProjectText

Left-column text sections animate via ScrollTrigger tied to right column. Each section: `y:24→0`, `opacity:0→1`, staggered triggers.

## Lifecycle

1. **Navigate to project**: Route resolves `:slug` → lazy load ProjectPage → mount ProjectBrutalistLayout
2. **Desktop**: Init Lenis on right column. Create ScrollTriggers bound to right scroller
3. **Mobile**: Native scroll. No Lenis. ProjectMobileNav tracks active section
4. **Tab switch**: `navigate()` → re-derive `routeTab` → show/hide content sections
5. **Unmount**: `destroyLenis()` → kill scoped ScrollTriggers → revert GSAP contexts
6. **Navigate next/prev**: Route change → AnimatePresence transition → repeat

## Dependencies

- `react-router-dom` — slug param, navigate for tab/prev/next
- `ScrollerContext` — pass right-column ref to children
- `GSAP + ScrollTrigger` — scroll reveals, text sync
- `Lenis` — smooth scroll (desktop only)
- `useSwipeNavigation` — mobile project-to-project gesture

## Extension Points

- **New project type**: Add to `ProjectContentSection` union. Implement render component. Add case in layout switch
- **New media type**: Extend `ProjectMedia` union. Add render logic in `ProjectMediaGrid`
- **Custom section layout**: Add new section component. Register in `ProjectBrutalistLayout` section renderer
- **Project sorting**: Modify `projects` array order or add filter logic in `PortfolioLayout`
