# Agent Orchestration Brief

> Comprehensive orchestrator-level instructions for AI agents working on this project.
> Previously part of root `AI.md` — moved here as part of `/docs` architecture consolidation.
> Owner: Engineering

---

## Session Start Protocol

**Execute on every session start (in order):**

1. Read `Maximum Effort/Maximum Effort/index.md` → load knowledge context.
2. Read `.planning/STATE.md` → detect GSD phase + active milestone.
3. Read `.claude/memory/MEMORY.md` → load persistent feedback + decisions.

**After significant work:** Append to `Maximum Effort/Maximum Effort/log.md` using format:
```
## [YYYY-MM-DD] [operation] | [description]
```

---

## Project Identity

| Field | Value |
|-------|-------|
| Name | Antonio Salvatore Calò — Portfolio |
| Owner | Antonio Salvatore (Salvo) — Web & UI Designer |
| Deploy | Vercel (pending Stage 03) |
| Tests | ✅ 7/7 Playwright passing |

---

## Phase Status

Track in `.planning/STATE.md` and `.planning/ROADMAP.md`. No static table — state changes per session.

---

## Obsidian Vault — `Maximum Effort/Maximum Effort/`

| File | Purpose |
|------|---------|
| `index.md` | Knowledge catalog — read on session start |
| `log.md` | Append-only operation log — write after major work |
| `CLAUDE.md` | Wiki agent schema (Wiki LLM Agent v1.0) |
| `wiki/concepts/` | Synthesized concepts |
| `wiki/sources/` | Source summaries |
| `raw/` | Source docs — NEVER MODIFY |

---

## Orchestrator System

Main Claude = orchestrator. Read `.planning/STATE.md` → detect GSD phase → spawn agents in parallel.

**GSD Phases:** DISCOVERY → DEFINITION → EXECUTION → VALIDATION

Priority chain: `.planning/` > `graphify-out/graph.json` > codebase > assumptions

### Agent Routing

| Agent | Phase | Task |
|-------|-------|------|
| `code-agent` | EXECUTION | React/Vite/TS code changes |
| `ui-agent` | DEFINITION + EXECUTION | Layout, visual, UX, tokens |
| `animation-agent` | EXECUTION | GSAP, Motion, Lenis, SplitType |
| `test-agent` | VALIDATION | Impact check, XSS, Playwright, bundle |
| `seo-agent` | DEFINITION + EXECUTION | Meta tags, schema, Core Web Vitals |
| `copy-agent` | DEFINITION + EXECUTION | Hero copy, case studies, microcopy |
| `git-agent` | EXECUTION + VALIDATION | Commits, branches, PRs |
| `morning-kickoff` | UTILITY | Daily brief + session close |

### Command Skills

| Command | Action |
|---------|--------|
| `/code` | Force code-agent |
| `/ui` | Force ui-agent |
| `/anim` | Force animation-agent |
| `/test` | Force test-agent |
| `/seo` | Force seo-agent |
| `/copy` | Force copy-agent |
| `/git` | Force git-agent |
| `/plan` | Show orchestrator plan (no execution) |
| `/run` | Full pipeline: plan + spawn all + merge |
| `/fix` | Debug root cause + fix + verify |
| `/optimize` | Performance or UI optimization |
| `/refactor` | Restructure without behavior change |
| `/build` | Generate new component/hook/system |

---

## Skill Routing

Skills are domain-based. Orchestrator uses `.claude/skills/INDEX.md` for lookup — no raw folder scanning.

**Execution flow:**
1. `/caveman` → compress task.
2. Identify domain (ANIMATION / CODE / UI / SEO / COPY / TESTING / GIT / SYSTEM).
3. Look up skill in `INDEX.md`.
4. Spawn agent with skill context.
5. If no match → `/find-skills`.

**Agents do NOT search skills directly — orchestrator only.**

Skills use domain subdirectories. Trigger format: `DOMAIN:skill-name`. Full map in `.claude/skills/INDEX.md`.

| Domain | Command Skills | Reference Skills |
|--------|---------------|-----------------|
| ANIMATION | `ANIMATION:anim` | `ANIMATION:motion-presets`, `ANIMATION:scrolltrigger-setup` |
| CODE | `CODE:code`, `CODE:build`, `CODE:fix`, `CODE:optimize`, `CODE:refactor` | `CODE:frontend-patterns` |
| UI | `UI:ui` | `UI:frontend-design`, `UI:design-system`, `UI:click-path-audit`, `UI:browser-qa` |
| SEO | `SEO:seo` | — |
| COPY | `COPY:copy` | `COPY:brand-voice` |
| TESTING | `TESTING:test` | `TESTING:e2e-testing`, `TESTING:verification-loop` |
| GIT | `GIT:git` | `GIT:git-workflow` |
| SYSTEM | `SYSTEM:plan`, `SYSTEM:run` | `SYSTEM:morning-kickoff` |

---

## Design Identity

- Brutalist aesthetic, high-contrast.
- Left column: light theme (white bg, black typography).
- Right column: dark theme.
- Typography: bold statements — no generic defaults (no Inter, no Helvetica).
- Motion: purposeful — reveal hierarchy, stage information, one memorable moment.
- Anti-patterns: no generic SaaS hero sections, no symmetric card grids, no decoration-only animation.
- **Language:** Italian primary for communication, English for code + technical docs.
- **Voice:** brutalist, minimalist, high-impact, direct — no decorative symbols in docs (Zero-Icon Policy).

---

## See Also

- [Engineering README](README.md) — architecture, stack, impact-check protocol
- [Engineering Rules](rules.md) — 6 Critical Rules, z-index system, technical debt
- [Key Files](key-files.md) — source-of-truth file map
- [Product docs](../product/) — product vision, brand, principles
- [Design docs](../design/) — design system, color tokens, components
- [QA docs](../qa/) — testing and validation
