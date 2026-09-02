# Development Workflow

> Git, commits, PRs, deployment, quality gates.
> Owner: Engineering

---

## Git Workflow

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready. Auto-deploys to Vercel. |
| `feature/*` | New features. Branch from `main`, PR back to `main`. |
| `fix/*` | Bug fixes. Branch from `main`, PR back to `main`. |

Rules:

- No direct pushes to `main`
- Everything goes through a pull request
- Squash merge preferred — keeps history clean
- Delete branch after merge

### Before You Branch

1. Pull latest `main`: `git checkout main && git pull`
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make small, focused commits (see commit conventions below)

---

## Commit Conventions

### Format

```
<type>: <short description>

<optional body — why, not what>
```

`type` must be one of:

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `perf` | Performance improvement |
| `style` | CSS/styling only (not logic) |
| `docs` | Documentation only |
| `chore` | Tooling, deps, config |
| `test` | Tests only |

### Rules

- **Short description**: lowercase, no period, imperative mood ("add", "fix", not "added", "fixed")
- **Body**: explain **why** (the context/decision), not **what** (the code shows that)
- **Scope**: use after type if helpful: `feat(carousel):` or `fix(scroll):`
- **48/72 rule**: subject <= 48 chars, body lines <= 72 chars
- One commit = one logical change. No "fix typo" or "wip" commits.

### Examples

```
feat: add magnetic hover to project cards

Button follows cursor within 12px radius using transform interpolation.
Spring easing keeps feel responsive without overshoot.
```

```
fix(scroll): prevent column scroll desync on tab switch

Lenis instances now refresh on tab change via ScrollProvider refs.
Race condition between setActiveTab and Lenis.stop was causing
left column to freeze when returning from a project page.
```

```
refactor: extract scrolling text into standalone component

ScrollingProjectText was inlined in three places with duplicate
GSAP context setup. Single component with forwardRef +
data-scroll-text attribute now handles all instances.
```

---

## Pull Request Workflow

### Before Opening a PR

1. `git pull origin main` — rebase onto latest main
2. `npm run lint` — must pass
3. `npm run build` — must pass
4. `npm run build && npm run preview & npx playwright test` — must pass
5. Review your own diff: `git diff main...HEAD`

### PR Template

```markdown
## What

[1-2 sentences describing the change]

## Why

[Context — what problem this solves]

## Testing

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Playwright tests pass
- [ ] Tested keyboard navigation
- [ ] Tested at 200% zoom
- [ ] Tested dark/light mode

## Screenshots

[If visual change]

## Impact Check

- [ ] Read target files fully
- [ ] Traced affected components
- [ ] Checked scroll, animation, or routing impact
```

### After Opening

- Link any related issues
- Add reviewer(s)
- Respond to all feedback
- Rebase if conflicts arise

### Merge

- Squash merge into `main`
- Write a clean squash commit message summarizing the whole feature
- Delete branch

---

## Quality Gates

Pipeline enforced before every merge:

```
1. npm run lint      → tsc --noEmit (MUST pass)
2. npm run build     → Vite production build (MUST pass)
3. npm run preview   → serve production build
4. npx playwright test → E2E tests (MUST pass)
5. Code review       → at least one approval
```

### Quality Checklist

- [ ] TypeScript strict — no `any`, no `@ts-ignore`
- [ ] Bundle size — check for regressions (`npx vite-bundle-visualizer`)
- [ ] No `console.log` / debugger statements
- [ ] Keyboard accessible — Tab through the whole feature
- [ ] Screen reader — basic labels and roles present
- [ ] Responsive — works on mobile (<768px), tablet (768-1024px), desktop (>=1024px)
- [ ] Dark/light mode — both themes render correctly
- [ ] Reduced motion — `prefers-reduced-motion: reduce` respected

### Known Debt Monitoring

| Item | Threshold | Check |
|------|-----------|-------|
| Bundle size | <700KB total | `npm run build` output |
| XSS risk | Zero `innerHTML` | grep `innerHTML` in src/ |
| GSAP registration | Single `registerPlugin` call | grep `registerPlugin` in src/ |

---

## Deployment

### Production

Automatic. Push to `main` → Vercel deploys.

**Config**: `vercel.json` — rewrites, security headers, CSP.

**URL**: Production URL from Vercel project dashboard.

### Preview Deployments

Vercel creates preview deployments for every PR branch. URL posted as PR comment.

### Manual Deploy

```bash
npm run build
npx vercel --prod
```

(Only if auto-deploy fails. Don't bypass CI.)

---

## Tools & Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run preview` | Serve production build |
| `npm run lint` | TypeScript type check |
| `npm run clean` | Remove dist/ |
| `npx playwright test` | Run E2E tests |
| `npx vite-bundle-visualizer` | Analyze bundle size |
| `npx playwright codegen` | Record test scenarios |

---

## Cross-References

- [QA & Testing](../qa/README.md) — Validation pipeline details
- [Performance & Deployment](../engineering/performance-and-deployment.md) — Bundle, caching, Vercel config
- [Engineering Rules](../engineering/rules.md) — Critical app invariants
