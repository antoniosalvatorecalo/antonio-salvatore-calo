# Contact API Architecture

> Serverless contact form submission via Vercel API route.
> Owner: Engineering

---

## 1. Overview

The contact form uses a **dual-path submission strategy**:

1. **Primary**: POST to `/api/contact` — Vercel serverless function sends email via SMTP
2. **Fallback**: `mailto:` link — opens user's email client if API fails or SMTP is unconfigured

## 2. API Route

**File**: `api/contact.ts`

```
POST /api/contact
Content-Type: application/json

{
  "name": "string (required)",
  "projectType": "string (required)",
  "clientType": "string (required)",
  "focus": "string (required)",
  "budget": "string (required)",
  "timeline": "string (required)",
  "email": "string (required, valid email format)"
}
```

### Response

**Success (SMTP sent)**:
```json
{ "success": true, "message": "Message sent successfully." }
```

**Success (no SMTP — mailto fallback)**:
```json
{
  "success": true,
  "fallback": "mailto",
  "mailtoHref": "mailto:...?subject=...&body=..."
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error description",
  "fallback": "mailto",
  "mailtoHref": "mailto:..."
}
```

## 3. Client-Side Integration

**File**: `src/components/ui/ContactBuilder.tsx`

The `ContactBuilder` component manages the interactive sentence-builder experience. When all 7 steps are complete:

1. User clicks "Send this message"
2. State changes to `loading` — spinner shown
3. `submitToApi()` POSTs to `/api/contact`
4. On success → `success` state — thank you message shown
5. On error → `error` state — shows mailto fallback link + "start over" option
6. If API returns `fallback: "mailto"` → opens mailto link directly

### States

| State | UI |
|-------|----|
| `idle` | Sentence-builder form active |
| `loading` | Spinner + "Sending message..." text |
| `success` | "Message sent. Thank you!" + reset button |
| `error` | Error message + "Open email draft" / "Start over" |

## 4. Email Delivery

The serverless function uses **nodemailer** with SMTP configuration:

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords) and use:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`

## 5. Environment Variables

See [Environment Policy](../security/ENVIRONMENT_POLICY.md) for full details.

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTACT_EMAIL` | Yes | Recipient email address for form submissions |
| `SMTP_HOST` | No | SMTP server hostname (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP authentication username |
| `SMTP_PASS` | No | SMTP authentication password or app password |

If SMTP vars are not set, the API returns a `fallback: "mailto"` response.

## 6. Vercel Configuration

**File**: `vercel.json`

The SPA rewrite rule excludes `/api/*` so Vercel can route API requests to the serverless function:

```json
{
  "functions": {
    "api/**/*.ts": { "runtime": "@vercel/node@5" }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api|assets|favicon|robots|sitemap).*)", "destination": "/index.html" }
  ]
}
```

## 7. CSP Considerations

The `connect-src` directive in `vercel.json`'s CSP must include the deployment origin:

```
connect-src 'self' https://*.vercel.app;
```

This allows the client-side fetch to the `/api/contact` endpoint.

## 8. Security

- The API function does **not** expose the SMTP password to the client
- Input validation rejects missing/invalid fields with 400 status
- HTML escaping prevents XSS in email content
- `replyTo` is set to the submitter's email for easy responses
- Rate limiting: not implemented (consider for production)
