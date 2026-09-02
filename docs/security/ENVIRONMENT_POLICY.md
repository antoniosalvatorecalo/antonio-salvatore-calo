# Environment & Secrets Policy

> Ground truth for environment variables, secrets management, and credential safety.
> Owner: All Teams

---

## 1. Current State Assessment

### 1.1 Audit Results

| Check | Status | Notes |
|-------|--------|-------|
| `.env` files in repo | ✅ None found | No live env files exist |
| `VITE_` env var references | ✅ None found | No client env vars used |
| `import.meta.env` usage | ✅ None found | No env var integration |
| `process.env` usage | ✅ None found | Server-side env not applicable |
| Hardcoded API keys in source | ✅ None found | All source files clean |
| Hardcoded tokens/credentials | ✅ None found | No secrets in plaintext |
| Email addresses in source | ✅ None found | No PII leakage |
| Secrets in git history | ✅ None found | History verified clean |
| NPM dependency vulnerabilities | ⚠️ **2 found** | See §4 |
| Vite dev server binding | ⚠️ `0.0.0.0` | Standard for Vite, but note |
| CSP `'unsafe-inline'` usage | ⚠️ Permissive | See §5 |

### 1.2 Verdict

**Status**: SECURE — no secrets found, no environment variable leaks, no credentials committed. The codebase is primarily a static Vite + React portfolio with a single serverless API endpoint (`/api/contact`) for contact form submissions.

---

## 2. Environment Variable Convention

### 2.1 Vite Naming Rules

All client-exposed env vars must use the `VITE_` prefix:

```ts
// ✅ Correct — exposed to client via import.meta.env
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ Wrong — not prefixed, will be undefined at runtime
const secret = import.meta.env.SECRET_KEY;
```

### 2.2 File Priority (lowest → highest)

Vite loads env files in this order (later files override):

```
.env                          # Lowest priority, all modes
.env.local                    # Local overrides, all modes (gitignored)
.env.[mode]                   # Mode-specific (gitignored)
.env.[mode].local             # Local mode overrides (gitignored)
```

### 2.3 .env.example Rules

The only env file committed to git is `.env.example`:

- Contains every expected variable with **placeholder values**
- Includes comments explaining each variable
- Updated whenever a new env var is added to the codebase
- Never contains real secrets or production values

---

## 3. Code Rules

### 3.1 Accessing Environment Variables

```ts
// ✅ Correct — typed access via config module
// src/lib/env.ts
export const env = {
  siteUrl: import.meta.env.VITE_SITE_URL as string,
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL as string,
  gaId: import.meta.env.VITE_GA_ID as string | undefined,
};

// ❌ Wrong — inline access scattered through codebase
if (import.meta.env.VITE_SOME_FLAG === 'true') { ... }
```

### 3.2 Runtime Checks

```ts
// Required vars validation
if (!env.siteUrl) {
  throw new Error('VITE_SITE_URL is required but not set');
}

// Optional vars with defaults
const gaId = env.gaId ?? 'G-XXXXXXXXXX';
```

### 3.3 Never Do

```ts
// ❌ NEVER hardcode secrets
const API_KEY = 'sk-abc123...';

// ❌ NEVER commit .env files
// ❌ NEVER log environment variable values
console.log('API Key:', import.meta.env.VITE_API_KEY);

// ❌ NEVER pass secrets to client-side code
// (VITE_ vars are visible in the bundle — only put public data there)
```

---

## 4. Dependency Vulnerabilities

### 4.1 Current Findings (npm audit)

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| `postcss` (<8.5.10) | Moderate | XSS via unescaped `</style>` in CSS stringify output | `npm audit fix` |
| `vite` (<=6.4.1) | High | Path traversal in optimized deps `.map` handling | `npm audit fix` |
| `vite` (<=6.4.1) | High | Arbitrary file read via dev server WebSocket | `npm audit fix` |

### 4.2 Remediation Schedule

| Priority | Action | Timeline |
|----------|--------|----------|
| High | Run `npm audit fix` to patch vite vulnerabilities | Immediately |
| Moderate | Run `npm audit fix` to patch postcss vulnerability | Immediately |
| Ongoing | Run `npm audit` before every release | Per release cycle |

### 4.3 Policy

- `npm audit` runs as part of the CI pipeline (add if not present)
- Critical/High severity vulnerabilities block deployment
- Run `npm audit fix` on dependency update PRs
- Vulnerability overrides documented in `.npmrc` or `package.json`

---

## 5. Security Headers (Vercel)

### 5.1 Current Configuration

The `vercel.json` deploys with these security headers:

| Header | Value | Assessment |
|--------|-------|------------|
| `X-Frame-Options` | `DENY` | ✅ Strong — prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | ✅ Strong — prevents MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | ✅ Good — legacy XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ Good — privacy-preserving |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ Strong — no sensor access |
| `Content-Security-Policy` | See below | ⚠️ Needs hardening |

### 5.2 CSP Assessment

**Current CSP:**
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https://picsum.photos https://*;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://*.vercel.app;
frame-ancestors 'none'
```

**Issues:**
1. `'unsafe-inline'` on script-src — necessary for Vite dev but tighten for production
2. `https://*` on img-src — allows all image sources; restrict to known CDNs
3. No `upgrade-insecure-requests` — should add

**Recommended hardened CSP:**
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https://picsum.photos https://*.vercel-storage.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

Note: `'unsafe-inline'` on styles is required for Tailwind/Vite runtime injection until a nonce/hash strategy is implemented.

---

## 6. Git & Secrets Safety

### 6.1 Pre-Commit Checklist

Before every commit:

```bash
# Check for staged secrets
git diff --cached --name-only | grep -iE '\.env$|\.env\.[a-z]+$|secret|credential'

# Check diff content for hardcoded values
git diff --cached | grep -iE '(api.?key|secret|token|password)\s*[:=]\s*["'"'"']'

# Verify .env.example is the only env file being added
git diff --cached --name-only | grep -E '\.env'
```

### 6.2 If You Accidentally Commit a Secret

```bash
# 1. Rotate the secret immediately (revoke + regenerate)
# 2. Remove from tracking
git rm --cached <file>
echo "<file>" >> .gitignore

# 3. Remove from git history (⚠️ force push — coordinate with team)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch <file>" \
  --prune-empty --tag-name-filter cat -- --all

# OR use git-filter-repo (preferred for large removals)
pip install git-filter-repo
git filter-repo --path <file> --invert-paths

# 4. Force push to remote
git push origin --force --all
```

### 6.3 Git Guardian

Consider installing [truffleHog](https://github.com/trufflesecurity/trufflehog) or [ggshield](https://github.com/GitGuardian/ggshield) as a pre-commit hook:

```bash
# Install ggshield
pip install ggshield
ggshield install --hook-type pre-commit
```

---

## 7. Vercel Deployments

### 7.1 Setting Environment Variables

Environment variables for production deployments must be set in the **Vercel Dashboard**, not in `.env` files:

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable (e.g., `VITE_SITE_URL`)
3. Assign to environments: Production, Preview, Development
4. Do NOT add these to any committed file

### 7.2 Sensitive Data Categories

| Category | Example | Store In |
|----------|---------|----------|
| Public URLs | `VITE_SITE_URL` | `.env.example`, Vercel Dashboard |
| API Keys (client-safe) | `VITE_GA_ID` | `.env.example`, Vercel Dashboard |
| API Keys (secret) | `CMS_ACCESS_TOKEN` | Vercel Dashboard only (not `VITE_` prefixed) |
| SMTP Credentials | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Vercel Dashboard only (server-side only) |
| Contact Email | `CONTACT_EMAIL` | `.env.example`, Vercel Dashboard |
| Database URLs | `DATABASE_URL` | Vercel Dashboard only |
| Auth secrets | `JWT_SECRET` | Vercel Dashboard only |

---

## 8. Policy Maintenance

- Update `.env.example` when any new env var is introduced
- Run `npm audit` before every deployment
- Review this policy quarterly
- Add new dependency vulnerability findings as they surface
- If the project adds backend/server functionality, revisit this policy
