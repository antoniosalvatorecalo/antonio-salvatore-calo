# Repository Hygiene Policy

> Ground truth for what belongs in git and what stays local.
> Owner: All Teams

---

## 1. What Gets Committed

Only **source code** and **hand-authored documentation** that is necessary to build, run, or understand the project.

| Type | Include | Examples |
|------|---------|----------|
| Source code | ✅ Always | `src/`, `index.html`, `vite.config.ts` |
| Root config | ✅ Always | `tsconfig.json`, `package.json`, `.gitignore` |
| Hand-authored docs | ✅ Always | `docs/design/`, `docs/engineering/`, `docs/product/` |
| Public assets | ✅ Always | `public/`, `src/assets/` |
| Tests | ✅ Always | `stages/`, `*.test.ts` |
| Root scripts | ✅ When project-relevant | `scripts/` (shell/build automation) |

## 2. What Stays Local (gitignored)

Anything **auto-generated**, **personal**, **ephemeral**, or **configurable per-developer**.

| Category | Pattern | Rationale |
|----------|---------|-----------|
| Dependencies | `node_modules/` | Regenerable via `npm install` |
| Build output | `dist/`, `build/` | Regenerable via `npm run build` |
| TypeScript build info | `*.tsbuildinfo` | Machine-local incremental cache |
| Test coverage | `coverage/` | Regenerable via test runner |
| Playwright artifacts | `stages/04_testing/test-results/`, `stages/04_testing/playwright-report/` | Test output, not source |
| Environment secrets | `.env`, `.env.*.local` | Credentials stay local |
| Editors | `.vscode/*` (except settings), `.idea/`, `*.swp` | Personal preference |
| AI tooling config | `.opencode/`, `.codex/`, `.qwen/`, `.mcp.json`, `skills-lock.json`, `agency-agents/`, `.witsy/` | AI tool state, per-developer context |
| AI build scripts | `_build_agency_skills.ps1` (root) | Moved to `scripts/`; root copy is legacy |
| Knowledge graph | `graphify-out/` | Auto-regenerated via `/graphify` |
| Personal vault | `Maximum Effort/` | Obsidian vault — personal notes, session logs, wiki, clippings |
| Planning state | `.planning/` | Local GSD planning workspace |
| Infrastructure | `.vercel` | Platform-local deploy config |
| Cache | `.cache/`, `*.tmp`, `*.temp` | Ephemeral |

## 3. Enforcement Rules

### 3.1 Do Not Commit
- **Personal notes, session logs, or Obsidian vaults** — belongs in `Maximum Effort/` (gitignored)
- **AI tooling state** — `.opencode/`, `.codex/`, `.qwen/`, `agency-agents/`, `skills-lock.json`, `.mcp.json`
- **Auto-generated knowledge graphs** — `graphify-out/` (regenerated on demand)
- **Machine-local caches** — `node_modules/`, `dist/`, `*.tsbuildinfo`, `coverage/`
- **Secrets** — `.env`, `.env.*.local`
- **Build scripts at root** — `_build_agency_skills.ps1` (canonical location is `scripts/`)

### 3.2 Do Commit
- Source code, tests, and public assets
- Hand-authored documentation (`docs/`)
- Project configuration (`package.json`, `tsconfig.json`, `.gitignore`, `vercel.json`)
- Scripts in `scripts/` directory (not root)

### 3.3 Before Committing
```bash
# Check what will be committed
git status

# Verify no personal/secret files leaked
git diff --cached --name-only | grep -iE '\.env|secret|personal|\.local'

# If a file was accidentally staged, unstage it
git reset -- <file>
```

## 4. Gitignore Architecture

`.gitignore` is organized into 16 sections in priority order:

```
# Dependencies
# Build output
# TypeScript
# Test coverage
# Playwright artifacts
# OS files
# Logs
# Environment files
# Editor files
# AI Tooling
# Graphify
# Obsidian vault
# Build scripts
# GSD planning
# Vercel
# Temp files
# Config
```

Any new artifact type must be added to the appropriate section. If no section fits, add a new section at the appropriate level.

## 5. Handling Violations

### Accidentally committed an artifact?

```bash
# 1. Remove from tracking without deleting the file
git rm --cached <file>

# 2. Ensure .gitignore covers it

# 3. Commit the fix
git add .gitignore && git commit -m "chore: stop tracking <file>"
```

### Accidentally committed a secret?

```bash
# 1. Rotate the secret immediately (keys, tokens, passwords)
# 2. Remove from git history (requires force push — coordinate with team)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch <file>" \
  --prune-empty --tag-name-filter cat -- --all
```

## 6. Policy Maintenance

- Review `.gitignore` when adding new tools that generate artifacts
- Review for stale entries quarterly
- Any new directory at project root must be evaluated: source or artifact?
- Update this policy doc when rules change

## 7. Current State

As of the initial audit (June 2026):
- **52 files removed from tracking**: Obsidian vault (50 files), graphify cache/output, `.mcp.json`, `skills-lock.json`, `_build_agency_skills.ps1`, `graphify-out/GRAPH_REPORT.md`
- **0 tracked secrets** in git history (verified)
- **TypeScript strict mode**: passing clean
- **`_build_agency_skills.ps1`**: canonical location is `scripts/`
