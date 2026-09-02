# Project Setup

> Clone, install, run, build.
> Owner: Engineering

---

## Prerequisites

| Tool | Version | Reason |
|------|---------|--------|
| Node.js | >=20 | Native ESM, modern JS |
| npm | >=10 | Package manager |
| Git | >=2.40 | Version control |

Verify:

```bash
node --version   # v20+
npm --version     # v10+
git --version     # 2.40+
```

---

## Clone & Install

```bash
git clone https://github.com/antoniosalvatorecalo/antonio-salvatore-calo.git
cd antonio-salvatore-calo
npm install
```

No `.env` files needed. No API keys. All content is local.

---

## Dev Server

```bash
npm run dev
```

Starts Vite on **port 3000**. HMR active. Open `http://localhost:3000`.

---

## Production Build

```bash
npm run build
```

Output to `dist/`. Supports:

- **Preview**: `npm run preview` — serves `dist/` locally
- **Clean**: `npm run clean` — removes `dist/`

---

## Type Check (Lint)

```bash
npm run lint
```

Runs `tsc --noEmit`. **Must pass before any commit.** Blocks deployment if red.

---

## E2E Tests

```bash
npm run build && npm run preview & npx playwright test
```

Runs Playwright against production build. Must pass before merge.

---

## Deployment

Pushed to `main` branch → Vercel auto-deploys. No manual deploy step.

See [Workflow](workflow.md) for full CI pipeline.

---

## Common Issues

| Symptom | Fix |
|---------|-----|
| Port 3000 in use | Kill process on :3000 or wait 5s — Vite retries next port |
| `tsc` errors after pull | `npm install` (deps changed) or check for new strict TS rules |
| GSAP not animating | Verify `initGSAP()` called in `main.tsx`. Check `gsap.context()` scope |
| Lenis not scrolling | Only active on desktop (>=1024px). Check column refs in `useSmoothScroll` |
| Playwright fails | Ensure `npm run build` passed first. Kill stale preview servers |
