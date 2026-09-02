# QA & Testing Documentation

> Testing strategy, validation pipeline, and quality assurance for the Antonio Salvatore Calò portfolio.
> Owner: Testing

---

## Testing Stack

| Tool | Purpose |
|------|---------|
| Playwright | End-to-end browser testing |
| TypeScript (`tsc --noEmit`) | Static type checking |
| Vite build | Bundle validation |

---

## Commands

```bash
npm run build && npm run preview & npx playwright test
npm run lint       # tsc --noEmit — MUST pass before completing any stage
npm run build      # Production build validation
```

Playwright E2E tests run against the preview server after a production build.

---

## Validation Pipeline

```
lint (tsc --noEmit) → build (Vite) → preview → Playwright tests
```

Each stage must pass before the next proceeds.

---

## Test Status

| Layer | State | Verification |
|-------|-------|--------------|
| Core Architecture | Stable | Dual-pane, per-column Lenis verified |
| Motion System | Hardened | GSAP contexts isolated, single registration canonical |
| Typography System | Verified | Fluid scaling, reveal sequencing live |
| Effects System | Organized | Categorized, barrel exports, no duplicates |
| Test Suite | Verified | Playwright tests passing |
| Deployment Layer | Operational | Production deployment active on Vercel |

---

## Quality Gates

- **Lint:** `tsc --noEmit` must pass before any commit.
- **Build:** `npm run build` must complete without errors.
- **Tests:** All Playwright tests must pass before merge.
- **Bundle:** Must stay below 700KB target.

---

## Coverage Areas

- Route transitions and page navigation
- Scroll behavior across both columns
- Project carousel interaction (pointer + keyboard)
- Preloader and animation lifecycle
- Dark/light mode rendering
- Mobile-responsive behavior
- Accessibility — keyboard navigation, focus management, screen reader announcements

---

## Cross-References

- Product requirements define acceptance criteria → [`docs/product/`](../product/)
- Design system defines visual validation → [`docs/design/`](../design/)
- Engineering rules define implementation constraints → [`docs/engineering/rules.md`](../engineering/rules.md)
- See [AGENTS.md](../../AGENTS.md) for impact-check protocol before running tests
