# Development

## Install

```bash
npm install
cd ../studio-antonio-salvatore-calo
npm install
```

## Environment

Copy `.env.example` to `.env.local` only when testing server-side contact delivery. The supported variables are:

```text
CONTACT_EMAIL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

Without SMTP configuration, `/api/contact` returns a `mailto:` fallback. Sanity reads require no frontend environment variables; authenticated Studio operations use the Sanity CLI session.

## Frontend development

```bash
npm run dev
```

The Vite development server runs on port 3000 and listens on all interfaces.

## Validation and production build

```bash
npm run lint
npm run build
npm run preview
```

`lint` runs TypeScript with `--noEmit`. `build` creates the production Vite bundle, and `preview` serves that bundle locally.

## Standalone Sanity Studio and TypeGen

```bash
npm run typecheck
npm run schema:extract
npm run typegen
npm run dev
npm run build
```

Run these commands from `../studio-antonio-salvatore-calo`. TypeGen refreshes its `schema.json` and the frontend's authoritative `src/cms/sanity.types.ts`.

Both project import commands are intentionally omitted from the normal workflow because they mutate the remote dataset.
