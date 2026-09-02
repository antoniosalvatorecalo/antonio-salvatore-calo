# Contributing to Antonio Salvatore Calò — Portfolio

> Guide for developers contributing to the Antonio Salvatore Calò portfolio.
> Owner: Engineering

---

## First Time?

Read the [Onboarding Guide](docs/onboarding/README.md) — covers setup, coding standards, naming conventions, commit rules, PR workflow, deployment, and quality checks in depth.

---

## Quick Reference

```bash
npm run dev         # Dev server on :3000
npm run build       # Production build
npm run lint        # tsc --noEmit — MUST pass before any commit
npm run preview     # Preview production build
npm run clean       # Remove dist/
```

E2E tests:

```bash
npm run build && npm run preview & npx playwright test
```

---

## 6 Critical Rules

Violating these breaks the app:

1. **Hooks**: Never call `useTransform`/`useScroll`/`useSpring` conditionally — top-level only
2. **GSAP**: Never `!important` on opacity, transform, etc. — GSAP cannot override it
3. **Lenis**: No global Lenis — `useSmoothScroll` per-column only
4. **Carousel**: No `motion.div drag="x"` — pointer events + GSAP tweens only
5. **Router**: No `createBrowserRouter` — `BrowserRouter` + `AnimatePresence` only
6. **Visibility**: No `visibility:hidden` — let `AnimatePresence` handle transitions

See [Engineering Rules](docs/engineering/rules.md) for full details.

---

## How to Contribute

### 1. Branch

```bash
git checkout main && git pull
git checkout -b feature/your-feature
```

### 2. Commit

```
<type>: <short description (imperative, lowercase, no period)>

<optional body explaining why>
```

Types: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `chore`, `test`.

See [Commit Conventions](docs/onboarding/workflow.md#commit-conventions).

### 3. Quality Check

```bash
npm run lint     # MUST pass
npm run build    # MUST pass
npx playwright test  # MUST pass
```

### 4. PR

Open a pull request to `main`. Include what, why, and testing verification.

---

## Documentation Map

| Area | Path |
|------|------|
| **Onboarding** | [`docs/onboarding/README.md`](docs/onboarding/README.md) |
| **Setup** | [`docs/onboarding/setup.md`](docs/onboarding/setup.md) |
| **Coding Standards** | [`docs/onboarding/coding-standards.md`](docs/onboarding/coding-standards.md) |
| **Workflow** | [`docs/onboarding/workflow.md`](docs/onboarding/workflow.md) |
| **Engineering** | [`docs/engineering/README.md`](docs/engineering/) |
| **Architecture** | [`docs/engineering/architecture.md`](docs/engineering/architecture.md) |
| **Rules** | [`docs/engineering/rules.md`](docs/engineering/rules.md) |
| **QA** | [`docs/qa/README.md`](docs/qa/) |
| **Design System** | [`docs/design-system/README.md`](docs/design-system/) |
| **Full Index** | [`docs/INDEX.md`](docs/INDEX.md) |

---

## Code of Conduct

Be respectful. Assume good intent. Give constructive feedback. No personal attacks.
