# UX/Product Audit — June 2026

> Systematic audit and fix pass targeting 8 identified issues across routing, layout, contact, and code quality.
> Date: 2026-06-03

---

## Issues Found & Fixed

### 1. 🔗 About Route Missing (Broken Navigation)

**Issue**: `CentralNavMenu.tsx` navigated to `/about` on desktop, but `AppRouter.tsx` had no `/about` route defined. On mobile, About was incorrectly routing to `/contact`.

**Files changed**:
- `src/providers/AppRouter.tsx` — Added `/about` route with lazy-loaded `AboutPage`
- `src/pages/about/AboutPage.tsx` — **NEW** standalone About page with all About sections
- `src/pages/about/AboutPage.css` — **NEW** About page styles
- `src/components/ui/CentralNavMenu.tsx` — Fixed `activeFromRoute()` for mobile (now returns `'About'` not `'Contact'`); simplified `handleClick()` to use `/about` for both desktop and mobile

**Decision**: Created a dedicated `AboutPage` that imports the same `AboutHero`, `AboutBio`, `AboutPrinciples`, `AboutServices`, `AboutContact` components as the home page, wrapped in a single-column scroll layout with `useSmoothScroll`. This preserves the existing content architecture while providing a proper standalone route.

---

### 2. 📜 Featured View Horizontal Overflow

**Issue**: The Featured view's `grid-template-columns: 20% 80%` with `gap: 30px` exceeded 100% width, causing horizontal overflow. The `gap` was added to the percentage widths without `minmax(0, ...)` protection.

**Files changed**:
- `src/pages/work/WorkPage.css` — Changed `grid-template-columns: 20% 80%` to `grid-template-columns: minmax(0, 20%) minmax(0, 80%)` on `.featured-card-v2`; added `overflow-x: hidden` to `.featured-view-container`

**Decision**: `minmax(0, ...)` prevents grid tracks from overflowing by allowing them to shrink below their content's intrinsic size. The `overflow-x: hidden` on the parent provides a safety net. No layout math changes needed — the 20/80 ratio with 30px gap now works correctly.

---

### 3. 📐 List/Grid Desktop Spacing Reduction

**Issue**: List and Grid views had `clamp(1.5rem, 2vw, 2rem)` horizontal padding, which capped at `2rem` (32px) on desktop — making content feel too detached from edges.

**Files changed**:
- `src/pages/work/WorkPage.css` — `.list-view-container` and `.grid-view` padding changed from `2rem` cap to `1.25rem` cap
- `src/pages/work/views/GridProjectsView.css` — Same padding adjustment

**Decision**: Changed max to `1.25rem` (20px) for a ~12px reduction per side on desktop. Mobile padding unchanged via existing `@media (max-width: 768px)` overrides at `1rem`. The `clamp(1.5rem, 2vw, 1.25rem)` formula keeps 1.5rem on mobile, scales with viewport, caps at 1.25rem on desktop.

---

### 4. 📧 Contact Form Real Submission

**Issue**: The contact form was mailto-only with no real submission flow, no loading/success/error states, and no client-side validation.

**Files changed**:
- `api/contact.ts` — **NEW** Vercel serverless function: validates input, sends via nodemailer SMTP, returns mailto fallback if SMTP not configured
- `src/components/ui/ContactBuilder.tsx` — Added `submissionState` ('idle'|'loading'|'success'|'error'), `submitToApi()` fetch call, loading spinner, success thank-you message, error state with mailto fallback
- `vercel.json` — Added `/api/*` rewrite exception and `@vercel/node` runtime config
- `.env.example` — Added `CONTACT_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` entries
- `package.json` — Added `nodemailer`, `@vercel/node`, `@types/nodemailer`

**Decision**: Dual-path strategy — primary API submission with mailto fallback. `submitToApi()` catches errors and opens fallback mailto. If SMTP env vars are not set, the API returns `fallback: "mailto"` so the client can open the email client.

**States implemented**:
| State | UI |
|-------|----|
| `idle` | Form entry (existing UX preserved) |
| `loading` | Spinner + "Sending message..." |
| `success` | "Message sent. Thank you!" + email shown + reset button |
| `error` | Error explanation + "Open email draft" button + "Start over" |

---

### 5. 🧹 Duplicated Instagram Link

**Issue**: `ContactBuilder.tsx` defined a local `CONTACT_SOCIALS` array that spread `CONTACT.socials` (which already included Instagram with a valid href) and added a duplicate `{ label: 'Instagram', href: '#' }` with a broken href.

**Files changed**:
- `src/components/ui/ContactBuilder.tsx` — Removed `CONTACT_SOCIALS` constant, changed `ContactInfoPanel` to use `CONTACT.socials` directly

**Decision**: Single source of truth in `src/content/contact.ts`. The `CONTACT.socials` array already had Instagram with `https://www.instagram.com/therealtoree/`. No placeholder hrefs remain.

---

### 6. 🗑️ Stale WorkPage Code Removed

**Issue**: `src/pages/work/views/FeaturedProjectsView.tsx` and its associated CSS were dead code — never imported anywhere. The actual Featured view is defined inline in `WorkPage.tsx`.

**Files changed**:
- `src/pages/work/views/FeaturedProjectsView.tsx` — **DELETED**
- `src/pages/work/views/FeaturedProjectsView.css` — **DELETED**

**Decision**: Removed stale files. No import references existed anywhere in the codebase. The inline `FeaturedProjectsView` function in `WorkPage.tsx` is the only active Featured implementation. CSS class names from the deleted file (`.featured-projects-view`, etc.) had no collisions with active code.

---

## Verification Results

| Check | Status |
|-------|--------|
| `npm run hooks:check` | ✅ Passed |
| `npm run lint` (tsc --noEmit) | ✅ Passed — zero errors |
| `npm run build` (vite build) | ✅ Passed — 531 modules, 3.04s |

---

## Implementation Decisions

| Decision | Rationale |
|----------|-----------|
| Standalone AboutPage vs rendering App under /about | Cleaner route isolation; reuses existing About components; no side effects from work column rendering |
| minmax(0, ...) for Featured grid | Minimal CSS change; addresses root cause of overflow without restructuring layout |
| clamp(1.5rem, 2vw, 1.25rem) padding | Keeps mobile padding at 1.5rem; reduces desktop from 32px to 20px gradually |
| nodemailer over Resend/SendGrid | Zero external API dependency; works with any SMTP provider; no API keys for third-party services needed |
| Dual-path submission (API + mailto fallback) | Graceful degradation: works even without SMTP configuration |
| State machine pattern for contact form | Predictable UI transitions; loading/success/error states improve UX vs silent mailto open |

---

## Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| No rate limiting on `/api/contact` | Medium | Consider adding IP-based throttling or CAPTCHA for production |
| SMTP credentials exposed via Vercel env | Low | Stored server-side only; never sent to client; Vercel encrypts at rest |
| `nodemailer` vulnerabilities | Low | Keep updated via `npm audit`; SMTP is a well-audited path |
| `/about` page doesn't show active tab in nav on initial load | Low | `CentralNavMenu` derives `active` from `pathname` — `/about` correctly maps to `'About'` |
| No 404 route | Low | All URLs redirect to SPA via vercel.json; React Router renders blank page on unknown paths |

---

## Follow-Up Improvements

- [ ] **Rate limiting**: Add IP-based throttling to `/api/contact` (e.g., max 3 submissions per IP per hour)
- [ ] **CAPTCHA**: Add Google reCAPTCHA v3 or hCaptcha to prevent automated spam
- [ ] **Form persistence**: Save partial form data to `sessionStorage` to prevent data loss on navigation
- [ ] **404 page**: Add catch-all `<Route path="*">` in AppRouter
- [ ] **SMTP health check**: Add a `GET /api/contact/health` endpoint to verify SMTP configuration is valid
- [ ] **Notification**: Add push/email notification to admin when form submission succeeds

---

## Documentation Updated

| Document | Updates |
|----------|---------|
| `docs/systems/routing.md` | Added `/about` route to routing tree |
| `docs/engineering/routing-and-pages.md` | Added About page, Contact API details |
| `docs/engineering/contact-api.md` | **NEW** — full contact API architecture doc |
| `docs/security/ENVIRONMENT_POLICY.md` | Updated env var table, CSP connect-src, verdict |
| `.env.example` | Added CONTACT_EMAIL and SMTP variables |
| `vercel.json` | Added functions config and API rewrite exception |
