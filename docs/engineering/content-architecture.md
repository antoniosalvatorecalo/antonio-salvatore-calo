# Content Architecture

> Project registry, detail data, media management, and authoring workflow.
> Owner: Engineering

---

## 1. Overview

All site content lives as TypeScript data — there is no CMS, no markdown files, no JSON imports. Each project is a strongly typed object in a registry array. This gives us type safety, compile-time validation, and zero runtime data fetching.

---

## 2. Project Registry

**File:** `src/content/projects.ts`

### Data Shape

```typescript
interface Project {
  slug: string;                         // URL-safe identifier
  client: string;                       // Client name
  title: string;                        // Project display title
  category: string;                     // Project category (e.g., "Visual Identity", "Web Design")
  year: number;                         // Completion year
  thumbnail: string;                    // Thumbnail image path
  media?: ProjectMedia[];               // Detail page media items
  heroImage?: string;                   // Detail page hero image
  deliverables?: string[];              // Service tags
}
```

### Registry Pattern

```typescript
export const projects: Project[] = [
  {
    slug: 'foo-bar',
    client: 'Foo Bar',
    title: 'Brand Identity System',
    category: 'Visual Identity',
    year: 2025,
    thumbnail: '/assets/images/thumbnails/foo-bar.jpg',
    heroImage: '/assets/images/heroes/foo-bar-hero.jpg',
    deliverables: ['Brand Strategy', 'Visual Identity', 'Guidelines'],
    media: [
      { type: 'image', src: '/assets/images/foo-bar/01.jpg', caption: '...' },
      { type: 'video', src: '/assets/videos/foo-bar.mp4', caption: '...' },
    ],
  },
  // ... more projects
];
```

### Lookup Functions

```typescript
function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const idx = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[idx - 1],
    next: projects[idx + 1],
  };
}
```

These are used in `ProjectBrutalistLayout` to:
1. Load project data based on `:slug` route param
2. Render prev/next navigation at the bottom of project pages

### Type Safety

Because projects is a typed array and slug is constrained to match `keyof Project`, TypeScript catches:
- Missing required fields at build time
- Invalid media types
- Wrong image paths

---

## 3. Project Pages

### Route Structure

```
/projects/:slug
```

Each `:slug` routes to `ProjectPage` via `AppRouter`:

```typescript
<Route path="/projects/:slug" element={<ProjectPage />} />
```

`ProjectPage` is lazy-loaded with `React.lazy()`.

### Page Layout

Project pages use `ProjectBrutalistLayout`, which renders:

```
┌──────────────────────────────────────────┐
│        Loading state (skeleton)          │
├─────────────┬────────────────────────────┤
│  Left Column│  Right Column              │
│  (metadata) │  (media + content)         │
│             │                            │
│  - Client   │  - Hero image              │
│  - Year     │  - Section 1: Overview     │
│  - Role     │  - Section 2: Process      │
│  - Services │  - Section 3: Design       │
│  - Links    │  - Section 4: Development  │
│             │  - Section 5: Results      │
│             │  - Next Project CTA        │
└─────────────┴────────────────────────────┘
```

### Content Sections

Each project's sections are defined in the data:

```typescript
interface ProjectContentSection {
  id: string;           // Section identifier
  type: 'text' | 'media' | 'split' | 'full-image' | 'stats';
  title?: string;
  description?: string;
  media?: ProjectMedia[];
  stats?: { label: string; value: string }[];
}
```

Sections are rendered via a switch/case pattern in `ProjectBrutalistLayout`:

| Section Type | Component | Description |
|-------------|-----------|-------------|
| `text` | `ProjectSectionText` | Full-width text block with optional title |
| `media` | `ProjectMediaGrid` | Image/video grid with captions |
| `split` | `LayoutSplitTextMediaStack` | Split layout: text left, media right |
| `full-image` | `FullWidthImage` | Full-bleed image with optional caption |
| `stats` | `ProjectStatsGrid` | Metrics grid (e.g., "10M+ impressions") |

---

## 4. Media Management

### Media Types

```typescript
type ProjectMedia = ProjectImage | ProjectVideo;

interface ProjectImage {
  type: 'image';
  src: string;           // Image path
  alt: string;           // Alt text for accessibility
  caption?: string;      // Optional editorial caption
}

interface ProjectVideo {
  type: 'video';
  src: string;           // Video path
  poster?: string;       // Poster frame
  caption?: string;      // Optional editorial caption
}
```

### Asset Path Convention

```
/assets/
  images/
    thumbnails/{slug}.jpg
    heroes/{slug}-hero.jpg
    {slug}/
      01.jpg
      02.jpg
      ...
  videos/
    {slug}.mp4
```

### Lazy Loading

Images use native lazy loading:

```typescript
<img
  src={media.src}
  alt={media.alt}
  loading="lazy"
  decoding="async"
/>
```

Critical images (hero on detail pages) use `fetchpriority="high"`.

---

## 5. Authoring Workflow

Adding a new project requires:

1. **Add images** to `/assets/images/{slug}/`
2. **Add data** to `src/content/projects.ts`:
   ```typescript
   {
     slug: 'new-project',
     client: 'New Client',
     title: 'Title',
     category: 'Category',
     year: 2025,
     thumbnail: '/assets/images/thumbnails/new-project.jpg',
     heroImage: '/assets/images/heroes/new-project-hero.jpg',
     deliverables: ['Deliverable 1', 'Deliverable 2'],
     media: [...],
   }
   ```
3. **Build + verify**: `npm run build && npm run preview`

No database migrations, no CMS login, no API endpoints. The bundle statically includes all data.

---

## 6. Content for Home Page

### Left Column Sections

The home page left column has 5 sections defined in `PortfolioLayout`:

| Section | Data | Source |
|---------|------|--------|
| Hero | Title, subtitle, CTA | Hardcoded in component |
| Bio | About text, stats | Hardcoded in component |
| Principles | Design principles list | Component content |
| Services | Service offering cards | Component content |
| Contact | ContactBuilder form | Interactive component |

### Right Column

Renders project cards from the `projects` array, filtered/shown in registry order. The carousel wraps at the end (infinite loop).

---

## 7. Cross-References

- [Architecture overview](architecture.md) — Routing, data flow
- [Routing and pages](routing-and-pages.md) — Lazy loading, slug parameter handling
- [Layouts](layouts.md) — ProjectBrutalistLayout content sections
- [Animation system](animation-system.md) — Content entrance reveals
