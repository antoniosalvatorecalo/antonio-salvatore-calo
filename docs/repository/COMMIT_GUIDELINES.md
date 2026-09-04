# Commit Quality Gate Guidelines

> **Purpose**: Ensure every commit maintains repository hygiene by blocking forbidden files and providing clear developer feedback.
> **Owner**: All Developers
> **Scope**: All commits to any branch

---

## How the Gate Works

The project ships a **Node.js pre-commit hook** that inspects staged files before every commit.

**Flow:**
```
$ git commit -m "feat: add hero animation"
    ↓
pre-commit hook runs (Node.js)
    ↓
Check 1: Forbidden file types?    → BLOCKED
Check 2: Forbidden directories?   → BLOCKED
Check 3: Images in wrong place?   → BLOCKED
    ↓
All clean → commit proceeds
```

### What Gets Blocked

| Category | Examples | Why |
|----------|----------|-----|
| **Build output** | `dist/`, `build/` | Regenerable, bloats repo |
| **Dependencies** | `node_modules/` | Managed by lockfile |
| **Cache/coverage** | `.tsbuildinfo`, `.cache/`, `coverage/` | Machine-local |
| **Logs/temp** | `*.log`, `*.tmp`, `*~` | Accidental artifacts |
| **OS metadata** | `.DS_Store`, `Thumbs.db` | Platform noise |
| **AI runtimes** | `.opencode/`, `.codex/`, `.qwen/`, `.witsy/`, `.windsurf/`, `.aider/`, `.cursor/`, `.agent/` | Tool-specific |
| **AI output** | `graphify-out/` | Auto-generated |
| **AI config** | `skills-lock.json`, `.mcp.json` | Machine-local |
| **AI build script** | `_build_agency_skills.ps1` | One-time setup |
| **External AI repos** | `agency-agents/` | Externally cloned |
| **Environment** | `.env`, `.env.*` (except `.env.example`) | Secrets |
| **Editor config** | `.vscode/`, `.idea/`, `*.swp` | Personal prefs |
| **Planning/vault** | `.planning/`, `.vercel` | Process artifacts |
| **Images outside assets** | `*.png`, `*.jpg`, `*.webp`, `*.svg` not in `public/` or `src/assets/` | Asset hygiene |
| **Test artifacts** | `stages/04_testing/` | Phase output |

### What Gets a Warning (Not Blocked)

| Category | Examples | Why |
|----------|----------|-----|
| **Large files** | >1MB | Review intentionality |
| **Binary files** | `*.psd`, `*.zip` | Verify necessity |
| **Loose test artifacts** | `test-*.png` in root | Move to proper location |

---

## Bypass Procedures

### Per-commit bypass (emergency only)

```bash
git commit --no-verify -m "hotfix: critical prod issue"
```

**When allowed:**
- Production incident that requires immediate fix
- CI/CD is broken and the hook prevents fixing it
- Temporary workaround while updating the gate itself

**When NOT allowed:**
- Common workflow — use it rarely
- "I'll clean it up later" — you won't. Fix and commit properly.

### Permanent disable

```bash
git config --local --add core.hooksPath /dev/null
```

This makes `git commit` skip all hooks globally for this repo. **Not recommended** — you lose pipeline enforcement.

---

## Install & Verify

### First-time setup (every developer)

```bash
npm run hooks:install
```

Installs the pre-commit hook to `.git/hooks/pre-commit`.

### Check entire working tree

```bash
npm run hooks:check
```

Scans all files (not just staged) — useful before PRs to catch lingering artifacts.

### Verify the hook is active

```bash
ls -la .git/hooks/pre-commit
```

Should show a file (shell script or `.cmd` on Windows). If missing, re-run `npm run hooks:install`.

---

## Developer Workflow

```
$ git add src/components/Hero.tsx
$ git commit -m "feat: add hero animation"
── Commit Quality Gate ──────────────────────────────────
  Checking staged changes...
  ✓ Commit gate passed
[branch abc1234] feat: add hero animation

$ git add dist/bundle.js
$ git commit -m "fix: patch"
── Commit Quality Gate ──────────────────────────────────
  Checking staged changes...
  ✗ BLOCKED  dist/bundle.js  (build output, use .gitignore)
  → Add to .gitignore or remove from staging
  ✗ 1 BLOCKED — commit rejected

$ git reset dist/bundle.js
$ git commit -m "fix: patch"
  ✓ Commit gate passed
```

---

## Implementation Details

- **Canonical gate**: `scripts/git-hooks/pre-commit-check.mjs` — versioned in repo, shared to all developers
- **Active hook**: `.git/hooks/pre-commit` — local install, managed by `npm run hooks:install`
- **Cross-platform**: POSIX shell script (`#!/bin/sh`) — works on macOS, Linux, and Git Bash for Windows
- **Self-installer**: `npm run hooks:install` generates the hook file from the Node.js script
- **Standalone check**: `npm run hooks:check` runs the same checks against the full working tree (useful for CI)

---

## Related

| Document | Purpose |
|----------|---------|
| [`docs/repository/REPOSITORY_POLICY.md`](./REPOSITORY_POLICY.md) | Git hygiene, branching, PR workflow |
| [`docs/ai/AI_REPOSITORY_POLICY.md`](../ai/AI_REPOSITORY_POLICY.md) | AI artifact classification and handling |
| [`.gitignore`](../../.gitignore) | Git ignore patterns |
