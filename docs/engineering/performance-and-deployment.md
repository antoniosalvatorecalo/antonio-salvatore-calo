# Performance & Deployment

> Bundle splitting, GPU acceleration, build optimization, deployment configuration, and monitoring.
> Owner: Engineering

---

## 1. Bundle Splitting

**File:** `vite.config.ts`

### Manual Chunks

```typescript
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-motion': ['motion'],
  'vendor-gsap': ['gsap', 'gsap/ScrollTrigger'],
  'vendor-lenis': ['lenis'],
}
```

This produces four vendor chunks plus the main application bundle:

| Chunk | Size (gzip approx) | Contents |
|-------|--------------------|----------|
| `vendor-react` | 38 kB | React 19, react-dom, react-router-dom |
| `vendor-motion` | 16 kB | Motion library |
| `vendor-gsap` | 32 kB | GSAP 3 + ScrollTrigger plugin |
| `vendor-lenis` | 8 kB | Lenis smooth scroll |
| `main` | varies | App code, components, layouts, content |

### Lazy Loading

All project pages are lazy-loaded:

```typescript
const ProjectPage = React.lazy(() => import('@/pages/ProjectPage'));
```

This ensures the ProjectPage code (layouts, media grid, content sections) is only loaded when the user navigates to `/projects/:slug`.

### Dynamic Import Structure

```
Entry (main.tsx) → ~30 kB initial
├── vendor-react     → loaded immediately
├── vendor-motion    → loaded immediately (AnimatePresence on route wrapper)
├── vendor-gsap      → deferred until useSmoothScroll module loads
├── vendor-lenis     → deferred until useSmoothScroll module loads
└── ProjectPage      → deferred until /projects/:slug route
```

---

## 2. CSS Loading Gate

```css
html.loading {
  opacity: 0;
}
html.ready {
  opacity: 1;
  transition: opacity 0.2s ease;
}
```

- `<html>` starts with class `loading` (opacity: 0)
- Swapped to `ready` on window `load` event
- Prevents flash of unstyled content
- Has minimal CLS impact (0.2s opacity transition)

---

## 3. GPU Acceleration

### Animation Property Rules

All animations are constrained to these GPU-composited properties:

| Property | GPU Benefit | Used For |
|----------|------------|----------|
| `transform` | Composition layer | Position, scale, rotation, skew |
| `opacity` | No layout/paint | Fade transitions |
| `filter` | GPU accelerated in Chrome/WebKit | Blur reveals |

**Never animate**: `width`, `height`, `top`, `left`, `margin`, `padding` — these trigger layout recalculations.

### will-change Strategy

```css
/* Added via GSAP on animation start, cleared on complete */
will-change: transform, opacity;
```

Applied temporarily during animation, removed when complete via:

```typescript
gsap.set(element, { clearProps: 'willChange' });
```

This prevents memory bloat from permanent `will-change` on hundreds of elements.

### Hardware Acceleration Triggers

```css
.project-card-wrapper {
  transform: translateZ(0);     /* Hardware composite layer */
  backface-visibility: hidden;  /* Prevents flicker */
}
```

---

## 4. Scroll Performance

### ScrollTrigger Throttling

- Lenis runs via GSAP ticker (shared RAF loop) — prevents multiple tickers competing
- `ScrollTrigger.update()` called on Lenis scroll, not every frame
- `invalidateOnRefresh: true` on ScrollTriggers prevents stale measurements

### Passive Event Listeners

```typescript
// Lenis defaults to passive events
wrapper.addEventListener('wheel', handler, { passive: true });
```

### Layout Thrashing Prevention

- Batch DOM reads and writes separately
- Avoid forced synchronous layouts (no reading offsetHeight after writing style changes)
- ScrollTrigger refresh deferred to RAF to batch recalculation

---

## 5. Build Output

### Production Build

```bash
npm run build
```

Output to `dist/`:

```
dist/
  index.html
  assets/
    index-xxxx.js            (~30 kB main)
    vendor-react-xxxx.js     (~80 kB)
    vendor-motion-xxxx.js    (~40 kB)
    vendor-gsap-xxxx.js      (~80 kB)
    vendor-lenis-xxxx.js     (~20 kB)
    ProjectPage-xxxx.js      (~15 kB, async)
```

All vendor chunks are long-lived (fingerprinted with content hash). `vendor-react` rarely changes.

### Build Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run build` | `vite build` | Production build (~3-12s) |
| `npm run preview` | `vite preview` | Serve `dist/` locally |
| `npm run lint` | `tsc --noEmit` | Type check without emitting |
| `npm run dev` | `vite --port 3000` | Dev server |
| `npm run clean` | `rimraf dist` | Clean build output |

---

## 6. Deployment

### Platform: Vercel

**File:** `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';" }
      ]
    }
  ]
}
```

### Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |
| `Content-Security-Policy` | See above | XSS mitigation |
| `Cache-Control` | 1 year (assets) | Immutable asset caching |

### Asset Caching

- **Static assets** (`/assets/`): 1 year, immutable
- **HTML** (`index.html`): no-cache (ensures users get latest JS/CSS)

### SPA Routing

The catch-all rewrite `/(.*)` → `/` ensures all routes (including `/projects/:slug`) serve `index.html`, allowing the client-side router to handle them. This is standard for SPAs deployed on Vercel.

---

## 7. Performance Monitoring

### Bundle Analysis

```bash
npx vite-bundle-visualizer
```

Opens a treemap of chunk sizes. Run before major releases to check for regressions.

### Core Web Vitals Targets

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | < 2.5s | Hero image + text visible |
| FID/INP | < 200ms | Minimal JS on main thread |
| CLS | < 0.1 | Loading gate + stable layout |

### Production Build Size Tracking

The application typically builds in 3-12 seconds. Total JS bundle size is approximately 150-170 kB gzipped across all chunks.

---

## 8. Cross-References

- [Architecture overview](architecture.md) — Entrypoint chain, lazy loading strategy
- [Animation system](animation-system.md) — Performance considerations, will-change strategy
- [Scrolling system](scrolling-system.md) — ScrollTrigger throttling, Lenis perf
- [Responsive system](responsive-system.md) — Mobile performance considerations
